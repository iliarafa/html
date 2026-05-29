// Client-side image processing for uploads: downscale via canvas and encode to a
// base64 data URI so images are embedded (offline-safe) and kept on-device. The
// dimension/size math is factored out as pure functions for testing (canvas itself
// isn't available in jsdom).

export const MAX_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 1_500_000; // ~1.5MB per image

/** Scale (w,h) so the longest edge is at most maxEdge, preserving aspect ratio. */
export function fitDimensions(
  w: number,
  h: number,
  maxEdge = MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(w, h);
  if (longest <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / longest;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Approximate decoded byte size of a base64 data URI. */
export function dataUriBytes(dataUri: string): number {
  const comma = dataUri.indexOf(",");
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export interface ProcessedImage {
  dataUri: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Read an image file, downscale it to <= MAX_EDGE, and encode as a JPEG data URI.
 * Throws if the file isn't an image or the result exceeds MAX_UPLOAD_BYTES.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");

  const bitmap = await createImageBitmap(file);
  const { width, height } = fitDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // PNGs with transparency would render black on JPEG; if the source was PNG/webp
  // and small, keep PNG, otherwise JPEG for size. Simple heuristic: try JPEG.
  const dataUri = canvas.toDataURL("image/jpeg", 0.82);
  const bytes = dataUriBytes(dataUri);
  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image is too large after compression (${(bytes / 1e6).toFixed(1)}MB). Try a smaller image.`,
    );
  }
  return { dataUri, width, height, bytes };
}

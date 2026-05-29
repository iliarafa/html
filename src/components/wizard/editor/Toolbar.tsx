"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { processImageFile } from "@/lib/images/process";

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`h-8 min-w-8 rounded px-2 text-sm font-medium transition ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-zinc-200" />;

export default function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState<string | null>(null);

  const chain = () => editor.chain().focus();

  async function onPickImage(file: File) {
    setImgError(null);
    try {
      const { dataUri, alt } = await processImageFile(file).then((r) => ({
        dataUri: r.dataUri,
        alt: file.name.replace(/\.[^.]+$/, ""),
      }));
      chain()
        .insertContent({
          type: "imageFigure",
          attrs: { src: dataUri, alt },
          content: [{ type: "text", text: alt }],
        })
        .run();
    } catch (e) {
      setImgError((e as Error).message);
    }
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-zinc-200 bg-white/95 px-2 py-1.5 backdrop-blur">
      <Btn onClick={() => chain().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <b>B</b>
      </Btn>
      <Btn onClick={() => chain().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <i>I</i>
      </Btn>
      <Btn onClick={() => chain().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
        {"<>"}
      </Btn>
      <Sep />
      <Btn onClick={() => chain().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        H2
      </Btn>
      <Btn onClick={() => chain().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        H3
      </Btn>
      <Btn onClick={() => chain().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        •
      </Btn>
      <Btn onClick={() => chain().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        1.
      </Btn>
      <Btn onClick={() => chain().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        ❝
      </Btn>
      <Btn onClick={() => chain().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
        {"{ }"}
      </Btn>
      <Sep />
      {/* Insert blocks */}
      <Btn
        onClick={() =>
          chain()
            .insertContent({ type: "callout", attrs: { variant: "info" }, content: [{ type: "paragraph" }] })
            .run()
        }
        title="Callout"
      >
        ⓘ Callout
      </Btn>
      <Btn
        onClick={() => chain().insertContent({ type: "quoteCard", content: [{ type: "paragraph" }] }).run()}
        title="Quote card"
      >
        ❞ Quote
      </Btn>
      <Btn
        onClick={() =>
          chain()
            .insertContent({
              type: "columns",
              content: [
                { type: "column", content: [{ type: "paragraph" }] },
                { type: "column", content: [{ type: "paragraph" }] },
              ],
            })
            .run()
        }
        title="Two columns"
      >
        ▥ Columns
      </Btn>
      <Btn
        onClick={() =>
          chain()
            .insertContent({ type: "collapsible", attrs: { summary: "Details" }, content: [{ type: "paragraph" }] })
            .run()
        }
        title="Collapsible"
      >
        ▸ Collapse
      </Btn>
      <Btn
        onClick={() =>
          chain()
            .insertContent({
              type: "tabs",
              content: [
                { type: "tabPanel", attrs: { label: "Tab 1" }, content: [{ type: "paragraph" }] },
                { type: "tabPanel", attrs: { label: "Tab 2" }, content: [{ type: "paragraph" }] },
              ],
            })
            .run()
        }
        title="Tabs"
      >
        ⊟ Tabs
      </Btn>
      <Btn onClick={() => chain().setHorizontalRule().run()} title="Divider">
        ―
      </Btn>
      <Btn onClick={() => fileRef.current?.click()} title="Insert image">
        🖼 Image
      </Btn>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickImage(f);
          e.target.value = "";
        }}
      />
      {/* Contextual: callout variant */}
      {editor.isActive("callout") && (
        <>
          <Sep />
          {(["info", "success", "warn", "danger"] as const).map((v) => (
            <Btn
              key={v}
              onClick={() => chain().updateAttributes("callout", { variant: v }).run()}
              title={`Callout: ${v}`}
            >
              {v}
            </Btn>
          ))}
        </>
      )}
      {imgError && <span className="ml-2 text-xs text-rose-500">{imgError}</span>}
    </div>
  );
}

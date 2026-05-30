import ModeRouter from "@/components/ModeRouter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
            ◐
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-zinc-900">
              Notes → Shareable HTML
            </h1>
            <p className="text-xs leading-tight text-zinc-500">
              Paste, upload, or link — get one self-contained file to share.
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <ModeRouter />
      </main>
    </div>
  );
}

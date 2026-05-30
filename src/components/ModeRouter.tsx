"use client";

import { useState } from "react";
import Wizard from "./wizard/Wizard";
import AiWizard from "./ai/AiWizard";

type Mode = "quick" | "ai";

export default function ModeRouter() {
  const [mode, setMode] = useState<Mode>("quick");

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          <Tab active={mode === "quick"} onClick={() => setMode("quick")} title="Quick">
            <span className="font-semibold">Quick</span>
            <span className="ml-1.5 text-xs text-zinc-400">offline file</span>
          </Tab>
          <Tab active={mode === "ai"} onClick={() => setMode("ai")} title="AI design">
            <span className="font-semibold">✨ AI design</span>
            <span className="ml-1.5 text-xs text-zinc-400">bespoke page</span>
          </Tab>
        </div>
      </div>

      {mode === "quick" ? <Wizard /> : <AiWizard />}
    </div>
  );
}

function Tab({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg px-4 py-2 text-sm transition ${
        active ? "bg-emerald-500 text-white" : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

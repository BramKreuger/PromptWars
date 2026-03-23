"use client";

import { useState } from "react";

interface PromptEditorProps {
  onSubmit: (prompt: string) => void;
  previousPrompt?: string | null;
  disabled?: boolean;
  submitted?: boolean;
}

export function PromptEditor({
  onSubmit,
  previousPrompt,
  disabled = false,
  submitted = false,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(previousPrompt || "");

  function handleSubmit() {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  }

  return (
    <div className="panel-retro">
      <label className="mb-2 block text-xs text-[var(--color-retro-muted)]">
        Your instructions to your AI agent:
      </label>
      <textarea
        className="min-h-[100px] w-full resize-y bg-[var(--color-retro-bg)] p-3 text-xs leading-relaxed text-[var(--color-retro-text)] outline-none"
        placeholder="Tell your character what to do this round..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={disabled}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[var(--color-retro-muted)]">
          {prompt.length} chars
        </span>
        <button
          className="btn-retro"
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
        >
          {submitted ? "Update Prompt" : "Lock In Prompt"}
        </button>
      </div>
      {submitted && (
        <p className="mt-2 text-xs text-[var(--color-retro-success)]">
          Prompt submitted! You can still edit until time runs out.
        </p>
      )}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  unlockPreview,
  type UnlockState,
} from "@/app/maintenance/actions";

export function PreviewUnlock() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<UnlockState, FormData>(
    unlockPreview,
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="type-eyebrow mt-8 text-xs font-medium text-white/45 transition-colors hover:text-white/80"
      >
        Have a secret code?
      </button>
    );
  }

  return (
    <form action={action} className="mt-8 w-full max-w-xs">
      <label htmlFor="preview-code" className="sr-only">
        Secret code
      </label>
      <div className="flex items-baseline gap-3">
        <input
          ref={inputRef}
          id="preview-code"
          name="code"
          type="password"
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
          placeholder="Code"
          className="min-w-0 flex-1 border-0 border-b border-white/30 bg-transparent py-2 font-swiss text-sm tracking-tight text-white placeholder:text-white/30 focus:border-white focus:outline-none focus-visible:border-brand-red disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 font-swiss text-xs font-bold uppercase tracking-widest text-white/55 transition-colors hover:text-white disabled:opacity-50"
        >
          Enter
        </button>
      </div>
      {state?.error ? (
        <p className="mt-2 font-swiss text-xs text-brand-red-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start justify-center bg-background px-6 pb-24 pt-32 font-swiss text-foreground md:p-10 md:pt-44"
    >
      <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
        Error
      </p>
      <h1 className="mt-4 text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-none tracking-tighter uppercase">
        Something went wrong
      </h1>
      <p className="mt-6 max-w-md font-alt text-base leading-relaxed text-muted-foreground">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="bg-foreground px-6 py-3 font-swiss text-sm font-medium tracking-widest text-background uppercase transition-opacity hover:opacity-80"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-foreground px-6 py-3 font-swiss text-sm font-medium tracking-widest uppercase transition-opacity hover:opacity-80"
        >
          Home
        </Link>
      </div>
    </main>
  );
}

import type { ReactNode } from "react";

const PAGE_SHELL_CLASS =
  "relative w-full min-h-screen bg-background text-foreground pt-32 pb-24 px-6 md:p-10 md:pt-44";

const PAGE_SHELL_DARK_CLASS =
  "relative w-full min-h-screen bg-black text-white";

type PageShellProps = {
  children: ReactNode;
  /** Dark store/bag/staff shells that ignore theme tokens */
  variant?: "default" | "dark";
  className?: string;
  id?: string;
};

export function PageShell({
  children,
  variant = "default",
  className = "",
  id = "main-content",
}: PageShellProps) {
  const base = variant === "dark" ? PAGE_SHELL_DARK_CLASS : PAGE_SHELL_CLASS;
  return (
    <main id={id} className={`${base} ${className}`.trim()}>
      {children}
    </main>
  );
}

export { PAGE_SHELL_CLASS, PAGE_SHELL_DARK_CLASS };

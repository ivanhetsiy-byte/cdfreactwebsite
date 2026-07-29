import type { ButtonHTMLAttributes, ReactNode } from "react";

const SWISS_BUTTON_CLASS =
  "inline-flex items-center justify-center bg-foreground px-6 py-3 font-swiss text-sm font-medium tracking-widest text-background uppercase transition-opacity hover:opacity-80 disabled:opacity-50";

const STORE_BUTTON_CLASS =
  "inline-flex items-center justify-center border border-white bg-white px-6 py-3 font-swiss text-sm font-medium tracking-[0.18em] text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-50";

type SwissButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "swiss" | "store";
  href?: string;
};

export function SwissButton({
  children,
  variant = "swiss",
  className = "",
  href,
  ...props
}: SwissButtonProps) {
  const base = variant === "store" ? STORE_BUTTON_CLASS : SWISS_BUTTON_CLASS;
  const classes = `${base} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}

export { SWISS_BUTTON_CLASS, STORE_BUTTON_CLASS };

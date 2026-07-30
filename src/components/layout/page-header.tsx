import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
  titleId?: string;
};

/** Oversized Swiss page title + optional lede column (about/contact pattern). */
export function PageHeader({ title, children, titleId }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
      <h1
        id={titleId}
        className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold leading-[0.9] tracking-tighter uppercase md:text-[11.5vw]"
      >
        {title}
      </h1>
      {children ? (
        <div className="flex max-w-[28rem] shrink-0 gap-5 md:max-w-[32rem] md:pt-[1.5vw]">
          <div
            aria-hidden
            className="mt-1 hidden h-[11rem] w-px shrink-0 bg-foreground md:block"
          />
          <div className="font-alt text-[clamp(1rem,1.2vw,1.25rem)] leading-[1.5] tracking-tight text-muted-foreground md:border-t-0">
            {children}
          </div>
        </div>
      ) : null}
    </header>
  );
}

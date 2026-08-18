"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FadeInBlock } from "@/components/ui/fade-in-text";
import { HoverText } from "@/components/ui/hover-text";
import { useDelayedNavigation } from "@/hooks/useDelayedNavigation";

function useFooterCta() {
  const pathname = usePathname();
  const go = useDelayedNavigation();

  const cta =
    pathname === "/contact"
      ? { href: "/about", left: "Learn more", right: "→ About" }
      : pathname === "/about"
        ? { href: "/classes", left: "Check Out", right: "→ Classes" }
        : pathname === "/classes"
          ? { href: "/contact", left: "Send Us a Message", right: "→ Contact" }
          : { href: "/contact", left: "Train", right: "→ Contact" };

  return { go, cta, isClasses: pathname === "/classes" };
}

/**
 * Full-bleed next-page bar. Copy follows the current route (Train / Contact
 * on home, message CTA on classes, About/Classes handoffs on contact/about).
 */
export function FooterCta({ forceDark = false }: { forceDark?: boolean }) {
  const { go, cta, isClasses } = useFooterCta();

  return (
    <Link
      href={cta.href}
      onClick={(e) => {
        e.preventDefault();
        go(cta.href);
      }}
      data-site-footer-cta
      className={
        forceDark
          ? "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between gap-3 border-t border-b border-white/20 bg-black px-5 text-white transition-colors duration-300 hover:border-brand-red hover:bg-brand-red md:h-[150px] md:px-8 lg:px-10"
          : "group relative z-10 flex h-[110px] w-full cursor-pointer items-center justify-between gap-3 border-t border-b border-black/20 bg-white px-5 text-black transition-colors duration-300 hover:border-brand-red hover:bg-brand-red hover:text-white dark:border-white/20 dark:bg-black dark:text-white md:h-[150px] md:px-8 lg:px-10"
      }
    >
      <span className="min-w-0 font-swiss text-[2.25rem] leading-none font-medium tracking-tight md:text-[4rem]">
        {isClasses ? (
          <>
            <span className="md:hidden">
              <FadeInBlock as="span">
                <HoverText>Message Us</HoverText>
              </FadeInBlock>
            </span>
            <span className="hidden md:inline-block">
              <FadeInBlock as="span">
                <HoverText>{cta.left}</HoverText>
              </FadeInBlock>
            </span>
          </>
        ) : (
          <FadeInBlock as="span">
            <HoverText>{cta.left}</HoverText>
          </FadeInBlock>
        )}
      </span>
      <span className="shrink-0 font-swiss text-[2.25rem] leading-none font-medium tracking-tight md:text-[4rem]">
        {isClasses ? (
          <>
            <span className="md:hidden">
              <FadeInBlock as="span">
                <HoverText>Contact→</HoverText>
              </FadeInBlock>
            </span>
            <span className="hidden md:inline-block">
              <FadeInBlock as="span">
                <HoverText>{cta.right}</HoverText>
              </FadeInBlock>
            </span>
          </>
        ) : (
          <FadeInBlock as="span">
            <HoverText>{cta.right}</HoverText>
          </FadeInBlock>
        )}
      </span>
    </Link>
  );
}

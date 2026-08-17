"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { FadeInBlock, FadeInText } from "@/components/ui/fade-in-text";
import { HoverText } from "@/components/ui/hover-text";
import {
  SOCIAL_URLS,
  STUDIO_MAPS_URL,
  STUDIO_PHONE_DISPLAY,
  STUDIO_PHONE_TEL,
  STUDIO_STREET,
} from "@/lib/site-links";

const COL_LABEL =
  "mb-5 font-swiss text-[11px] font-normal uppercase tracking-[0.2em] text-foreground/40";
const COL_LINK =
  "group inline-block w-fit font-swiss text-[1.35rem] font-medium leading-tight tracking-tight text-foreground home-md:text-[1.65rem]";
const META_LINK =
  "group inline-block font-swiss text-[10px] font-normal leading-none text-foreground/55 home-md:text-[12px] home-lg:text-[16px]";

function FooterColumn({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <FadeInText as="p" className={COL_LABEL}>
        {label}
      </FadeInText>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
  className = COL_LINK,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const content = <HoverText>{children}</HoverText>;
  const isInternal = href.startsWith("/");
  const isHttp = href.startsWith("http");

  if (isInternal) {
    return (
      <FadeInBlock>
        <Link href={href} className={className}>
          {content}
        </Link>
      </FadeInBlock>
    );
  }

  return (
    <FadeInBlock>
      <a
        href={href}
        className={className}
        {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    </FadeInBlock>
  );
}

/**
 * Site-wide footer — Explore / Connect / Contact columns above the
 * oversized CDF wordmark. Hover roll matches Flexion; palette stays Swiss B&W.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      aria-label="Footer"
      className="flex min-h-screen w-full flex-col justify-end bg-background pt-16 text-foreground home-lg:min-h-screen home-lg:pt-24"
    >
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 px-6 pb-16 home-md:grid-cols-3 home-md:gap-8 home-md:px-12 home-md:pb-24">
        <FooterColumn label="Explore">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/classes">Classes</FooterLink>
          <FooterLink href="/staff">Staff</FooterLink>
        </FooterColumn>

        <FooterColumn label="Connect">
          <FooterLink href={SOCIAL_URLS.instagram}>Instagram</FooterLink>
          <FooterLink href={SOCIAL_URLS.tiktok}>TikTok</FooterLink>
          <FooterLink href={SOCIAL_URLS.facebook}>Facebook</FooterLink>
          <FooterLink href={SOCIAL_URLS.youtube}>YouTube</FooterLink>
        </FooterColumn>

        <FooterColumn label="Contact">
          <FooterLink href="/contact">Reach out</FooterLink>
          <FooterLink href={STUDIO_MAPS_URL} className={`${COL_LINK} max-w-[16ch]`}>
            {STUDIO_STREET}
            <br />
            Philadelphia, PA 19116
          </FooterLink>
          <FooterLink href={STUDIO_PHONE_TEL}>{STUDIO_PHONE_DISPLAY}</FooterLink>
        </FooterColumn>
      </div>

      <div className="w-full overflow-x-clip px-2 home-md:px-3">
        <FadeInText
          as="p"
          overflowHidden={false}
          stagger={0.08}
          className="w-full font-swiss text-[48.33vw] font-bold leading-[0.8] tracking-tighter whitespace-nowrap"
        >
          CDF
        </FadeInText>
      </div>

      <div className="flex w-full items-baseline justify-between gap-4 px-6 pt-3 pb-6 home-md:px-12 home-md:pb-8">
        <div className="flex items-baseline gap-5">
          <FooterLink href="/privacy" className={META_LINK}>
            Privacy Policy
          </FooterLink>
          <FooterLink href="/imprint" className={META_LINK}>
            Imprint
          </FooterLink>
        </div>
        <FadeInText as="p" className={`${META_LINK} text-right`}>
          {`© ${year} Childrens Dance Factory`}
        </FadeInText>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";

import { FadeInText } from "@/components/ui/fade-in-text";
import { MOTION_MQ, prefersReducedMotion } from "@/lib/motion-env";

export type FlowingMenuItem = {
  link: string;
  text: string;
  image: string;
};

type FlowingMenuProps = {
  items?: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
};

type MenuItemProps = FlowingMenuItem & {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
  isOpen: boolean;
  onOpen: () => void;
};

const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: "expo" };

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOTION_MQ.coarse).matches;
}

function findClosestEdge(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
): "top" | "bottom" {
  const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
  const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
}

function MenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
  isOpen,
  onOpen,
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const wasOpenRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      const marqueeContent = marqueeInnerRef.current?.querySelector(
        ".marquee-part",
      ) as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;
      const needed = Math.ceil(window.innerWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".marquee-part",
      ) as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      animationRef.current?.kill();
      if (prefersReducedMotion()) {
        animationRef.current = null;
        gsap.set(marqueeInnerRef.current, { x: 0 });
        return;
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);
    return () => {
      window.clearTimeout(timer);
      animationRef.current?.kill();
      animationRef.current = null;
    };
  }, [text, image, repetitions, speed]);

  useEffect(() => {
    return () => {
      animationRef.current?.kill();
      if (marqueeRef.current) gsap.killTweensOf(marqueeRef.current);
      if (marqueeInnerRef.current) gsap.killTweensOf(marqueeInnerRef.current);
    };
  }, []);

  const playEnter = (clientX: number, clientY: number) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      clientX - rect.left,
      clientY - rect.top,
      rect.width,
      rect.height,
    );

    if (prefersReducedMotion()) {
      gsap.set([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
      return;
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const playLeave = (clientX: number, clientY: number) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      clientX - rect.left,
      clientY - rect.top,
      rect.width,
      rect.height,
    );

    if (prefersReducedMotion()) {
      gsap.set(marqueeRef.current, { y: "101%" });
      gsap.set(marqueeInnerRef.current, { y: "-101%" });
      return;
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  useEffect(() => {
    if (!isCoarsePointer()) return;
    if (isOpen && !wasOpenRef.current) {
      playEnter(lastPointRef.current.x, lastPointRef.current.y);
    } else if (!isOpen && wasOpenRef.current) {
      playLeave(lastPointRef.current.x, lastPointRef.current.y);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleMouseEnter = (ev: MouseEvent<HTMLAnchorElement>) => {
    if (isCoarsePointer()) return;
    playEnter(ev.clientX, ev.clientY);
  };

  const handleMouseLeave = (ev: MouseEvent<HTMLAnchorElement>) => {
    if (isCoarsePointer()) return;
    playLeave(ev.clientX, ev.clientY);
  };

  const handleClick = (ev: MouseEvent<HTMLAnchorElement>) => {
    if (!isCoarsePointer()) return;
    if (isOpen) return;
    ev.preventDefault();
    lastPointRef.current = { x: ev.clientX, y: ev.clientY };
    onOpen();
  };

  return (
    <div
      ref={itemRef}
      className="relative overflow-hidden text-center"
      style={{
        borderTop: isFirst ? "none" : `1px solid ${borderColor}`,
      }}
    >
      <Link
        href={link}
        aria-expanded={isOpen}
        className="relative flex h-[clamp(3.75rem,15vw,4.75rem)] cursor-pointer items-center justify-center overflow-hidden no-underline home-md:h-[77px] home-lg:h-[114px]"
        style={{ color: textColor }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <FadeInText
          as="span"
          className="relative z-0 font-swiss text-[clamp(2.75rem,11.5vw,3.25rem)] font-normal uppercase leading-none home-md:text-[58px] home-lg:text-[75px]"
        >
          {text}
        </FadeInText>
        <div
          ref={marqueeRef}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          style={{
            backgroundColor: marqueeBgColor,
            transform: "translateY(101%)",
          }}
        >
          <div
            ref={marqueeInnerRef}
            className="flex h-full w-max items-center"
          >
            {Array.from({ length: repetitions }, (_, idx) => (
              <div
                key={idx}
                className="marquee-part flex h-full shrink-0 items-center whitespace-nowrap px-[1.5vw] font-swiss text-[clamp(2.75rem,11.5vw,3.25rem)] font-normal uppercase leading-none home-md:text-[58px] home-lg:text-[75px]"
                style={{ color: marqueeTextColor }}
              >
                {text}
                <span
                  aria-hidden
                  className="mx-[2vw] block h-full w-[min(10rem,42vw)] shrink-0 rounded-full bg-cover bg-center home-md:w-[min(12.5rem,28vw)]"
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * React Bits Flowing Menu — GSAP hover marquee overlay.
 * Touch: first tap opens the overlay; second tap on the same row goes to /classes.
 * https://reactbits.dev/components/flowing-menu
 */
export function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#000000",
  bgColor = "#ffffff",
  marqueeBgColor = "#000000",
  marqueeTextColor = "#ffffff",
  borderColor = "#000000",
}: FlowingMenuProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="home-programs"
      className="flex min-h-dvh w-full flex-col justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <nav aria-label="Programs" className="w-full overflow-hidden">
        {items.map((item, idx) => (
          <MenuItem
            key={`${item.text}-${idx}`}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
            isOpen={openIndex === idx}
            onOpen={() => setOpenIndex(idx)}
          />
        ))}
      </nav>
    </section>
  );
}

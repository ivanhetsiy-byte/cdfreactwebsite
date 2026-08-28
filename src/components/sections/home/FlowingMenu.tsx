"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import gsap from "gsap";

import { FadeInText } from "@/components/ui/fade-in-text";
import { MOTION_MQ, prefersReducedMotion } from "@/lib/motion-env";

import "./flowing-menu.css";

export type ChipMotion = "snap" | "soft" | "flip" | "thud";

export type MenuChipConfig = {
  color: string;
  motion: ChipMotion;
};

export type FlowingMenuItem = {
  link: string;
  text: string;
  chip: MenuChipConfig;
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

const CHIP_TRAVEL: Record<ChipMotion, { roll: number; twist: number }> = {
  snap: { roll: 180, twist: 0 },
  soft: { roll: 72, twist: 0 },
  flip: { roll: 360, twist: 180 },
  thud: { roll: 110, twist: 0 },
};

const CHIP_ENTER: Record<
  ChipMotion,
  { y: number; duration: number; ease: string; spin?: number }
> = {
  snap: { y: -52, duration: 0.58, ease: "elastic.out(1, 0.4)" },
  soft: { y: -36, duration: 0.72, ease: "sine.out" },
  flip: { y: -56, duration: 0.62, ease: "back.out(1.6)", spin: 360 },
  thud: { y: -28, duration: 0.3, ease: "power4.out" },
};

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

function MenuChip({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="menu-chip mx-[2vw] block h-full w-[min(10rem,42vw)] shrink-0 home-md:w-[min(12.5rem,28vw)]"
      style={{ "--chip-color": color } as CSSProperties}
    >
      <div className="menu-chip__stage">
        <div className="menu-chip__drop">
          <div className="menu-chip__block">
            <span className="menu-chip__face menu-chip__face--front" />
            <span className="menu-chip__face menu-chip__face--back" />
            <span className="menu-chip__face menu-chip__face--left" />
            <span className="menu-chip__face menu-chip__face--right" />
            <span className="menu-chip__face menu-chip__face--top" />
            <span className="menu-chip__face menu-chip__face--bottom" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  link,
  text,
  chip,
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
  }, [text, chip.color, chip.motion]);

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
      const inner = marqueeInnerRef.current;
      inner.style.setProperty("--chip-roll", "0deg");
      inner.style.setProperty("--chip-twist", "0deg");

      if (prefersReducedMotion()) {
        animationRef.current = null;
        gsap.set(inner, { x: 0 });
        return;
      }

      const { roll, twist } = CHIP_TRAVEL[chip.motion];
      animationRef.current = gsap.to(inner, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate() {
          const progress = this.progress();
          inner.style.setProperty("--chip-roll", `${progress * roll}deg`);
          inner.style.setProperty("--chip-twist", `${progress * twist}deg`);
        },
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);
    return () => {
      window.clearTimeout(timer);
      animationRef.current?.kill();
      animationRef.current = null;
    };
  }, [text, chip.color, chip.motion, repetitions, speed]);

  useEffect(() => {
    return () => {
      animationRef.current?.kill();
      if (marqueeRef.current) gsap.killTweensOf(marqueeRef.current);
      if (marqueeInnerRef.current) {
        gsap.killTweensOf(marqueeInnerRef.current);
        gsap.killTweensOf(
          marqueeInnerRef.current.querySelectorAll(".menu-chip__drop"),
        );
      }
    };
  }, []);

  const playChipEnter = () => {
    const drops = marqueeInnerRef.current?.querySelectorAll(".menu-chip__drop");
    if (!drops?.length) return;
    gsap.killTweensOf(drops);
    if (prefersReducedMotion()) {
      gsap.set(drops, { y: 0, rotationY: 0 });
      return;
    }
    const enter = CHIP_ENTER[chip.motion];
    gsap.fromTo(
      drops,
      { y: enter.y, rotationY: enter.spin ? -enter.spin : 0 },
      {
        y: 0,
        rotationY: 0,
        duration: enter.duration,
        ease: enter.ease,
        overwrite: true,
        force3D: true,
      },
    );
  };

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
      playChipEnter();
      return;
    }

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
    playChipEnter();
    animationRef.current?.play();
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

    const drops = marqueeInnerRef.current.querySelectorAll(".menu-chip__drop");
    gsap.killTweensOf(drops);

    if (prefersReducedMotion()) {
      gsap.set(marqueeRef.current, { y: "101%" });
      gsap.set(marqueeInnerRef.current, { y: "-101%" });
      return;
    }

    animationRef.current?.pause();
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
            className="marquee-inner flex h-full w-max items-center"
          >
            {Array.from({ length: repetitions }, (_, idx) => (
              <div
                key={idx}
                className="marquee-part flex h-full shrink-0 items-center whitespace-nowrap px-[1.5vw] font-swiss text-[clamp(2.75rem,11.5vw,3.25rem)] font-normal uppercase leading-none home-md:text-[58px] home-lg:text-[75px]"
                style={{ color: marqueeTextColor }}
              >
                {text}
                <MenuChip color={chip.color} />
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

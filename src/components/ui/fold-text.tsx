"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { prefersReducedMotion } from "@/lib/motion-env";

gsap.registerPlugin(ScrollTrigger);

type FoldTextTag = "h1" | "h2" | "p" | "span" | "div";
type Hinge = "top" | "bottom" | "left" | "right";

type HingeConfig = {
  origin: string;
  rotateX: number;
  rotateY: number;
};

const HINGE_CONFIG: Record<Hinge, HingeConfig> = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
};

type FoldTextProps = {
  text: string;
  className?: string;
  id?: string;
  as?: FoldTextTag;
  hinge?: Hinge;
  stagger?: number;
  perspective?: number;
  creaseShading?: number;
  /** Scrub to scroll. Off = play on enter, reset when fully gone, replay on return. */
  scrub?: boolean;
  /** ScrollTrigger target. Defaults to the text node. */
  trigger?: string;
  scrollStart?: string;
  scrollEnd?: string;
};

/**
 * React Bits Fold Text — characters unfold from a 3D hinge.
 * Default is scrubbed to scroll. Set scrub={false} to play as a timed
 * unfold that restarts when the trigger fully leaves and returns.
 */
export function FoldText({
  text,
  className = "",
  id,
  as: Tag = "span",
  hinge = "top",
  stagger = 0.045,
  perspective = 700,
  creaseShading = 0.55,
  scrub = true,
  trigger,
  scrollStart = "top 95%",
  scrollEnd = "top 18%",
}: FoldTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const hingeConfig = HINGE_CONFIG[hinge];
  const safeCrease = Math.min(1, Math.max(0, creaseShading));
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    const nodes: ReactNode[] = [];

    Array.from(text).forEach((char, index) => {
      if (char === "\n") {
        nodes.push(<br key={`br-${index}`} />);
        return;
      }

      nodes.push(
        <span
          key={`seg-${index}`}
          className="fold-text-segment"
          style={
            { "--fold-perspective": `${safePerspective}px` } as CSSProperties
          }
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={{ transformOrigin: hingeConfig.origin }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>,
      );
    });

    return nodes;
  }, [hinge, hingeConfig.origin, safePerspective, text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>(".fold-text-piece"),
    );
    if (!pieces.length) return;

    if (prefersReducedMotion()) {
      gsap.set(pieces, {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        "--fold-crease": 0,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const triggerEl = trigger
        ? (document.querySelector(trigger) as HTMLElement | null) ?? root
        : root;

      const tl = gsap.timeline({
        defaults: { ease: scrub ? "none" : "power3.out" },
        scrollTrigger: scrub
          ? {
              trigger: triggerEl,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            }
          : {
              trigger: triggerEl,
              start: scrollStart,
              end: scrollEnd,
              toggleActions: "play reset play reset",
            },
      });

      tl.fromTo(
        pieces,
        {
          rotateX: hingeConfig.rotateX,
          rotateY: hingeConfig.rotateY,
          transformPerspective: safePerspective,
          "--fold-crease": safeCrease,
          transformOrigin: hingeConfig.origin,
          force3D: true,
        },
        {
          rotateX: 0,
          rotateY: 0,
          transformPerspective: safePerspective,
          "--fold-crease": 0,
          duration: scrub ? 1 : 0.85,
          stagger,
        },
        0,
      );

      tl.fromTo(
        pieces,
        { opacity: 0 },
        { opacity: 1, duration: scrub ? 1.85 : 1.6, stagger },
        0,
      );
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [
    hingeConfig.origin,
    hingeConfig.rotateX,
    hingeConfig.rotateY,
    safeCrease,
    safePerspective,
    scrub,
    scrollEnd,
    scrollStart,
    stagger,
    text,
    trigger,
  ]);

  return (
    <Tag
      ref={(node) => {
        rootRef.current = node;
      }}
      id={id}
      className={`fold-text ${className}`.trim()}
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden>
        {segments}
      </span>
    </Tag>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Temporary dancer stills used across the site until final gallery assets land. */
export const DANCER_TRAIL_IMAGES = [
  "/images/mission-dancer.jpg",
  "/images/classes/ballet.jpg",
  "/images/classes/jazz.jpg",
  "/images/classes/gymnastics.jpg",
  "/images/classes/acrobatics.jpg",
] as const;

const SPAWN_DISTANCE_PX = 56;
const MAX_TRAIL = 14;
const FADE_DURATION = 0.85;
const TRAIL_SIZE = "clamp(8rem, 20vw, 16rem)";

type DancerCursorTrailProps = {
  /** Root that owns pointer tracking (usually the hero section). */
  containerRef: React.RefObject<HTMLElement | null>;
  images?: readonly string[];
  className?: string;
};

/**
 * Spawns a fading trail of dancer stills that follows the pointer
 * across the hero. pointer-events none so CTAs stay clickable.
 */
export function DancerCursorTrail({
  containerRef,
  images = DANCER_TRAIL_IMAGES,
  className = "",
}: DancerCursorTrailProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const nodesRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer || images.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const prune = () => {
      while (nodesRef.current.length > MAX_TRAIL) {
        const oldest = nodesRef.current.shift();
        if (!oldest) break;
        gsap.killTweensOf(oldest);
        oldest.remove();
      }
    };

    const spawn = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const last = lastRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (dx * dx + dy * dy < SPAWN_DISTANCE_PX * SPAWN_DISTANCE_PX) return;
      }
      lastRef.current = { x, y };

      const src = images[indexRef.current % images.length]!;
      indexRef.current += 1;

      const node = document.createElement("div");
      node.setAttribute("aria-hidden", "true");
      node.className =
        "pointer-events-none absolute overflow-hidden bg-neutral-200 will-change-transform";
      node.style.width = TRAIL_SIZE;
      node.style.height = TRAIL_SIZE;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.transform = "translate(-50%, -50%) rotate(0deg) scale(0.92)";

      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.className = "h-full w-full object-cover";
      node.appendChild(img);

      const tilt = gsap.utils.random(-14, 14);
      layer.appendChild(node);
      nodesRef.current.push(node);
      prune();

      gsap.fromTo(
        node,
        { opacity: 0.92, scale: 0.92, rotation: tilt * 0.4 },
        {
          opacity: 0,
          scale: 1.06,
          rotation: tilt,
          duration: FADE_DURATION,
          ease: "power2.out",
          onComplete: () => {
            const i = nodesRef.current.indexOf(node);
            if (i >= 0) nodesRef.current.splice(i, 1);
            node.remove();
          },
        },
      );
    };

    const onMove = (e: PointerEvent) => {
      spawn(e.clientX, e.clientY);
    };

    const onLeave = () => {
      lastRef.current = null;
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      nodesRef.current.forEach((node) => {
        gsap.killTweensOf(node);
        node.remove();
      });
      nodesRef.current = [];
    };
  }, [containerRef, images]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[5] overflow-hidden ${className}`}
    />
  );
}

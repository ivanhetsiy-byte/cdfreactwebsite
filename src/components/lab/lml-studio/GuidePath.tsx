"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number };

type GuidePathProps = {
  ready: boolean;
  regionRef: RefObject<HTMLElement | null>;
  startRef: RefObject<HTMLElement | null>;
  midRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
  footerRef: RefObject<HTMLElement | null>;
};

/** Soft tip layers: core is solid; later layers lead ahead at lower opacity. */
const TIP_LAYERS = [
  { opacity: 0.78, lead: 0 },
  { opacity: 0.48, lead: 0.28 },
  { opacity: 0.28, lead: 0.52 },
  { opacity: 0.14, lead: 0.74 },
  { opacity: 0.05, lead: 1 },
] as const;

/** Position relative to region using offsetTop/Left (stable while scrolling). */
function offsetPoint(
  anchor: HTMLElement,
  region: HTMLElement,
  align: "bottom-center" | "left-center" | "right-center" | "center",
): Point {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = anchor;
  while (node && node !== region) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== region) {
    const a = anchor.getBoundingClientRect();
    const r = region.getBoundingClientRect();
    x = a.left - r.left;
    y = a.top - r.top;
  }

  const w = anchor.offsetWidth;
  const h = anchor.offsetHeight;

  if (align === "bottom-center") {
    return { x: x + w / 2, y: y + h };
  }
  if (align === "right-center") {
    return { x: x + w, y: y + h * 0.35 };
  }
  if (align === "center") {
    return { x: x + w / 2, y: y + h / 2 };
  }
  return { x, y: y + h * 0.35 };
}

function resolveStartAnchor(
  startRef: HTMLElement,
  region: HTMLElement,
): HTMLElement {
  const nestedChar = startRef.querySelector<HTMLElement>(".char");
  if (nestedChar) return nestedChar;

  const box = startRef.getBoundingClientRect();
  if (box.width > 0 && box.height > 0) return startRef;

  const chars = region.querySelectorAll<HTMLElement>(".scroll-float .char");
  for (const char of chars) {
    if (char.textContent === "y") return char;
  }
  return startRef;
}

function buildPath(start: Point, mid: Point, end: Point, footer: Point) {
  const drop1 = Math.max((mid.y - start.y) * 0.38, 80);
  const drop2 = Math.max((end.y - mid.y) * 0.4, 100);
  const drop3 = Math.max((footer.y - end.y) * 0.45, 120);

  return [
    `M ${start.x} ${start.y}`,
    `C ${start.x} ${start.y + drop1}, ${mid.x} ${mid.y - drop1 * 0.55}, ${mid.x} ${mid.y}`,
    `C ${mid.x} ${mid.y + drop2}, ${end.x} ${end.y - drop2 * 0.45}, ${end.x} ${end.y}`,
    `C ${end.x} ${end.y + drop3}, ${footer.x} ${footer.y - drop3 * 0.35}, ${footer.x} ${footer.y}`,
  ].join(" ");
}

/**
 * Desktop-only white guide stroke from Visionary’s trailing y through both teachers
 * to the footer. The drawing tip soft-fades ahead until the path completes.
 */
export function GuidePath({
  ready,
  regionRef,
  startRef,
  midRef,
  endRef,
  footerRef,
}: GuidePathProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const strokesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ready) return;

    const region = regionRef.current;
    const startEl = startRef.current;
    const midEl = midRef.current;
    const endEl = endRef.current;
    const footerEl = footerRef.current;
    const svg = svgRef.current;
    const strokes = strokesRef.current;
    if (!region || !startEl || !midEl || !endEl || !footerEl || !svg || !strokes) {
      return;
    }

    const paths = Array.from(
      strokes.querySelectorAll<SVGPathElement>(".guide-stroke"),
    );
    if (paths.length === 0) return;

    let scrubTween: gsap.core.Tween | null = null;
    let pathLength = 0;
    let tipLen = 120;
    const progress = { drawn: 0 };

    const applyTip = (drawn: number) => {
      const len = pathLength;
      if (len <= 0) return;

      // Collapse the soft tip as we near the footer so the end lands clean
      const tipScale = 1 - Math.pow(Math.min(1, Math.max(0, drawn / len)), 3);
      const tip = tipLen * tipScale;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (!path) continue;
        const layer = TIP_LAYERS[Math.min(i, TIP_LAYERS.length - 1)] ?? TIP_LAYERS[0];
        if (!layer) continue;
        const visible = Math.min(len, Math.max(0, drawn + tip * layer.lead));
        const offset = len - visible;
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${offset}`;
      }
    };

    const updateGeometry = () => {
      const w = region.offsetWidth;
      const h = region.offsetHeight;
      if (w <= 0 || h <= 0) return 0;

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;

      const startAnchor = resolveStartAnchor(startEl, region);
      const start = offsetPoint(startAnchor, region, "bottom-center");
      const mid = offsetPoint(midEl, region, "left-center");
      const end = offsetPoint(endEl, region, "right-center");
      const footer = { x: w / 2, y: h };
      const d = buildPath(start, mid, end, footer);

      for (const p of paths) {
        p.setAttribute("d", d);
      }

      const first = paths[0];
      if (!first) return 0;
      pathLength = first.getTotalLength();
      tipLen = Math.min(160, Math.max(90, pathLength * 0.06));
      return pathLength;
    };

    const setupScrub = () => {
      const len = updateGeometry();
      if (len <= 0) return;

      scrubTween?.scrollTrigger?.kill();
      scrubTween?.kill();

      progress.drawn = 0;
      applyTip(0);

      scrubTween = gsap.fromTo(
        progress,
        { drawn: 0 },
        {
          drawn: () => pathLength,
          ease: "none",
          immediateRender: false,
          onUpdate: () => applyTip(progress.drawn),
          scrollTrigger: {
            trigger: startEl,
            start: "top 70%",
            endTrigger: footerEl,
            end: "top 90%",
            scrub: 0.45,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              updateGeometry();
            },
          },
        },
      );
    };

    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        setupScrub();
        requestAnimationFrame(() => {
          setupScrub();
          ScrollTrigger.refresh();
        });
      });
    }, region);

    const onResize = () => {
      updateGeometry();
      applyTip(progress.drawn);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scrubTween?.scrollTrigger?.kill();
      scrubTween?.kill();
      ctx.revert();
    };
  }, [ready, regionRef, startRef, midRef, endRef, footerRef]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute top-0 left-0 z-20 hidden overflow-visible md:block"
      aria-hidden
    >
      <g ref={strokesRef}>
        {TIP_LAYERS.map((layer, i) => (
          <path
            key={i}
            className="guide-stroke"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={layer.opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}

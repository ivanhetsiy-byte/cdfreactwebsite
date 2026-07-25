"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getLenis } from "@/lib/lenis";

type Frame = {
  top: number;
  left: number;
  width: number;
  height: number;
  color: string;
  stroke: number;
  handle: number;
  dash: number;
  gap: number;
  /** Fancy march + staggered pulse — titles only */
  animated: boolean;
};

type ContentRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

const MIN_SIZE = 2;
const CLEARANCE = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Scale frame chrome from the visual text size (~50% thinner stroke). */
function metricsForHeight(textHeight: number) {
  const t = textHeight;
  const stroke = clamp(t * 0.028, 0.75, 5);
  return {
    pad: clamp(t * 0.045, 2, 10),
    stroke,
    handle: clamp(stroke * 2.2, 2.5, 12),
    dash: clamp(t * 0.08, 3, 18),
    gap: clamp(t * 0.055, 2.5, 12),
  };
}

function parseRgba(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i,
  );
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function contrastingColor(fromNode: Node | null): string {
  let el: Element | null =
    fromNode instanceof Element ? fromNode : (fromNode?.parentElement ?? null);

  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    const parsed = parseRgba(bg);
    if (parsed && parsed.a >= 0.85) {
      const luminance =
        (0.2126 * parsed.r + 0.7152 * parsed.g + 0.0722 * parsed.b) / 255;
      return luminance > 0.55 ? "#000000" : "#ffffff";
    }
    el = el.parentElement;
  }

  return document.documentElement.classList.contains("dark")
    ? "#ffffff"
    : "#000000";
}

function isEditableTarget(node: Node | null): boolean {
  let el: Element | null =
    node instanceof Element ? node : (node?.parentElement ?? null);

  while (el) {
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement ||
      (el as HTMLElement).isContentEditable
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function isSkippedTextHost(el: Element | null): boolean {
  if (!el) return true;
  if (el.closest(".sr-only")) return true;
  if (el.closest("[data-selection-ignore]")) return true;
  return false;
}

function overlapsX(
  a: { left: number; right: number },
  b: { left: number; right: number },
  slack = 6,
) {
  return a.left < b.right + slack && a.right > b.left - slack;
}

function toContentRect(dom: DOMRect): ContentRect | null {
  if (dom.width < MIN_SIZE || dom.height < MIN_SIZE) return null;
  return {
    top: dom.top,
    left: dom.left,
    width: dom.width,
    height: dom.height,
    right: dom.right,
    bottom: dom.bottom,
  };
}

function collectSelectedTextNodes(range: Range): Text[] {
  const root =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentNode;

  if (!root) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    node = walker.nextNode();

    if (!textNode.data || !/\S/.test(textNode.data)) continue;
    if (!range.intersectsNode(textNode)) continue;
    if (isSkippedTextHost(textNode.parentElement)) continue;
    nodes.push(textNode);
  }

  return nodes;
}

/**
 * If the whole selection lives under one [data-title-visual], use that
 * element's layout border box (not inflated by child letter transforms).
 */
function titleVisualRect(textNodes: Text[]): ContentRect | null {
  if (textNodes.length === 0) return null;

  let shared: Element | null = null;

  for (const textNode of textNodes) {
    const host = textNode.parentElement?.closest("[data-title-visual]");
    if (!host) return null;
    if (!shared) shared = host;
    else if (shared !== host) return null;
  }

  if (!shared) return null;
  return toContentRect(shared.getBoundingClientRect());
}

/** Per-text-node range rects for normal body copy. */
function textNodeRects(range: Range, textNodes: Text[]): ContentRect[] {
  const rects: ContentRect[] = [];

  for (const textNode of textNodes) {
    const piece = document.createRange();
    const start =
      textNode === range.startContainer ? range.startOffset : 0;
    const end =
      textNode === range.endContainer
        ? range.endOffset
        : textNode.data.length;

    if (start >= end) continue;

    piece.setStart(textNode, start);
    piece.setEnd(textNode, end);

    for (const dom of piece.getClientRects()) {
      const rect = toContentRect(dom);
      if (rect) rects.push(rect);
    }
  }

  return rects;
}

/** Merge same-line fragments with a simple union (no median tricks). */
function mergeLineRects(rects: ContentRect[]): ContentRect[] {
  if (rects.length === 0) return [];

  const sorted = [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: ContentRect[][] = [];

  for (const rect of sorted) {
    const midY = rect.top + rect.height / 2;
    const line = lines.find((group) => {
      const sample = group[0];
      const sampleMid = sample.top + sample.height / 2;
      const threshold = Math.max(sample.height, rect.height) * 0.6;
      return Math.abs(sampleMid - midY) <= threshold;
    });

    if (line) line.push(rect);
    else lines.push([rect]);
  }

  return lines.map((group) => {
    const top = Math.min(...group.map((r) => r.top));
    const left = Math.min(...group.map((r) => r.left));
    const right = Math.max(...group.map((r) => r.right));
    const bottom = Math.max(...group.map((r) => r.bottom));
    return {
      top,
      left,
      width: right - left,
      height: bottom - top,
      right,
      bottom,
    };
  });
}

function neighborSearchRoot(range: Range): Element | null {
  let el: Element | null =
    range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  for (let i = 0; i < 5 && el?.parentElement; i++) {
    if (
      el.matches("article, section, main, li, [class*='flex-col']") ||
      el.parentElement === document.body
    ) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

type NeighborRect = { top: number; bottom: number; left: number; right: number };

function neighborTextRects(range: Range): NeighborRect[] {
  const root = neighborSearchRoot(range);
  if (!root) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const out: NeighborRect[] = [];

  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    node = walker.nextNode();

    if (!textNode.data || !/\S/.test(textNode.data)) continue;
    if (isSkippedTextHost(textNode.parentElement)) continue;
    if (range.intersectsNode(textNode)) continue;

    const piece = document.createRange();
    piece.selectNodeContents(textNode);
    for (const rect of piece.getClientRects()) {
      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) continue;
      out.push({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    }
  }

  return out;
}

/**
 * Shrink vertical padding only when neighbors are close.
 * Never crops into the content box.
 */
function padAgainstNeighbors(
  rect: ContentRect,
  neighbors: NeighborRect[],
  desiredPad: number,
): { padTop: number; padBottom: number } {
  let padTop = desiredPad;
  let padBottom = desiredPad;

  for (const n of neighbors) {
    if (!overlapsX(rect, n)) continue;

    const nMid = (n.top + n.bottom) / 2;
    const rMid = (rect.top + rect.bottom) / 2;

    if (nMid <= rMid) {
      const room = rect.top - n.bottom - CLEARANCE;
      if (room < padTop) padTop = Math.max(0, room);
    } else {
      const room = n.top - rect.bottom - CLEARANCE;
      if (room < padBottom) padBottom = Math.max(0, room);
    }
  }

  return { padTop, padBottom };
}

function selectionAllowRoot(range: Range): Element | null {
  const node = range.commonAncestorContainer;
  return node instanceof Element ? node : node.parentElement;
}

/** Black / dark surfaces use native red ::selection — skip the dashed overlay. */
function isDarkSelectionSurface(node: Node): boolean {
  if (document.documentElement.classList.contains("dark")) return true;
  if (document.documentElement.classList.contains("cdf-red-selection")) {
    return true;
  }
  const el = node instanceof Element ? node : node.parentElement;
  if (!el) return false;
  return Boolean(
    el.closest(
      ".dark, [data-theme='dark'], .lml-lab, .programs-band, [data-selection-dark]",
    ),
  );
}

function isOpaqueCover(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.opacity === "0") return false;

  if (
    el instanceof HTMLImageElement ||
    el instanceof HTMLVideoElement ||
    el instanceof HTMLCanvasElement
  ) {
    return true;
  }

  const bg = parseRgba(style.backgroundColor);
  if (bg && bg.a >= 0.85) return true;

  // Stacked class cards / panels often use background via Tailwind on a solid layer
  if (style.backgroundImage && style.backgroundImage !== "none") {
    // gradients still occlude; skip empty placeholder images
    return true;
  }

  return false;
}

/**
 * True when a foreign opaque layer sits above the selected content at (x, y).
 * Overlay is pointer-events:none so elementsFromPoint hits what's underneath.
 */
function isPointOccluded(x: number, y: number, allowRoot: Element): boolean {
  if (
    x < 0 ||
    y < 0 ||
    x >= window.innerWidth ||
    y >= window.innerHeight
  ) {
    return true;
  }

  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el.closest("[data-selection-overlay]")) continue;
    // Selected content, or any ancestor that owns it, counts as visible
    if (allowRoot.contains(el) || el.contains(allowRoot)) return false;
    if (isOpaqueCover(el)) return true;
  }
  return false;
}

/**
 * Shrink a frame to only the sample cells that aren't covered by
 * sticky cards / overlapping panels hiding the text.
 */
function clipRectToVisible(
  rect: ContentRect,
  allowRoot: Element,
): ContentRect | null {
  const cols = 6;
  const rows = 10;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hit = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = rect.left + ((col + 0.5) / cols) * rect.width;
      const y = rect.top + ((row + 0.5) / rows) * rect.height;
      if (isPointOccluded(x, y, allowRoot)) continue;
      hit = true;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (!hit) return null;

  const padX = rect.width / cols / 2;
  const padY = rect.height / rows / 2;
  const left = Math.max(rect.left, minX - padX);
  const right = Math.min(rect.right, maxX + padX);
  const top = Math.max(rect.top, minY - padY);
  const bottom = Math.min(rect.bottom, maxY + padY);
  const width = right - left;
  const height = bottom - top;

  if (width < MIN_SIZE || height < MIN_SIZE) return null;

  return { top, left, width, height, right, bottom };
}

function readFrames(): Frame[] {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  if (isEditableTarget(range.commonAncestorContainer)) {
    return [];
  }

  if (isDarkSelectionSurface(range.commonAncestorContainer)) {
    return [];
  }

  const text = selection.toString();
  if (!text || !text.trim()) {
    return [];
  }

  const textNodes = collectSelectedTextNodes(range);
  if (textNodes.length === 0) return [];

  const allowRoot = selectionAllowRoot(range);
  if (!allowRoot) return [];

  const color = contrastingColor(range.commonAncestorContainer);

  const titleRect = titleVisualRect(textNodes);
  const isTitle = titleRect !== null;
  const rects = titleRect
    ? [titleRect]
    : mergeLineRects(textNodeRects(range, textNodes));

  if (rects.length === 0) return [];

  // Neighbor scans get expensive across many body lines — skip when not a title
  const neighbors = isTitle || rects.length <= 4 ? neighborTextRects(range) : [];
  const peerObstacles: NeighborRect[] = rects.map((r) => ({
    top: r.top,
    bottom: r.bottom,
    left: r.left,
    right: r.right,
  }));

  const frames: Frame[] = [];

  for (let index = 0; index < rects.length; index++) {
    const rect = rects[index];
    const m = metricsForHeight(rect.height);
    const obstacles = [
      ...neighbors,
      ...peerObstacles.filter((_, i) => i !== index),
    ];
    const { padTop, padBottom } = padAgainstNeighbors(rect, obstacles, m.pad);

    const padded: ContentRect = {
      top: rect.top - padTop,
      left: rect.left - m.pad,
      width: rect.width + m.pad * 2,
      height: rect.height + padTop + padBottom,
      right: rect.left - m.pad + rect.width + m.pad * 2,
      bottom: rect.top - padTop + rect.height + padTop + padBottom,
    };

    // Occlusion sampling is expensive — only needed for animated titles
    // under sticky cards
    const visible = isTitle ? clipRectToVisible(padded, allowRoot) : padded;
    if (!visible) continue;

    frames.push({
      top: visible.top,
      left: visible.left,
      width: visible.width,
      height: visible.height,
      color,
      stroke: m.stroke,
      handle: m.handle,
      dash: m.dash,
      gap: m.gap,
      animated: isTitle,
    });
  }

  return frames;
}

function stickyHostForSelection(selection: Selection): Element | null {
  const node = selection.anchorNode;
  const el = node instanceof Element ? node : node?.parentElement;
  return el?.closest(".sticky") ?? null;
}

/** True when the shifted frame is fully outside the viewport. */
function isOffscreen(frame: Frame): boolean {
  return (
    frame.top + frame.height <= 0 ||
    frame.top >= window.innerHeight ||
    frame.left + frame.width <= 0 ||
    frame.left >= window.innerWidth
  );
}

export function SelectionHighlight() {
  const [frames, setFrames] = useState<Frame[]>([]);
  /** When set, overlay is portaled into this sticky card (scales + covered with it). */
  const [portalHost, setPortalHost] = useState<Element | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let paintRaf = 0;
    let pinRaf = 0;
    let pinLooping = false;
    let lenisOff: (() => void) | undefined;

    /** Document-pin captures (viewport coords). Sticky uses portal instead. */
    let captured: Frame[] = [];
    let originScrollY = 0;
    let pinMode: "sticky" | "document" = "document";
    let pointerDown = false;
    let lastHidden = false;

    const getScrollY = () => {
      const lenis = getLenis() as
        | (ReturnType<typeof getLenis> & { scroll?: number })
        | null;
      if (lenis && typeof lenis.animatedScroll === "number") {
        return lenis.animatedScroll;
      }
      if (lenis && typeof lenis.scroll === "number") {
        return lenis.scroll;
      }
      return window.scrollY;
    };

    const stopPinLoop = () => {
      pinLooping = false;
      cancelAnimationFrame(pinRaf);
    };

    const clear = () => {
      stopPinLoop();
      captured = [];
      originScrollY = 0;
      pinMode = "document";
      lastHidden = false;
      if (layerRef.current) {
        layerRef.current.style.transform = "";
        layerRef.current.style.visibility = "";
      }
      setPortalHost(null);
      setFrames([]);
    };

    /**
     * Document mode only: CSS translate follows Lenis.
     * Sticky mode is portaled into the card — CSS transform + stacking handle it.
     */
    const applyPinned = () => {
      if (captured.length === 0 || pinMode === "sticky") return;

      const delta = getScrollY() - originScrollY;
      const layer = layerRef.current;
      if (layer) {
        layer.style.transform = `translate3d(0, ${-delta}px, 0)`;
      }

      const shifted = captured.map((f) => ({ ...f, top: f.top - delta }));
      const hidden = !shifted.some((f) => !isOffscreen(f));
      if (layer && hidden !== lastHidden) {
        layer.style.visibility = hidden ? "hidden" : "visible";
      }
      lastHidden = hidden;
    };

    const startPinLoop = () => {
      if (pinLooping) return;
      pinLooping = true;
      const tick = () => {
        if (!pinLooping || captured.length === 0 || pinMode === "sticky") {
          pinLooping = false;
          return;
        }
        applyPinned();
        pinRaf = requestAnimationFrame(tick);
      };
      pinRaf = requestAnimationFrame(tick);
    };

    const paint = () => {
      cancelAnimationFrame(paintRaf);
      paintRaf = requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          clear();
          return;
        }
        const next = readFrames();
        const sy = getScrollY();
        const sticky = stickyHostForSelection(selection);
        const stickyRect = sticky?.getBoundingClientRect() ?? null;

        if (sticky && stickyRect && next.length > 0) {
          // Portal into the sticky card: relative coords, no JS scale.
          // Next cards cover this overlay via normal stacking; card scale applies.
          pinMode = "sticky";
          stopPinLoop();
          captured = [];
          originScrollY = sy;
          setPortalHost(sticky);
          setFrames(
            next.map((f) => ({
              ...f,
              top: f.top - stickyRect.top,
              left: f.left - stickyRect.left,
            })),
          );
          return;
        }

        pinMode = "document";
        captured = next;
        originScrollY = sy;
        setPortalHost(null);
        setFrames(next);
        requestAnimationFrame(() => {
          applyPinned();
          startPinLoop();
        });
      });
    };

    const onSelectionChange = () => {
      const collapsed = !!window.getSelection()?.isCollapsed;
      if (collapsed) {
        clear();
        return;
      }
      if (pointerDown) {
        paint();
        return;
      }
      // While scrolling, don't remasure — keep document/sticky pin intact.
      if (captured.length > 0 || pinMode === "sticky") return;
      paint();
    };

    const onPointerDown = () => {
      pointerDown = true;
    };

    const onMouseUp = () => {
      pointerDown = false;
      paint();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", paint);
    document.addEventListener("keydown", paint);

    const attachLenis = () => {
      const lenis = getLenis();
      if (lenis && typeof lenis.on === "function") {
        lenisOff = lenis.on("scroll", applyPinned);
        return true;
      }
      return false;
    };

    let tries = 0;
    const tryLenis = () => {
      if (attachLenis() || tries++ > 60) return;
      requestAnimationFrame(tryLenis);
    };
    tryLenis();

    return () => {
      cancelAnimationFrame(paintRaf);
      stopPinLoop();
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", paint);
      document.removeEventListener("keydown", paint);
      lenisOff?.();
      clear();
    };
  }, []);

  if (frames.length === 0) return null;

  const overlay = (
    <div
      ref={layerRef}
      data-selection-overlay
      className={
        portalHost
          ? "pointer-events-none absolute inset-0 z-[25] overflow-hidden"
          : "pointer-events-none fixed inset-0 z-[9999] overflow-hidden will-change-transform"
      }
      aria-hidden
    >
      {frames.map((frame, index) => (
        <SelectionFrame
          key={`selection-frame-${index}`}
          frame={frame}
          index={index}
        />
      ))}
    </div>
  );

  if (portalHost) {
    return createPortal(overlay, portalHost);
  }

  return overlay;
}

/** Single dashed rect + corners. Titles also get CSS clockwise ants. */
function SelectionFrame({
  frame,
  index,
}: {
  frame: Frame;
  index: number;
}) {
  const inset = frame.stroke / 2;
  const r = frame.handle / 2;
  const x0 = inset;
  const y0 = inset;
  const x1 = frame.width - inset;
  const y1 = frame.height - inset;
  const period = Math.max(frame.dash + frame.gap, 1);
  const antsDuration = clamp(period / 10, 1.1, 1.6);

  return (
    <div
      data-selection-frame={index}
      className="selection-pulse absolute"
      style={{
        top: frame.top,
        left: frame.left,
        width: frame.width,
        height: frame.height,
      }}
    >
      <svg
        className="absolute inset-0 overflow-visible"
        width={frame.width}
        height={frame.height}
      >
        <rect
          className={frame.animated ? "selection-ants" : undefined}
          x={x0}
          y={y0}
          width={Math.max(0, x1 - x0)}
          height={Math.max(0, y1 - y0)}
          fill="none"
          stroke={frame.color}
          strokeWidth={frame.stroke}
          strokeDasharray={`${frame.dash} ${frame.gap}`}
          strokeLinejoin="miter"
          style={
            frame.animated
              ? {
                  ["--selection-ants-period" as string]: `${period}px`,
                  ["--selection-ants-duration" as string]: `${antsDuration}s`,
                }
              : undefined
          }
        />
        <circle cx={x0} cy={y0} r={r} fill={frame.color} />
        <circle cx={x1} cy={y0} r={r} fill={frame.color} />
        <circle cx={x0} cy={y1} r={r} fill={frame.color} />
        <circle cx={x1} cy={y1} r={r} fill={frame.color} />
      </svg>
    </div>
  );
}

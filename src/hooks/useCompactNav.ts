"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Align with `--breakpoint-home-md` so desktop chrome never wins at 768–809px. */
const HOME_MD_PX = 810;

/** Minimum gap between Contact and the links group inside the 40% chrome band. */
const MIN_CHROME_GAP_PX = 16;

/** Right chrome band is 40% of the header row (matches navbar `w-[40%]`). */
const CHROME_BAND_RATIO = 0.4;

export function useCompactNavMeasure(
  headerRowRef: RefObject<HTMLElement | null>,
  bandRef: RefObject<HTMLElement | null>,
  contactRef: RefObject<HTMLElement | null>,
  linksRef: RefObject<HTMLElement | null>,
  /** Re-measure when labels change (language, etc.). */
  deps: unknown[] = [],
) {
  const [compact, setCompact] = useState(true);
  const compactRef = useRef(true);

  useLayoutEffect(() => {
    const measure = () => {
      const row = headerRowRef.current;
      const band = bandRef.current;
      const contact = contactRef.current;
      const links = linksRef.current;
      if (!row || !band || !contact || !links) return;

      if (window.innerWidth < HOME_MD_PX) {
        if (!compactRef.current) {
          compactRef.current = true;
          setCompact(true);
        }
        return;
      }

      const bandWidth = row.clientWidth * CHROME_BAND_RATIO;
      // Set width without observing the band itself (avoids RO feedback loops)
      if (band.style.width !== `${bandWidth}px`) {
        band.style.width = `${bandWidth}px`;
      }

      const needed =
        contact.offsetWidth + links.scrollWidth + MIN_CHROME_GAP_PX;
      const next = needed > bandWidth;

      if (next !== compactRef.current) {
        compactRef.current = next;
        setCompact(next);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    const row = headerRowRef.current;
    if (row) ro.observe(row);

    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit deps for label changes
  }, deps);

  return { compact, compactRef };
}

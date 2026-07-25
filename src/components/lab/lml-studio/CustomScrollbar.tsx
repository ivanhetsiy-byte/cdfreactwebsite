"use client";

import { useEffect, useRef } from "react";

export function CustomScrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const thumb = thumbRef.current;
      if (!thumb) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const track = window.innerHeight;
      const thumbH = Math.max(48, track * (window.innerHeight / doc.scrollHeight));
      const y = progress * (track - thumbH);
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${y}px)`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="custom-scrollbar" aria-hidden>
      <div ref={thumbRef} className="custom-scrollbar-thumb" />
    </div>
  );
}

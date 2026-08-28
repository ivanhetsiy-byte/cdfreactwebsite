"use client";

import { useEffect, useRef } from "react";

const SRC = "/Videos/home-ages.mp4";
const POSTER = "/Videos/home-ages-poster.webp";

/**
 * Ambient loop for the Ages media box.
 * Reduced-motion visitors keep the poster still and never start playback.
 */
export function HomeAgesVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const silence = () => {
      if (!video.muted) video.muted = true;
      video.defaultMuted = true;
      if (video.volume !== 0) video.volume = 0;
    };

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      silence();

      if (mq.matches) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        return;
      }

      if (video.getAttribute("src") !== SRC) {
        video.src = SRC;
      }
      void video.play().catch(() => {
        /* Autoplay can be blocked; poster remains. */
      });
    };

    apply();
    video.addEventListener("volumechange", silence);
    video.addEventListener("play", silence);
    mq.addEventListener("change", apply);
    return () => {
      video.removeEventListener("volumechange", silence);
      video.removeEventListener("play", silence);
      mq.removeEventListener("change", apply);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      poster={POSTER}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}

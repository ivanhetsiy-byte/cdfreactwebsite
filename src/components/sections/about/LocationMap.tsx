"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** OpenFreeMap Positron — clean grayscale basemap, treated as a static plate. */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const BRAND_RED = "#c31716";

/** Neighbourhood-scale zoom for the KleinLife square. */
const DEFAULT_ZOOM = 14.2;

const CHROME_STYLE_ID = "cdf-location-map-chrome";

const CHROME_CSS = `
.cdf-location-map .maplibregl-ctrl-attrib {
  background: transparent !important;
  color: rgba(0, 0, 0, 0.32);
  font-size: 9px;
  line-height: 1.3;
  padding: 2px 4px;
  pointer-events: none;
}
.cdf-location-map .maplibregl-ctrl-attrib a {
  color: rgba(0, 0, 0, 0.38);
  pointer-events: auto;
}
.cdf-location-map .maplibregl-ctrl-logo {
  display: none !important;
}
.cdf-location-map .maplibregl-canvas-container,
.cdf-location-map .maplibregl-canvas {
  cursor: default !important;
}
.cdf-location-pin {
  width: 28px;
  height: 36px;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.22));
}
`;

function ensureChromeStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CHROME_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CHROME_STYLE_ID;
  style.textContent = CHROME_CSS;
  document.head.appendChild(style);
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function createPinElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.className = "cdf-location-pin";
  el.innerHTML = `
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 1.5C7.649 1.5 2.5 6.649 2.5 13c0 8.25 9.1 18.9 10.55 20.55a1.2 1.2 0 0 0 1.9 0C16.4 31.9 25.5 21.25 25.5 13 25.5 6.649 20.351 1.5 14 1.5Z"
        fill="${BRAND_RED}"
        stroke="#fff"
        stroke-width="1.75"
      />
      <circle cx="14" cy="13" r="4.25" fill="#fff" />
    </svg>
  `;
  return el;
}

export function directionsUrl(lat: number, lon: number, address: string): string {
  const query = encodeURIComponent(address || `${lat},${lon}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

type LocationMapProps = {
  lat: number;
  lon: number;
  label: string;
  className?: string;
};

/**
 * Editorial monochrome map plate — art only, no pan/zoom.
 * Utility (directions) lives outside this component on the frame overlay.
 */
export function LocationMap({ lat, lon, label, className }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!supportsWebGL()) return;

    let cancelled = false;
    let map: MapLibreMap | null = null;
    let marker: Marker | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let started = false;

    const start = () => {
      if (cancelled || started) return;
      started = true;

      void (async () => {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        ensureChromeStyles();

        const instance = new maplibregl.Map({
          container,
          style: STYLE_URL,
          center: [lon, lat],
          zoom: DEFAULT_ZOOM,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
        });

        map = instance;
        mapRef.current = instance;

        instance.addControl(
          new maplibregl.AttributionControl({
            compact: true,
          }),
          "bottom-right",
        );

        marker = new maplibregl.Marker({
          element: createPinElement(),
          anchor: "bottom",
        })
          .setLngLat([lon, lat])
          .addTo(instance);

        instance.on("load", () => {
          if (cancelled) return;
          instance.resize();
        });

        resizeObserver = new ResizeObserver(() => {
          instance.resize();
        });
        resizeObserver.observe(container);
      })();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: "160px" },
    );
    io.observe(container);

    return () => {
      cancelled = true;
      io.disconnect();
      resizeObserver?.disconnect();
      marker?.remove();
      map?.remove();
      mapRef.current = null;
    };
  }, [lat, lon]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Map showing ${label}`}
      className={className}
      style={{ backgroundColor: "#e8e4df" }}
    />
  );
}

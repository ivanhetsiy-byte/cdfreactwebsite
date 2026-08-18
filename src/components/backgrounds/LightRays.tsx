"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef, useState } from "react";

import { isCoarseOrNarrow, prefersReducedMotion } from "@/lib/motion-env";
import { cn } from "@/lib/utils";

export type RaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "right"
  | "left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

type Vec2 = [number, number];
type Vec3 = [number, number, number];

type Uniforms = {
  iTime: { value: number };
  iResolution: { value: Vec2 };
  rayPos: { value: Vec2 };
  rayDir: { value: Vec2 };
  raysColor: { value: Vec3 };
  raysSpeed: { value: number };
  lightSpread: { value: number };
  rayLength: { value: number };
  pulsating: { value: number };
  fadeDistance: { value: number };
  saturation: { value: number };
  mousePos: { value: Vec2 };
  mouseInfluence: { value: number };
  noiseAmount: { value: number };
  distortion: { value: number };
};

type LightRaysProps = {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
};

const hexToRgb = (hex: string): Vec3 => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];

  const [, r = "ff", g = "ff", b = "ff"] = m;
  return [
    parseInt(r, 16) / 255,
    parseInt(g, 16) / 255,
    parseInt(b, 16) / 255,
  ];
};

/** Places the ray source slightly outside the canvas so the cone reads as off-screen. */
const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number,
): { anchor: Vec2; dir: Vec2 } => {
  const outside = 0.2 * Math.min(w, h);
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside], dir: [0, 1] };
    case "left":
      return { anchor: [-outside, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [w + outside, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, h + outside], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, h + outside], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, h + outside], dir: [0, -1] };
    default:
      return { anchor: [0.5 * w, -outside], dir: [0, 1] };
  }
};

const VERTEX = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = /* glsl */ `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  // Width-only scaling makes rays too short in portrait viewports.
  float distanceScale = max(iResolution.x, iResolution.y);
  float maxDistance = distanceScale * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeRange = distanceScale * fadeDistance;
  float fadeFalloff = clamp((fadeRange - distance) / fadeRange, 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.30 + 0.20 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
    rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
    rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

/** WebGL volumetric light rays (ReactBits port). Renders transparent — put it over a dark surface. */
export function LightRays({
  raysOrigin = "top-center",
  raysColor = "#ffffff",
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className,
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const visibleRef = useRef(false);
  const [useCssFallback, setUseCssFallback] = useState(false);

  // Reduced motion: CSS wash only. Coarse/narrow still uses WebGL at dpr 1.
  useEffect(() => {
    setUseCssFallback(prefersReducedMotion());
  }, []);

  // Create GL once; pause the draw loop while off-screen. Tearing down the
  // context on every intersection flip is what spiked reverse-scroll.
  useEffect(() => {
    if (useCssFallback) return;
    const container = containerRef.current;
    if (!container) return;

    let created = false;
    let renderer: Renderer | null = null;
    let mesh: Mesh | null = null;
    let uniforms: Uniforms | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const maxDpr = isCoarseOrNarrow() ? 1 : Math.min(window.devicePixelRatio, 2);

    const ensureCreated = () => {
      if (created || !containerRef.current) return;
      created = true;

      renderer = new Renderer({
        dpr: maxDpr,
        alpha: true,
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.display = "block";
      container.replaceChildren(gl.canvas);

      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1 : 0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: followMouse ? mouseInfluence : 0 },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };
      uniformsRef.current = uniforms;

      mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, {
          vertex: VERTEX,
          fragment: FRAGMENT,
          uniforms,
        }),
      });
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!renderer || !uniforms || !containerRef.current) return;
        renderer.dpr = maxDpr;
        const { clientWidth, clientHeight } = containerRef.current;
        renderer.setSize(clientWidth, clientHeight);
        const w = clientWidth * renderer.dpr;
        const h = clientHeight * renderer.dpr;
        uniforms.iResolution.value = [w, h];
        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      resizeObserver = new ResizeObserver(updatePlacement);
      resizeObserver.observe(container);
      updatePlacement();
    };

    const loop = (t: number) => {
      if (!visibleRef.current || !renderer || !mesh || !uniforms) {
        rafRef.current = null;
        return;
      }
      uniforms.iTime.value = t * 0.001;
      if (followMouse && mouseInfluence > 0) {
        const smoothing = 0.92;
        smoothMouseRef.current.x =
          smoothMouseRef.current.x * smoothing +
          mouseRef.current.x * (1 - smoothing);
        smoothMouseRef.current.y =
          smoothMouseRef.current.y * smoothing +
          mouseRef.current.y * (1 - smoothing);
        uniforms.mousePos.value = [
          smoothMouseRef.current.x,
          smoothMouseRef.current.y,
        ];
      }
      renderer.render({ scene: mesh });
      rafRef.current = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? false;
        visibleRef.current = next;
        if (!next) return;
        ensureCreated();
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      resizeObserver?.disconnect();
      if (renderer) {
        const canvas = renderer.gl.canvas;
        renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.parentNode?.removeChild(canvas);
      }
      rendererRef.current = null;
      uniformsRef.current = null;
      meshRef.current = null;
    };
  }, [
    useCssFallback,
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  useEffect(() => {
    if (useCssFallback || !followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [followMouse, useCssFallback]);

  if (useCssFallback) {
    return (
      <div
        className={cn(
          "pointer-events-none relative h-full w-full overflow-hidden",
          className,
        )}
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 55% 80% at 50% -10%, ${raysColor}55 0%, transparent 62%)`,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none relative h-full w-full overflow-hidden",
        className,
      )}
      aria-hidden
    />
  );
}

export default LightRays;

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function PaintField() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uTime;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.35;

            // Graffiti / paint smear field
            float s =
              sin(uv.x * 18.0 + t) * cos(uv.y * 14.0 - t * 1.3) +
              sin((uv.x + uv.y) * 22.0 - t * 2.0) * 0.5;

            float ink = smoothstep(0.15, 0.85, 0.55 + 0.45 * s);
            ink *= smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.7, uv.y);

            float speck = step(0.97, hash(uv * 80.0 + floor(t * 4.0)));
            vec3 col = mix(vec3(0.02), vec3(0.95), ink);
            col = mix(col, vec3(0.9, 0.1, 0.08), speck * 0.35);

            float alpha = ink * 0.55 + speck * 0.2;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  );

  useFrame((state) => {
    const uTime = material.uniforms.uTime;
    if (uTime) uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[2.2, 1.1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function GraffitiStrip() {
  return (
    <section className="pointer-events-auto relative flex h-screen w-full items-start overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 1.2], fov: 50 }}>
          <PaintField />
        </Canvas>
      </div>
      <div className="relative z-10 flex w-full flex-wrap gap-6 px-5 pt-16 font-medium md:px-6.5 md:pt-24">
        <span className="text-[clamp(2rem,6vw,4rem)] leading-none">{`{ Mindse_ }`}</span>
        <span className="text-[clamp(2rem,6vw,4rem)] leading-none text-white/70">
          Graffiti Journal
        </span>
        <span className="text-[clamp(2rem,6vw,4rem)] leading-none">Happy!</span>
      </div>
    </section>
  );
}

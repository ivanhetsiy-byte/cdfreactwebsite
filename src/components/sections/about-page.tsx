import { AboutFounded } from "./about/about-founded";
import { AboutHero } from "./about/about-hero";
import { AboutWhereWeveBeen } from "./about/about-where-weve-been";

/** About page — white canvas; spacer reserved for sections still to come. */
export function AboutWireframes() {
  return (
    <div className="relative w-full bg-white">
      <AboutHero />
      <AboutFounded />
      <AboutWhereWeveBeen />
      <div className="min-h-[100vh]" aria-hidden />
    </div>
  );
}

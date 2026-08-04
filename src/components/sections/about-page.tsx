import { AboutFounded } from "./about/about-founded";
import { AboutHero } from "./about/about-hero";
import { AboutWhereLocated } from "./about/about-where-located";
import { AboutWhereWeveBeen } from "./about/about-where-weve-been";

/** About page — white canvas composed of sequential section wireframes. */
export function AboutWireframes() {
  return (
    <div className="relative w-full bg-white">
      <AboutHero />
      <AboutFounded />
      <AboutWhereWeveBeen />
      <AboutWhereLocated />
    </div>
  );
}

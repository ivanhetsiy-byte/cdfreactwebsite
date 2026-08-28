import { HomeAgesVideo } from "@/components/sections/home/home-ages-video";
import { FadeInText } from "@/components/ui/fade-in-text";
import { FoldText } from "@/components/ui/fold-text";

/**
 * Figma Home redesign — Ages 3-16 / Competitive vs Recreational
 * Mobile 390 (`11:158`) · Tablet 810 (`14:31`, `14:32`) · Desktop 1200 (`11:100`, `11:105`)
 *
 * Content-height on mobile; full-viewport canvas from tablet up.
 * Labels straddle the image edges and invert via mix-blend-difference
 * (Figma color split) — no MCP pixel offsets.
 */
export function HomeAges() {
  const labelClass = [
    "fold-text-blend absolute z-10 h-auto w-auto font-swiss text-[45.825px] font-normal leading-none text-white",
    "home-md:text-[95.175px] home-lg:text-[141px]",
  ].join(" ");

  return (
    <section
      id="home-ages"
      aria-labelledby="home-ages-heading"
      className={[
        "w-full bg-background py-10 text-foreground",
        "home-md:flex home-md:min-h-screen home-md:flex-col home-md:justify-center home-md:py-20",
        "home-lg:flex home-lg:min-h-screen home-lg:w-full home-lg:flex-col home-lg:items-center home-lg:justify-center home-lg:py-24",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 home-md:px-12">
        <FadeInText
          as="h2"
          id="home-ages-heading"
          className="h-auto w-full font-swiss text-[45.825px] font-normal leading-none home-md:text-[95.175px] home-lg:text-[141px]"
        >
          AGES 3-16
        </FadeInText>

        <div className="relative mt-[0.7em] mb-[0.55em] h-auto w-full text-[45.825px] home-md:text-[95.175px] home-lg:text-[141px]">
          <FoldText
            as="p"
            text="Competitive"
            creaseShading={0}
            className={`${labelClass} top-0 left-0 -translate-y-1/2`}
          />

          <div
            id="home-ages-media"
            aria-hidden
            className="relative aspect-[1121/642] h-auto w-full overflow-hidden bg-foreground"
          >
            <HomeAgesVideo />
          </div>

          <FoldText
            as="p"
            text="Recreational"
            creaseShading={0}
            trigger="#home-ages-media"
            scrollStart="top 90%"
            scrollEnd="center 60%"
            className={`${labelClass} right-0 bottom-0 translate-y-1/2 text-right`}
          />
        </div>
      </div>
    </section>
  );
}

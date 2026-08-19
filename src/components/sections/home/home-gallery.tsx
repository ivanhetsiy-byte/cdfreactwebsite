import { HomeGalleryMarquee } from "@/components/sections/home/home-gallery-marquee";
import { FadeInText } from "@/components/ui/fade-in-text";
import { loadGalleryImages } from "@/lib/local-media.server";

/**
 * Figma Home redesign — Gallery
 * Mobile 390 (`14:88`, `14:90`) · Tablet 810 (`14:36`, `14:38`) · Desktop 1200 (`11:110`, `11:115`)
 *
 * Heading lives in the 1200px safe-zone. Thumbnail track is full-bleed
 * and loops linearly (RTL) with desktop drag.
 */
export function HomeGallery() {
  const images = loadGalleryImages();

  return (
    <section
      id="home-gallery"
      aria-labelledby="home-gallery-heading"
      className={[
        "flex w-full flex-col bg-background py-8 text-foreground",
        "home-md:min-h-screen home-md:justify-end home-md:pt-16",
        "home-lg:min-h-screen home-lg:pt-24",
      ].join(" ")}
    >
      <div className="w-full font-swiss text-[77.025px] home-md:text-[159.975px] home-lg:text-[237px]">
        <div className="mx-auto w-full max-w-[1200px] px-6 home-md:px-12">
          <FadeInText
            as="h2"
            id="home-gallery-heading"
            className="h-auto w-full whitespace-nowrap font-bold leading-none"
          >
            GALLERY
          </FadeInText>
        </div>
        <div
          aria-hidden
          className="mt-[0.06em] h-px w-full bg-foreground"
        />
      </div>

      <HomeGalleryMarquee className="mt-8" images={images} />
    </section>
  );
}

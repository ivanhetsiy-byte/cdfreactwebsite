import { FlowingMenu } from "@/components/sections/home/FlowingMenu";
import { HomeAges } from "@/components/sections/home/home-ages";
import { HomeGallery } from "@/components/sections/home/home-gallery";
import { HomeHero } from "@/components/sections/home/home-hero";
import { HomeInstructor } from "@/components/sections/home/home-instructor";

/** Gray placeholder chip for React Bits marquee image slots. */
const MENU_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="56"><rect width="100%" height="100%" fill="#d9d9d9"/></svg>`,
  );

const FLOWING_MENU_ITEMS = [
  { text: "JAZZ", link: "/classes", image: MENU_IMAGE_PLACEHOLDER },
  { text: "BALLET", link: "/classes", image: MENU_IMAGE_PLACEHOLDER },
  { text: "ACROBATICS", link: "/classes", image: MENU_IMAGE_PLACEHOLDER },
  { text: "GYMNASTICS", link: "/classes", image: MENU_IMAGE_PLACEHOLDER },
] as const;

export function HomePage() {
  return (
    <div className="relative z-[1] w-full bg-background font-swiss text-foreground">
      <HomeHero />
      <FlowingMenu
        bgColor="#ffffff"
        textColor="#000000"
        marqueeBgColor="#000000"
        marqueeTextColor="#ffffff"
        borderColor="#000000"
        items={[...FLOWING_MENU_ITEMS]}
      />
      <HomeInstructor />
      <HomeAges />
      <HomeGallery />
    </div>
  );
}

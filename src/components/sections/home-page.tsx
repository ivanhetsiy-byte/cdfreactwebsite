import {
  FlowingMenu,
  type FlowingMenuItem,
} from "@/components/sections/home/FlowingMenu";
import { HomeAges } from "@/components/sections/home/home-ages";
import { HomeGallery } from "@/components/sections/home/home-gallery";
import { HomeHero } from "@/components/sections/home/home-hero";
import { HomeInstructor } from "@/components/sections/home/home-instructor";

const FLOWING_MENU_ITEMS: FlowingMenuItem[] = [
  { text: "JAZZ", link: "/classes", chip: { color: "#c31716", motion: "snap" } },
  {
    text: "BALLET",
    link: "/classes",
    chip: { color: "#E8B4B8", motion: "soft" },
  },
  {
    text: "ACROBATICS",
    link: "/classes",
    chip: { color: "#3B5BFF", motion: "flip" },
  },
  {
    text: "GYMNASTICS",
    link: "/classes",
    chip: { color: "#E0A21A", motion: "thud" },
  },
];

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
        items={FLOWING_MENU_ITEMS}
      />
      <HomeInstructor />
      <HomeAges />
      <HomeGallery />
    </div>
  );
}

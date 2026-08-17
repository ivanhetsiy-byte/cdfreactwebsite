import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

export const helvetica = localFont({
  src: [
    {
      path: "./fonts/Helvetica.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    // Hero Season 12 uses font-weight 900; map to Bold so the browser
    // does not synthesize a heavier face.
    {
      path: "./fonts/Helvetica-Bold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
  // Align used line metrics with hhea (Win OS/2 values are inflated ~1.175em).
  declarations: [
    { prop: "ascent-override", value: "77.00%" },
    { prop: "descent-override", value: "23.00%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

export const helveticaCompressed = localFont({
  src: [
    {
      path: "./fonts/helvetica-compressed.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-compressed",
  display: "swap",
  preload: false,
});

export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

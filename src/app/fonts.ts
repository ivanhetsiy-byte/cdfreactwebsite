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
    // Site uses Tailwind font-black (900); map to Bold so the browser
    // does not synthesize a heavier face.
    {
      path: "./fonts/Helvetica-Bold.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica-BoldOblique.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/Helvetica-BoldOblique.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

export const helveticaCompressed = localFont({
  src: [
    {
      path: "./fonts/helvetica-compressed-5871d14b6903a.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-compressed",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export type ProductAspect = "portrait" | "square" | "landscape";

export type StoreProduct = {
  id: string;
  title: string;
  price: string;
  aspect: ProductAspect;
  description: string;
  sizes: readonly string[];
  specs: readonly { label: string; value: string }[];
};

/** Catalog copy — hardcoded English for now; translations can follow later. */
export const STORE_PRODUCTS: readonly StoreProduct[] = [
  {
    id: "season-hoodie",
    title: "Season 12 Studio Hoodie",
    price: "$68",
    aspect: "portrait",
    description:
      "Heavyweight studio fleece for rehearsals and cool-down. Embroidered Season 12 mark at the chest.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "80% cotton / 20% polyester fleece" },
      { label: "Weight", value: "320 gsm" },
      { label: "Fit", value: "Relaxed, dropped shoulder" },
      { label: "Care", value: "Machine wash cold, tumble low" },
      { label: "Origin", value: "Made for CDF Studio" },
    ],
  },
  {
    id: "logo-tee",
    title: "CDF Logo Tee",
    price: "$36",
    aspect: "square",
    description:
      "Everyday cotton tee with the CDF wordmark. Soft hand-feel, built for long studio days.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "100% combed cotton" },
      { label: "Weight", value: "180 gsm" },
      { label: "Fit", value: "Classic crew, true to size" },
      { label: "Print", value: "Water-based ink, chest logo" },
      { label: "Care", value: "Machine wash cold, inside out" },
    ],
  },
  {
    id: "jazz-crew",
    title: "Jazz Practice Crewneck",
    price: "$54",
    aspect: "landscape",
    description:
      "Midweight crew for warm-ups and travel. Subtle jazz-line graphic on the back yoke.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "70% cotton / 30% polyester" },
      { label: "Weight", value: "280 gsm" },
      { label: "Fit", value: "Standard crew, slightly cropped" },
      { label: "Details", value: "Ribbed cuffs and hem" },
      { label: "Care", value: "Machine wash cold, hang dry" },
    ],
  },
  {
    id: "ballet-tote",
    title: "Ballet Line Tote",
    price: "$28",
    aspect: "portrait",
    description:
      "Open-top canvas tote sized for shoes, water, and a change of clothes. Ballet-line print on one face.",
    sizes: ["One Size"],
    specs: [
      { label: "Material", value: "12 oz cotton canvas" },
      { label: "Capacity", value: "~15 L" },
      { label: "Handles", value: "Reinforced webbing, 28 cm drop" },
      { label: "Base", value: "Flat, stands open" },
      { label: "Care", value: "Spot clean or gentle wash" },
    ],
  },
  {
    id: "acro-cap",
    title: "Acro Cap",
    price: "$32",
    aspect: "square",
    description:
      "Structured six-panel cap with an embroidered acro mark. Adjustable for rehearsal-to-street wear.",
    sizes: ["S/M", "M/L"],
    specs: [
      { label: "Material", value: "Cotton twill" },
      { label: "Crown", value: "Structured, mid profile" },
      { label: "Closure", value: "Metal buckle adjuster" },
      { label: "Brim", value: "Pre-curved" },
      { label: "Care", value: "Spot clean only" },
    ],
  },
  {
    id: "gym-tank",
    title: "Gymnastics Training Tank",
    price: "$30",
    aspect: "portrait",
    description:
      "Breathable training tank with a racer silhouette. CDF mark at the hem.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "60% cotton / 40% modal" },
      { label: "Weight", value: "140 gsm" },
      { label: "Fit", value: "Athletic, racer back" },
      { label: "Feel", value: "Soft stretch, quick dry" },
      { label: "Care", value: "Machine wash cold" },
    ],
  },
  {
    id: "staff-poster",
    title: "Season Poster — Staff Edition",
    price: "$24",
    aspect: "portrait",
    description:
      "Limited staff-edition season poster. Matte print on archival stock.",
    sizes: ["18 × 24 in"],
    specs: [
      { label: "Print", value: "Giclée, archival pigment" },
      { label: "Paper", value: "200 gsm matte" },
      { label: "Size", value: "18 × 24 inches" },
      { label: "Edition", value: "Staff series, open edition" },
      { label: "Ship", value: "Rolled in a protective tube" },
    ],
  },
  {
    id: "team-print",
    title: "Always Together Print",
    price: "$40",
    aspect: "square",
    description:
      "Square art print from the Always Together campaign. Ready to frame.",
    sizes: ["12 × 12 in"],
    specs: [
      { label: "Print", value: "Fine-art pigment" },
      { label: "Paper", value: "230 gsm cotton rag" },
      { label: "Size", value: "12 × 12 inches" },
      { label: "Border", value: "0.5 in white margin" },
      { label: "Ship", value: "Flat packed with board" },
    ],
  },
  {
    id: "studio-tee",
    title: "Studio Mark Tee",
    price: "$36",
    aspect: "landscape",
    description:
      "Clean studio-mark tee. Same cut as the logo tee, quieter graphic.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "100% combed cotton" },
      { label: "Weight", value: "180 gsm" },
      { label: "Fit", value: "Classic crew, true to size" },
      { label: "Print", value: "Tone-on-tone studio mark" },
      { label: "Care", value: "Machine wash cold, inside out" },
    ],
  },
  {
    id: "family-hoodie",
    title: "Family Warm-Up Hoodie",
    price: "$72",
    aspect: "portrait",
    description:
      "Oversized warm-up hoodie for dancers and families in the stands. Soft brushed interior.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    specs: [
      { label: "Fabric", value: "85% cotton / 15% polyester" },
      { label: "Weight", value: "350 gsm" },
      { label: "Fit", value: "Oversized, kangaroo pocket" },
      { label: "Hood", value: "Double-layer, drawcord" },
      { label: "Care", value: "Machine wash cold, tumble low" },
    ],
  },
  {
    id: "stage-tee",
    title: "Stage Ready Tee",
    price: "$34",
    aspect: "square",
    description:
      "Lightweight performance tee for call times and travel days. Moisture-wicking knit.",
    sizes: ["XS", "S", "M", "L", "XL"],
    specs: [
      { label: "Fabric", value: "Performance polyester knit" },
      { label: "Weight", value: "130 gsm" },
      { label: "Fit", value: "Athletic, slightly tapered" },
      { label: "Feel", value: "Breathable, quick dry" },
      { label: "Care", value: "Machine wash cold" },
    ],
  },
  {
    id: "competition-pack",
    title: "Competition Day Pack",
    price: "$48",
    aspect: "landscape",
    description:
      "Compact pack for competition day essentials — shoes, grips, snacks, and a spare layer.",
    sizes: ["One Size"],
    specs: [
      { label: "Material", value: "Recycled nylon shell" },
      { label: "Volume", value: "12 L" },
      { label: "Closure", value: "Zip top + front pocket" },
      { label: "Strap", value: "Padded adjustable shoulder" },
      { label: "Care", value: "Wipe clean" },
    ],
  },
] as const;

export function getStoreProduct(id: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((product) => product.id === id);
}

export function getStoreProductIds(): string[] {
  return STORE_PRODUCTS.map((product) => product.id);
}

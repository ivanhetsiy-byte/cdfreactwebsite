import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Staff",
  description:
    "Meet the Childance Factory teaching staff and studio leadership.",
};

const LmlStudioPage = dynamic(
  () =>
    import("@/components/lab/lml-studio/LmlStudioPage").then(
      (m) => m.LmlStudioPage,
    ),
  {
    loading: () => (
      <main
        id="main-content"
        className="min-h-screen bg-black text-white"
        aria-busy
      />
    ),
  },
);

/** Production staff route — lab studio; global Navbar owns Contact / Menu. */
export default function Page() {
  return <LmlStudioPage chrome="site" />;
}

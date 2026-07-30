import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { CompetitionWireframe } from "@/components/sections/competition-wireframe";
import {
  getCompetition,
  getCompetitionSlugs,
} from "@/lib/competitions";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCompetitionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const competition = getCompetition(slug);
  if (!competition) return { title: "Competition" };
  return {
    title: competition.name,
    description: `${competition.name} — ${competition.achievement} at Childance Factory.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const competition = getCompetition(slug);
  if (!competition) notFound();

  return (
    <PageShell variant="dark">
      <CompetitionWireframe competition={competition} />
    </PageShell>
  );
}

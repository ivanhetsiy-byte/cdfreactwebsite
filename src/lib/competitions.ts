export type Competition = {
  name: string;
  achievement: string;
  slug: string;
};

export const COMPETITIONS = [
  { name: "SHOWSTOPPER", achievement: "NATIONAL CHAMPS", slug: "showstopper" },
  { name: "STARPOWER", achievement: "TODO", slug: "starpower" },
  { name: "STARBOUND", achievement: "TODO", slug: "starbound" },
  { name: "NEXUS", achievement: "TODO", slug: "nexus" },
  { name: "FLY", achievement: "TODO", slug: "fly" },
] as const satisfies readonly Competition[];

export type CompetitionSlug = (typeof COMPETITIONS)[number]["slug"];

export function getCompetition(slug: string) {
  return COMPETITIONS.find((c) => c.slug === slug);
}

export function getCompetitionSlugs() {
  return COMPETITIONS.map((c) => c.slug);
}

export function competitionHref(slug: string) {
  return `/competitions/${slug}`;
}

/** About-page anchor for the competitions runway — used by competition back links. */
export const ABOUT_WHERE_HASH = "where-weve-been";

export function aboutWhereHref() {
  return `/about#${ABOUT_WHERE_HASH}`;
}

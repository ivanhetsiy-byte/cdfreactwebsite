export type Competition = {
  name: string;
  achievement: string;
  slug: string;
};

export const COMPETITIONS = [
  {
    name: "SHOWSTOPPER",
    achievement: "REGIONAL / NATIONAL WINNERS",
    slug: "showstopper",
  },
  {
    name: "HALL OF FAME",
    achievement: "REGIONAL WINNERS",
    slug: "hall-of-fame",
  },
  {
    name: "STARPOWER",
    achievement: "NATIONAL / REGIONAL WINNERS",
    slug: "starpower",
  },
  {
    name: "NEXSTAR",
    achievement: "REGIONAL WINNERS",
    slug: "nexstar",
  },
  {
    name: "WDC",
    achievement: "2 TIME WORLD CHAMPIONS",
    slug: "wdc",
  },
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

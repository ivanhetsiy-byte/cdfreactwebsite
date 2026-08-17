/** Canonical studio contact + social URLs. Keep env overrides in one place. */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cdf.studio";

export const STUDIO_EMAIL = "childancefactory@gmail.com";

export const STUDIO_PHONE_DISPLAY = "929-248-8120";
export const STUDIO_PHONE_TEL = "tel:+19292488120";

export const STUDIO_STREET = "10100 Jamison Ave";
export const STUDIO_CITY = "Philadelphia";
export const STUDIO_REGION = "PA";
export const STUDIO_POSTAL = "19116";
export const STUDIO_ADDRESS_LINE =
  `${STUDIO_STREET}, ${STUDIO_CITY}, ${STUDIO_REGION} ${STUDIO_POSTAL}` as const;

export const STUDIO_MAPS_URL =
  "https://maps.google.com/?q=10100+Jamison+Ave,+Philadelphia,+PA+19116";

export const SOCIAL_URLS = {
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://www.instagram.com/cdf_dance_school/",
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_URL ??
    "https://www.tiktok.com/@childancefactory",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://www.facebook.com/CDF.danceschool",
  youtube:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ??
    "https://www.youtube.com/@childancefactory",
} as const;

export const SOCIAL_URL_LIST = [
  SOCIAL_URLS.instagram,
  SOCIAL_URLS.tiktok,
  SOCIAL_URLS.facebook,
  SOCIAL_URLS.youtube,
] as const;

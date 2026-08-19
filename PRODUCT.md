# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitors are parents researching enrollment for children ages 3–16 at a Philadelphia dance studio. Secondary visitors are dancers and alumni browsing to judge the studio’s values and whether it feels trendy and professional.

Success for parents: understand programs, people, and fit, then contact or call to enroll. Success for dancers/alumni: leave with a clear sense of artistry, credibility, and contemporary studio presence.

## Product Purpose

Childrens Dance Factory (CDF) is a dance school website for a studio offering competitive and recreational programs in jazz, ballet, gymnastics, and acrobatics. The site exists to present the studio’s identity, programs, staff, competition presence, location, and a path to enrollment contact — not online class booking or tuition payment.

## Positioning

CDF differentiates through a focus on true artistry, led by a founder/artistic director qualified to operate at near industry-leading expert level (Mykhaylo Hetsiy — professional ballet dancer, choreographer, and teacher with deep formal training and decades of experience).

## Operating Context

- Studio at KleinLife Philadelphia: 10100 Jamison Ave, Philadelphia, PA 19116
- Contact path: contact form (Resend), phone `929-248-8120`, email `childancefactory@gmail.com`
- Public surfaces: home, about, classes, staff, contact, store (catalog empty until products ship), competitions
- Store catalog editor at `/admin` and media drop at `/admin/media` are local development only (`NODE_ENV !== production`) and must not be treated as public product surfaces
- Motto (locked): “ALWAYS TO THE TOP, ALWAYS TOGETHER.”
- Mission title (locked): “Where Talent Grows”
- Season mark in use: “SEASON 12”
- Founded: 2015

## Capabilities and Constraints

Confirmed:
- Class disciplines: Jazz, Ballet, Acrobatics, Gymnastics; competitive + recreational messaging
- Staff/founder presentation; location map and directions
- Gallery and competition runway (only verified achievement copy may ship)
- Apparel store UI exists; production catalog is intentionally empty; bag checkout is roster-gated email order / pay in person (no payment gateway)
- Partial i18n scaffolding (`en | ru | uk | ja`) for some chrome; several pages still English-only

Must not invent or change without explicit product approval:
- Motto, mission title, and values already proposed on the site
- Teacher names and roles currently on the site
- Competition names/achievements and other factual claims
- Pricing, tuition, schedules, online booking, testimonials, multi-location claims

Undecided / incomplete (do not fill in):
- Store product catalog and real teacher portrait assets beyond the founder photo

## Brand Commitments

- Primary name: Childrens Dance Factory; short brand: CDF; legal line in use: CDF, LLC
- Canonical site default: https://cdf.studio
- Voice: aspirational, technique-forward, community-minded, stage ambition — editorial/Swiss-caps energy without inventing new slogans that replace locked copy
- Binding locked phrases: “ALWAYS TO THE TOP, ALWAYS TOGETHER.”; “Where Talent Grows”; “SEASON 12” while in season use
- Named people currently on site: Mykhaylo Hetsiy (founder / artistic director); Yuliia Shkoliarova (Choreographer); Tatiana Tatarenko (Ballet Teacher)

## Evidence on Hand

- Logos: site icons in `public/icons/cdf-black.svg`, `cdf-white.svg`
- Hero/visual assets: `public/images/filler.svg` plus production hero media
- Gallery photos: `public/images/gallery/wdc-2026-leap.png`, `wdc-2026-ensemble.png`, `nexstar-2026.png`
- Founder portrait: `public/images/staff/mykhaylo.jpg` (secondary teacher portraits currently use stand-ins)
- Competition list source: `src/lib/competitions.ts` (Showstopper = Regional/National Winners; Starpower = National/Regional Winners; Hall of Fame = Regional Winners; Nexstar = Regional Winners; WDC = 2 Time World Champions)
- Social defaults in layout/social components: Instagram `cdf_dance_school`; TikTok/YouTube `@childancefactory`; Facebook `CDF.danceschool`

Absences — never fabricate:
- Customer testimonials / reviews
- Tuition or membership pricing
- Class schedules or online booking
- Payment processing
- Unverified competition placements
- Additional staff or unverified bios

## Product Principles

1. Artistry first — the site should read as a serious training and performance culture, not a generic kids-activity brochure.
2. Credibility through real people and real evidence — founder expertise, named teachers, and only verified achievements.
3. Enrollment clarity for parents — programs and path to contact stay obvious without inventing booking or pricing systems.
4. Preserve locked brand language — mottos, values, names, and claims already on the site are product truth, not copy to rewrite for flair.
5. Professional and contemporary presence — dancers/alumni should feel the studio is current and high-caliber without hype the product cannot support.

## Accessibility & Inclusion

Honor existing accessibility patterns already in the codebase (skip link, `aria-*`, `prefers-reduced-motion`). No additional statutory standard was established beyond shipping an inclusive public web experience for parents and dancers.

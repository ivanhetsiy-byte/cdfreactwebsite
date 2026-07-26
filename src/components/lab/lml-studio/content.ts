/** Hero title + subline. Subline length matched to "(Found In 2014)" (15). */
export const HERO_TITLE = "Staff";
export const HERO_SUBTITLE = "(Always To Top)";

/** Hero about — name sits in the 35vw offset span (was "Liang Minliang", 14). */
export const ABOUT_NAME = "Mykhaylo Hetsiy";

/**
 * Rest of the about ScrollFloat line after the name.
 * Length matched to LML (~176) so the float rhythm stays the same.
 */
export const ABOUT_BLURB =
  "(Михайло) Child Dance Factory (CDF)™  🕺 merges craft with stage art, using world-trained technique to craft unique dance experiences that give students a lasting stage impact🔖.";

/** Three lines — lengths matched to LML tagline (20 / 20 / 22). */
export const TAGLINE_LINES = [
  "Founder/Lead Artist ",
  "Not just the Teacher,",
  "but also a   Visionary",
] as const;

export const BIO = `I'm Mykhaylo Hetsiy (Михайло, founder of Child Dance Factory), a lead teacher and principal choreographer with a passion shaped across continents—from Guangzhou studios to Broadway in Turkey. Dance is an emotional language of body and rhythm; choreography is a deliberate craft of form and timing. I combine a teacher's care with an artist's bold voice, working across the full process—from cultural traditions and rehearsal to stage direction and original works—to ensure that every detail precisely conveys the spirit of the dance.

I believe that outstanding work comes from the ability to build end to end—an approach that goes beyond technique, rooted in a way of thinking that integrates tradition and invention. At the intersection of cultures and movement, I continue to explore dances that are clear, bold, and sustainable.

I look forward to collaborating with you to create a world woven together by dance and aesthetics.`;

/** Teaching team — framed professional portraits below founder. */
export const TEAM = [
  {
    name: "Yuliia Shkoliarova",
    role: "Choreographer",
    photo: "/images/staff/yuliia.jpg",
    line: "Dedicating over 20 years of her life to the craft, Yuliia Shkoliarova has traveled extensively, performing on stages across the globe and immersing herself in the rich cultural traditions tied to the art of dance. Beginning her journey at the age of five, she spent two decades honing her skills as a performer, drawing inspiration from the diverse styles and techniques she encountered throughout her travels. These experiences have shaped her into an artist with a deep understanding of dance as a universal language, blending cultural influences into her own expressive style.",
  },
  {
    name: "Tatyana Tatarenko",
    role: "Ballet Teacher",
    photo: "/images/staff/tatyana.jpg",
    line: "Holding the highest degree from the Kyiv State Choreographic College, Tatyana Tatarenko began her career as a professional ballet artist, performing for two decades on renowned stages. Throughout her performing years, she specialized in the expressive and technical demands of classical ballet, earning recognition for her precision, artistry, and dedication. Nearly 40 years ago, she transitioned to teaching, bringing the same level of mastery and passion to her students. Over the course of her teaching career, she has trained and mentored generations of dancers, many of whom have gone on to perform and teach professionally.",
  },
] as const;

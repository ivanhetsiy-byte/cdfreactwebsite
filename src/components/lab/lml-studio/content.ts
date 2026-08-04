/** Hero title + subline. Subline length matched to "(Found In 2014)" (15). */
export const HERO_TITLE = "Staff";
export const HERO_SUBTITLE = "(Our Teachers)";

/** Hero about — name sits in the 35vw offset span (was "Liang Minliang", 14). */
export const ABOUT_NAME = "Mykhaylo Hetsiy";

/**
 * Rest of the about ScrollFloat line after the name.
 * Length matched to LML (~176) so the float rhythm stays the same.
 */
export const ABOUT_BLURB =
  "(Михайло) Childrens Dance Factory (CDF)™ merges craft with stage art, using world-trained technique to craft unique dance experiences that give students a lasting stage impact.";

/** Three lines — lengths matched to LML tagline (20 / 20 / 22). */
export const TAGLINE_LINES = [
  "Founder/Lead Artist ",
  "Not just the Teacher,",
  "but also a   Visionary",
] as const;

export const BIO = `Mykhaylo Hetsiy is the founder and artistic director of CDF Dance Studio, a professional ballet dancer, choreographer, and teacher with over 40 years of experience in dance. He graduated from the renowned Pavlo Virsky Choreographic School with a diploma as a ballet artist and holds a master’s degree in choreography and dance education, qualifying him as a ballet master, choreographer, and teacher.

Throughout a 15-year professional performing career, he danced in theaters across Ukraine and China, performed with the world-famous National Honored Academic Dance Ensemble of Ukraine named after Pavlo Virsky, took part in international productions and television and film projects, and shared the stage with Russian and Ukrainian stars. For over 15 years, he has taught jazz, classical ballet, and acrobatics. His students have become winners at regional, national, and world championships.

His mission is not only to train strong dancers, but to help each student unlock their potential, build discipline, confidence, and a lifelong love for the art of dance.`;

/** Shared stand-in — same as founder LML portrait until teacher art is locked. */
const TEACHER_PORTRAIT = "/images/filler.svg";

/** Secondary teachers — Yuliia (left), then Tatiana (mirrored right). */
export const TEAM = [
  {
    name: "Yuliia Shkoliarova",
    role: "Choreographer",
    photo: TEACHER_PORTRAIT,
    line: `Dedicating over 20 years of her life to the craft, Yuliia Shkoliarova has traveled extensively, performing on stages across the globe and immersing herself in the rich cultural traditions tied to the art of dance. Beginning her journey at the age of five, she spent two decades honing her skills as a performer, drawing inspiration from the diverse styles and techniques she encountered throughout her travels.

These experiences have shaped her into an artist with a deep understanding of dance as a universal language, blending cultural influences into her own expressive style.`,
  },
  {
    name: "Tatiana Tatarenko",
    role: "Ballet Teacher",
    photo: TEACHER_PORTRAIT,
    line: `Holding the highest degree from the Kyiv State Choreographic College, Tatiana Tatarenko began her career as a professional ballet artist, performing for two decades on renowned stages. Throughout her performing years, she specialized in the expressive and technical demands of classical ballet, earning recognition for her precision, artistry, and dedication.

Nearly 40 years ago, she transitioned to teaching, bringing the same level of mastery and passion to her students. Over the course of her teaching career, she has trained and mentored generations of dancers, many of whom have gone on to perform and teach professionally.`,
  },
] as const;

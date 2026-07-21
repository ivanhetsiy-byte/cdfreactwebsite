"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { requestRouteCover } from "@/lib/route-cover";

/** Staff page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  kicker: "CDF · THE TEAM",
  headline: "Staff",
  headerBody:
    "The teachers and leaders who shape every class, routine, and stage moment at CDF.",
  people: [
    {
      name: "Mykhaylo Hetsiy",
      role: "Founder · Lead Teacher · Principal Choreographer",
      initials: "MH",
      line: "Mykhaylo Hetsiy is the founder, lead teacher, and principal choreographer of CDF, a visionary artist whose passion for movement has taken him across continents. From the studios of Guangzhou to the stages of Broadway in Turkey, Mr. Hetsiy has immersed himself in a wide range of cultural dance traditions, approaching each with deep respect and dedication. His global journey has shaped a distinctive choreographic voice—one that blends international influences with bold, original expression.",
    },
    {
      name: "Yuliia Shkoliarova",
      role: "Choreographer",
      initials: "YS",
      line: "Dedicating over 20 years of her life to the craft, Yuliia Shkoliarova has traveled extensively, performing on stages across the globe and immersing herself in the rich cultural traditions tied to the art of dance. Beginning her journey at the age of five, she spent two decades honing her skills as a performer, drawing inspiration from the diverse styles and techniques she encountered throughout her travels. These experiences have shaped her into an artist with a deep understanding of dance as a universal language, blending cultural influences into her own expressive style.",
    },
    {
      name: "Tatyana Tatarenko",
      role: "Ballet Teacher",
      initials: "TT",
      line: "Holding the highest degree from the Kyiv State Choreographic College, Tatyana Tatarenko began her career as a professional ballet artist, performing for two decades on renowned stages. Throughout her performing years, she specialized in the expressive and technical demands of classical ballet, earning recognition for her precision, artistry, and dedication. Nearly 40 years ago, she transitioned to teaching, bringing the same level of mastery and passion to her students. Over the course of her teaching career, she has trained and mentored generations of dancers, many of whom have gone on to perform and teach professionally. Her unparalleled expertise, shaped by decades of performance and instruction, continues to influence and elevate the world of ballet.",
    },
  ],
  cta: {
    line: "Ready to train with us?",
    button: "Contact us →",
  },
} as const;

function PortraitPlaceholder({
  initials,
  name,
}: {
  initials: string;
  name: string;
}) {
  return (
    <div
      className="relative aspect-[2/3] w-[16rem] overflow-hidden bg-black dark:bg-white md:w-[19rem] lg:w-[22rem]"
      role="img"
      aria-label={`Portrait placeholder for ${name}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-swiss-compressed text-[clamp(4rem,12vw,7rem)] font-black leading-none tracking-tighter text-white dark:text-black"
      >
        {initials}
      </span>
    </div>
  );
}

export function StaffWireframes() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const handleDelayedNavigation = (targetPath: string) => {
    if (typeof window === "undefined") return;
    if (targetPath === pathname) return;
    if (navLockRef.current) return;

    navLockRef.current = true;

    if (targetPath === "/") {
      sessionStorage.setItem("fromSubpage", "true");
    }

    requestRouteCover();

    setTimeout(() => {
      router.push(targetPath);
      navLockRef.current = false;
    }, 500);
  };

  const fadeUp = (delay = 0) =>
    reducedMotion
      ? {
          initial: false as const,
          whileInView: undefined,
          transition: undefined,
        }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
          viewport: { once: true, amount: 0.25 },
        };

  const slideIn = (fromX: number, delay = 0) =>
    reducedMotion
      ? {
          initial: false as const,
          whileInView: undefined,
          transition: undefined,
        }
      : {
          initial: { opacity: 0, x: fromX },
          whileInView: { opacity: 1, x: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
          viewport: { once: true, amount: 0.25 },
        };

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── Page header — same slot as About / Contact ── */}
      <section
        aria-labelledby="staff-heading"
        className="relative w-full pb-24 md:pb-[10vw]"
      >
        <p className="mb-6 font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:mb-[2vw] md:text-sm">
          {COPY.kicker}
        </p>

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <motion.h1
            id="staff-heading"
            className="font-swiss text-[clamp(3rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[11.5vw]"
            {...slideIn(-64, 0)}
          >
            {COPY.headline}
          </motion.h1>

          <motion.div
            className="flex max-w-[28rem] shrink-0 gap-5 md:max-w-[32rem] md:pt-[1.5vw]"
            {...fadeUp(0.1)}
          >
            <span
              aria-hidden="true"
              className="mt-1 hidden h-[11rem] w-px shrink-0 bg-black dark:bg-white md:block"
            />
            <p className="border-t border-black/20 pt-5 font-alt text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.45] tracking-tight text-[#6b6b6b] dark:border-white/20 md:border-t-0 md:pt-0">
              {COPY.headerBody}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Staff profiles — alternating portrait + copy ── */}
      <section aria-label="Staff members" className="relative w-full">
        <ul className="flex flex-col">
          {COPY.people.map((person, i) => {
            const imageRight = i % 2 === 0;
            const headingId = `staff-person-${i}`;

            return (
              <motion.li
                key={person.name}
                className="border-t border-black/20 py-14 dark:border-white/20 md:py-[6vw]"
                {...fadeUp(i * 0.04)}
              >
                <article
                  aria-labelledby={headingId}
                  className={`flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16 ${
                    imageRight ? "" : "md:flex-row-reverse"
                  }`}
                >
                  <motion.div
                    className="relative mx-auto shrink-0 md:mx-0"
                    {...slideIn(imageRight ? 64 : -64, 0.05)}
                  >
                    <PortraitPlaceholder
                      initials={person.initials}
                      name={person.name}
                    />
                  </motion.div>

                  <motion.div
                    className="flex flex-col gap-4 md:max-w-[42rem] md:pt-[1vw]"
                    {...slideIn(imageRight ? -48 : 48, 0.1)}
                  >
                    <p className="font-swiss text-xs font-medium tracking-[0.24em] text-[#666666] uppercase md:text-sm">
                      {person.role}
                    </p>
                    <h2
                      id={headingId}
                      className="font-swiss text-[clamp(2rem,8vw,3.5rem)] font-bold leading-[0.95] tracking-tighter md:text-[4.5vw]"
                    >
                      {person.name}
                    </h2>
                    <p className="mt-2 max-w-[40rem] font-alt text-[clamp(1rem,1.4vw,1.3125rem)] leading-[1.55] tracking-tight text-[#6b6b6b]">
                      {person.line}
                    </p>
                  </motion.div>
                </article>
              </motion.li>
            );
          })}
        </ul>
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-black dark:bg-white"
        />
      </section>

      {/* ── Closing CTA ── */}
      <section
        aria-labelledby="staff-cta-heading"
        className="relative w-full pt-28 pb-10 md:pt-[10vw] md:pb-[4vw]"
      >
        <motion.h2
          id="staff-cta-heading"
          className="font-swiss text-[clamp(1.85rem,8vw,3rem)] font-bold uppercase leading-[0.95] tracking-tighter md:text-[5.8vw]"
          {...slideIn(-96, 0)}
        >
          {COPY.cta.line}
        </motion.h2>

        <motion.div {...fadeUp(0.12)}>
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              handleDelayedNavigation("/contact");
            }}
            className="mt-8 inline-flex w-fit border-2 border-black bg-black px-10 py-4 font-swiss text-base font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white md:mt-[2vw] md:text-lg"
          >
            {COPY.cta.button}
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { SocialLinks } from "@/components/layout/social-links";
import { requestRouteCover } from "@/lib/route-cover";

/** Short rotating examples for the message field typewriter. */
const MESSAGE_EXAMPLES = [
  "I'd like to enroll my daughter in ballet.",
  "What ages do you accept for gymnastics?",
  "Do you offer trial classes?",
  "Tell me about your competitive teams.",
] as const;

/** Contact page copy — hardcoded English for now; translations can follow later. */
const COPY = {
  kicker: "CDF · GET IN TOUCH",
  headline: "Contact Us",
  headerBody:
    "Questions about classes, schedules, or joining the team? Send us a message and we'll get back to you soon.",
  form: {
    heading: "Send a Message",
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    namePlaceholder: "Your full name",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "(000) 000-0000",
    submit: "Send message →",
    submitting: "Sending…",
    error: "Something went wrong. Please try again.",
  },
  success: {
    kicker: "Thank you",
    title: "Message Sent",
    body: "We've got your note. A member of the CDF team will be in touch soon.",
    home: "Back to home →",
    again: "Send another message",
  },
  details: {
    heading: "The Studio",
    email: { label: "Email", value: "info@cdf.studio" },
    phone: { label: "Phone", value: "929-248-8120" },
    address: {
      label: "Address",
      value: "10100 Jamison Ave, Philadelphia, PA 19116",
    },
    follow: "Follow Us",
  },
} as const;

const labelClass =
  "font-swiss text-xs font-medium tracking-[0.24em] text-[#666666] uppercase md:text-sm";

const inputClass =
  "w-full select-text border-0 border-b border-black/30 bg-transparent py-3 font-alt text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.4] tracking-tight text-black placeholder:text-[#9a9a9a] focus:border-black focus:outline-none dark:border-white/30 dark:text-white dark:placeholder:text-[#666666] dark:focus:border-white";

/** Digits only, capped at 10, displayed as (XXX) XXX-XXXX. */
function formatPhoneInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function phoneDigitCount(formatted: string) {
  return formatted.replace(/\D/g, "").length;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable; keep UI quiet.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-1.5 text-[#999999] transition-colors duration-150 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:text-[#666666] dark:hover:text-white dark:focus-visible:outline-white"
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      )}
    </button>
  );
}

function useCyclingTypewriter(
  phrases: readonly string[],
  reducedMotion: boolean | null,
  paused: boolean,
) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">(
    "typing",
  );

  useEffect(() => {
    if (reducedMotion) {
      setText(phrases[0] ?? "");
      return;
    }
    if (paused) return;

    const phrase = phrases[index] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < phrase.length) {
        timer = setTimeout(() => {
          setText(phrase.slice(0, text.length + 1));
        }, 42);
      } else {
        timer = setTimeout(() => setPhase("holding"), 1800);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), 0);
    } else if (text.length > 0) {
      timer = setTimeout(() => {
        setText((current) => current.slice(0, -1));
      }, 24);
    } else {
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase("typing");
      }, 320);
    }

    return () => clearTimeout(timer);
  }, [text, phase, index, phrases, reducedMotion, paused]);

  return text;
}

export function ContactWireframes() {
  const pathname = usePathname();
  const router = useRouter();
  const navLockRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [messageFocused, setMessageFocused] = useState(false);
  const [messageValue, setMessageValue] = useState("");
  const successHeadingRef = useRef<HTMLParagraphElement>(null);

  const typewriterPaused = messageFocused || messageValue.length > 0;
  const typewriterText = useCyclingTypewriter(
    MESSAGE_EXAMPLES,
    reducedMotion,
    typewriterPaused,
  );

  useEffect(() => {
    if (!sent) return;
    successHeadingRef.current?.focus();
  }, [sent]);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (phoneDigitCount(phoneValue) !== 10) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = phoneValue.trim();
    const message = messageValue.trim();

    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setSubmitError(payload?.error ?? COPY.form.error);
        return;
      }

      form.reset();
      setPhoneValue("");
      setMessageValue("");
      setMessageFocused(false);
      setSent(true);
    } catch {
      setSubmitError(COPY.form.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSubmitError(null);
    setSent(false);
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

  const showTypewriter = !messageFocused && messageValue.length === 0;

  return (
    <div className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select">
      {/* ── Page header — same slot as the About header ── */}
      <section
        aria-labelledby="contact-heading"
        className="relative w-full pb-24 md:pb-[8vw]"
      >
        <p className="mb-6 font-swiss text-xs font-medium tracking-[0.28em] text-[#666666] uppercase md:mb-[2vw] md:text-sm">
          {COPY.kicker}
        </p>

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <motion.h1
            id="contact-heading"
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

      {/* ── Form + studio details ── */}
      <section
        aria-labelledby={sent ? "contact-success-heading" : "contact-form-heading"}
        className="relative w-full pb-16 md:pb-[6vw]"
      >
        <div className="relative pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={sent ? "success-title" : "form-title"}
              id={sent ? "contact-success-heading" : "contact-form-heading"}
              className="font-swiss text-[clamp(2.5rem,10vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tighter md:text-[8vw]"
              initial={
                reducedMotion ? false : { opacity: 0, y: 18 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                reducedMotion ? undefined : { opacity: 0, y: -12 }
              }
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {sent ? COPY.success.title : COPY.form.heading}
            </motion.h2>
          </AnimatePresence>
          <div
            aria-hidden="true"
            className="mt-2 h-[3px] w-full bg-black dark:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
          {/* Form / success */}
          <div className="relative md:col-span-7">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="success"
                  role="status"
                  aria-live="polite"
                  className="flex flex-col gap-8 border-t border-black pt-8 dark:border-white md:border-t-0 md:pt-0"
                  initial={
                    reducedMotion ? false : { opacity: 0, y: 28 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, y: -16 }
                  }
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <p className={labelClass}>{COPY.success.kicker}</p>
                    <p
                      ref={successHeadingRef}
                      tabIndex={-1}
                      className="max-w-[32rem] font-alt text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.4] tracking-tight text-[#6b6b6b] outline-none"
                    >
                      {COPY.success.body}
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    className="h-px w-full max-w-[12rem] bg-black dark:bg-white"
                  />

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                    <Link
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelayedNavigation("/");
                      }}
                      className="inline-flex w-fit cursor-pointer border-2 border-black bg-black px-10 py-4 font-swiss text-base font-bold uppercase tracking-widest text-white transition-colors duration-150 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white md:text-lg"
                    >
                      {COPY.success.home}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSendAnother}
                      className="inline-flex w-fit cursor-pointer font-swiss text-[clamp(1rem,1.4vw,1.25rem)] font-bold uppercase tracking-tight text-[#616161] transition-colors duration-150 hover:text-black dark:hover:text-white"
                    >
                      {COPY.success.again}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="flex flex-col gap-10"
                  onSubmit={handleSubmit}
                  initial={
                    reducedMotion ? false : { opacity: 0, y: 24 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, y: -20, filter: "blur(4px)" }
                  }
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-name" className={labelClass}>
                        {COPY.form.name}
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder={COPY.form.namePlaceholder}
                        className={inputClass}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-email" className={labelClass}>
                        {COPY.form.email}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={COPY.form.emailPlaceholder}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-phone" className={labelClass}>
                      {COPY.form.phone}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      required
                      minLength={14}
                      maxLength={14}
                      pattern="\(\d{3}\) \d{3}-\d{4}"
                      title="Enter a 10-digit US phone number"
                      placeholder={COPY.form.phonePlaceholder}
                      value={phoneValue}
                      onChange={(e) =>
                        setPhoneValue(formatPhoneInput(e.target.value))
                      }
                      onKeyDown={(e) => {
                        const allowed = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "Escape",
                          "Enter",
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                          "Home",
                          "End",
                        ];
                        if (allowed.includes(e.key)) return;
                        if (e.ctrlKey || e.metaKey || e.altKey) return;
                        if (!/^\d$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        setPhoneValue(
                          formatPhoneInput(e.clipboardData.getData("text")),
                        );
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-message" className={labelClass}>
                      {COPY.form.message}
                    </label>
                    <div className="relative">
                      {showTypewriter ? (
                        <p
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-0 py-3 font-alt text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.4] tracking-tight text-[#9a9a9a] dark:text-[#666666]"
                        >
                          {typewriterText}
                          {!reducedMotion ? (
                            <span className="ml-[0.02em] inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] bg-current align-baseline animate-caret-blink" />
                          ) : null}
                        </p>
                      ) : null}
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={6}
                        value={messageValue}
                        onChange={(e) => setMessageValue(e.target.value)}
                        onFocus={() => setMessageFocused(true)}
                        onBlur={() => setMessageFocused(false)}
                        aria-label={COPY.form.message}
                        className={`${inputClass} relative z-10 resize-none bg-transparent`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:gap-8">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-fit cursor-pointer border-2 border-black bg-transparent px-10 py-4 font-swiss text-base font-bold uppercase tracking-widest text-black transition-colors duration-150 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black md:text-lg"
                    >
                      {submitting ? COPY.form.submitting : COPY.form.submit}
                    </button>
                    {submitError ? (
                      <p
                        role="alert"
                        className="font-alt text-[clamp(0.95rem,1.2vw,1.125rem)] leading-[1.4] tracking-tight text-[#b42318]"
                      >
                        {submitError}
                      </p>
                    ) : null}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Studio details */}
          <motion.aside
            aria-label={COPY.details.heading}
            className="flex flex-col md:col-span-4 md:col-start-9"
            {...fadeUp(0.16)}
          >
            <div className="flex flex-col gap-2 border-t border-black py-6 dark:border-white">
              <p className={labelClass}>{COPY.details.email.label}</p>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${COPY.details.email.value}`}
                  className="w-fit font-swiss text-[clamp(1.125rem,1.6vw,1.5rem)] font-bold tracking-tight text-black transition-colors duration-150 hover:text-[#666666] dark:text-white dark:hover:text-[#999999]"
                >
                  {COPY.details.email.value}
                </a>
                <CopyButton
                  value={COPY.details.email.value}
                  label={COPY.details.email.label}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-black/20 py-6 dark:border-white/20">
              <p className={labelClass}>{COPY.details.phone.label}</p>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${COPY.details.phone.value.replace(/[^+\d]/g, "")}`}
                  className="w-fit font-swiss text-[clamp(1.125rem,1.6vw,1.5rem)] font-bold tracking-tight text-black transition-colors duration-150 hover:text-[#666666] dark:text-white dark:hover:text-[#999999]"
                >
                  {COPY.details.phone.value}
                </a>
                <CopyButton
                  value={COPY.details.phone.value}
                  label={COPY.details.phone.label}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-black/20 py-6 dark:border-white/20">
              <p className={labelClass}>{COPY.details.address.label}</p>
              <div className="flex items-start gap-2">
                <p className="font-alt text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.5] tracking-tight text-[#6b6b6b]">
                  {COPY.details.address.value}
                </p>
                <CopyButton
                  value={COPY.details.address.value}
                  label={COPY.details.address.label}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-black/20 py-6 dark:border-white/20">
              <p className={labelClass}>{COPY.details.follow}</p>
              <SocialLinks iconGap="gap-4 md:gap-5" />
            </div>

            <div
              aria-hidden="true"
              className="h-0.5 w-full bg-black dark:bg-white"
            />
          </motion.aside>
        </div>
      </section>
    </div>
  );
}

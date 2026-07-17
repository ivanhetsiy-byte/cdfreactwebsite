"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useLanguage, type Language } from "@/context/LanguageContext";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "ENGLISH" },
  { code: "ru", label: "РУССКИЙ" },
  { code: "uk", label: "УКРАЇНСЬКА" },
  { code: "ja", label: "日本語" },
];

type SettingsContentProps = {
  className?: string;
};

export function SettingsContent({ className = "" }: SettingsContentProps) {
  const { language, setLanguage, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={`flex flex-col gap-16 ${className}`.trim()}>
      <section aria-labelledby="settings-theme-heading">
        <h2
          id="settings-theme-heading"
          className="mb-6 font-swiss text-xs uppercase tracking-widest text-[#666666]"
        >
          {t.settings.theme}
        </h2>
        <div className="flex items-center gap-6 font-swiss text-sm uppercase tracking-widest md:text-base">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`transition-all duration-150 ${
              !isDark
                ? "font-black text-black dark:text-white"
                : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
            }`}
          >
            {t.settings.light}
          </button>
          <span className="text-[#666666]" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`transition-all duration-150 ${
              isDark
                ? "font-black text-black dark:text-white"
                : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
            }`}
          >
            {t.settings.dark}
          </button>
        </div>
      </section>

      <section aria-labelledby="settings-language-heading">
        <h2
          id="settings-language-heading"
          className="mb-6 font-swiss text-xs uppercase tracking-widest text-[#666666]"
        >
          {t.settings.language}
        </h2>
        <ul className="flex flex-col gap-4">
          {LANGUAGE_OPTIONS.map((option) => {
            const active = language === option.code;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`font-swiss text-sm uppercase tracking-widest transition-all duration-150 md:text-base ${
                    active
                      ? "font-black text-black dark:text-white"
                      : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

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

type SettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsSidebar({ open, onClose }: SettingsSidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <>
      {/* Scrim — click outside to dismiss */}
      <button
        type="button"
        aria-label="CLOSE // ESC"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-500 ease-out ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={t.nav.settings}
        className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] z-50 bg-white dark:bg-black text-black dark:text-white p-6 md:p-10 border-l border-black dark:border-white shadow-2xl transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 md:top-10 md:right-10 font-swiss uppercase text-xs tracking-widest text-black dark:text-white hover:opacity-60 transition-opacity duration-150"
        >
          CLOSE // ESC
        </button>

        <div className="mt-16 flex h-[calc(100%-4rem)] flex-col gap-16">
          {/* Division 1 — Theme */}
          <section aria-labelledby="settings-theme-heading">
            <h2
              id="settings-theme-heading"
              className="font-swiss uppercase text-xs tracking-widest text-[#666666] mb-6"
            >
              THEME
            </h2>
            <div className="flex items-center gap-6 font-swiss uppercase text-sm tracking-widest md:text-base">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`transition-all duration-150 ${
                  !isDark
                    ? "font-black text-black dark:text-white"
                    : "font-medium text-[#666666] hover:text-black dark:hover:text-white"
                }`}
              >
                LIGHT
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
                DARK
              </button>
            </div>
          </section>

          {/* Division 2 — Language */}
          <section aria-labelledby="settings-language-heading">
            <h2
              id="settings-language-heading"
              className="font-swiss uppercase text-xs tracking-widest text-[#666666] mb-6"
            >
              LANGUAGE
            </h2>
            <ul className="flex flex-col gap-4">
              {LANGUAGE_OPTIONS.map((option) => {
                const active = language === option.code;
                return (
                  <li key={option.code}>
                    <button
                      type="button"
                      onClick={() => setLanguage(option.code)}
                      className={`font-swiss uppercase text-sm tracking-widest md:text-base transition-all duration-150 ${
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
      </aside>
    </>
  );
}

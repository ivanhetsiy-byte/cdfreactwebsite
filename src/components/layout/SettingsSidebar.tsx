"use client";

import { useEffect } from "react";

import { SettingsContent } from "@/components/layout/SettingsContent";
import { useLanguage } from "@/context/LanguageContext";

type SettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsSidebar({ open, onClose }: SettingsSidebarProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim — click outside to dismiss (desktop) */}
      <button
        type="button"
        aria-label={`${t.settings.close} // ESC`}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 hidden bg-black/40 transition-opacity duration-500 ease-out md:block ${
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
        className={`fixed top-0 right-0 z-50 hidden h-screen w-full border-l border-black bg-white p-6 text-black shadow-2xl transition-transform duration-500 ease-out sm:w-[400px] md:block md:p-10 dark:border-white dark:bg-black dark:text-white ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 font-swiss text-xs uppercase tracking-widest text-black transition-opacity duration-150 hover:opacity-60 md:top-10 md:right-10 dark:text-white"
        >
          {t.settings.close}
        </button>

        <SettingsContent className="mt-16 h-[calc(100%-4rem)]" />
      </aside>
    </>
  );
}

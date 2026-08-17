"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ru" | "uk" | "ja";

const STORAGE_KEY = "cdf-language-pref";

type Dictionary = {
  nav: {
    home: string;
    about: string;
    classes: string;
    staff: string;
    store: string;
    contact: string;
    /** Short chrome label — MENU */
    menu: string;
    /** Short chrome label — CLOSE */
    close: string;
    openMenu: string;
    closeMenu: string;
  };
  footer: {
    explore: string;
    follow: string;
    rights: string;
  };
  notFound: {
    backToHome: string;
  };
};

const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      home: "HOME",
      about: "ABOUT US",
      classes: "CLASSES",
      staff: "STAFF",
      store: "Store",
      contact: "CONTACT US",
      menu: "MENU",
      close: "CLOSE",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    footer: {
      explore: "Explore",
      follow: "Follow Us",
      rights: "© {year} CDF. All rights reserved.",
    },
    notFound: {
      backToHome: "Back to Home",
    },
  },
  ru: {
    nav: {
      home: "ГЛАВНАЯ",
      about: "О НАС",
      classes: "КЛАССЫ",
      staff: "ПЕДАГОГИ",
      store: "Магазин",
      contact: "КОНТАКТЫ",
      menu: "МЕНЮ",
      close: "ЗАКРЫТЬ",
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
    },
    footer: {
      explore: "Навигация",
      follow: "Подписывайтесь",
      rights: "© {year} CDF. Все права защищены.",
    },
    notFound: {
      backToHome: "На главную",
    },
  },
  uk: {
    nav: {
      home: "ГОЛОВНА",
      about: "ПРО НАС",
      classes: "КЛАСИ",
      staff: "ПЕДАГОГИ",
      store: "Магазин",
      contact: "КОНТАКТИ",
      menu: "МЕНЮ",
      close: "ЗАКРИТИ",
      openMenu: "Відкрити меню",
      closeMenu: "Закрити меню",
    },
    footer: {
      explore: "Навігація",
      follow: "Підписуйтесь",
      rights: "© {year} CDF. Усі права захищено.",
    },
    notFound: {
      backToHome: "На головну",
    },
  },
  ja: {
    nav: {
      home: "ホーム",
      about: "私たちについて",
      classes: "クラス",
      staff: "スタッフ",
      store: "ストア",
      contact: "お問い合わせ",
      menu: "メニュー",
      close: "閉じる",
      openMenu: "メニューを開く",
      closeMenu: "メニューを閉じる",
    },
    footer: {
      explore: "ナビ",
      follow: "フォローする",
      rights: "© {year} CDF. All rights reserved.",
    },
    notFound: {
      backToHome: "ホームへ戻る",
    },
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "ru" || value === "uk" || value === "ja";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) {
        setLanguageState(stored);
      }
    } catch {
      // Ignore storage failures — keep default English.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: dictionaries[language],
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

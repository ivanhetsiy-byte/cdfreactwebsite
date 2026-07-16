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

/** Cascading Mission Statement title — locked English Helvetica, never translated. */
export const MISSION_LOCKED_TITLE = {
  where: "Where",
  talent: "Talent",
  grows: "Grows",
  full: "Where Talent Grows",
} as const;

const STORAGE_KEY = "cdf-language";

type Dictionary = {
  nav: {
    home: string;
    about: string;
    classes: string;
    staff: string;
    contact: string;
    settings: string;
  };
  footer: {
    enrollment: string;
  };
  notFound: {
    backToHome: string;
  };
  /** Descriptive Mission Statement blocks — title lines stay in MISSION_LOCKED_TITLE; danceForAllAges is locked English. */
  mission: {
    jazzBalletAcro: string;
    professionalPedagogy: string;
    /** Locked English — never translate across locales. */
    danceForAllAges: string;
  };
  settings: {
    close: string;
    theme: string;
    light: string;
    dark: string;
    language: string;
  };
};

const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      home: "HOME",
      about: "ABOUT US",
      classes: "CLASSES",
      staff: "STAFF",
      contact: "CONTACT US",
      settings: "SETTINGS",
    },
    footer: {
      enrollment: "Enrollment Open for Fall 2026 →",
    },
    notFound: {
      backToHome: "Back to Home",
    },
    mission: {
      jazzBalletAcro: "JAZZ, BALLET, ACRO...",
      professionalPedagogy: "Professional Pedagogy",
      danceForAllAges: "Dance for all",
    },
    settings: {
      close: "CLOSE // ESC",
      theme: "THEME",
      light: "LIGHT",
      dark: "DARK",
      language: "LANGUAGE",
    },
  },
  ru: {
    nav: {
      home: "ГЛАВНАЯ",
      about: "О НАС",
      classes: "КЛАССЫ",
      staff: "ПЕДАГОГИ",
      contact: "КОНТАКТЫ",
      settings: "НАСТРОЙКИ",
    },
    footer: {
      enrollment: "Набор открыт на осень 2026 →",
    },
    notFound: {
      backToHome: "На главную",
    },
    mission: {
      jazzBalletAcro: "ДЖАЗ, БАЛЕТ, АКРО...",
      professionalPedagogy: "Профессиональная педагогика",
      danceForAllAges: "Dance for all",
    },
    settings: {
      close: "ЗАКРЫТЬ // ESC",
      theme: "ТЕМА",
      light: "СВЕТЛАЯ",
      dark: "ТЁМНАЯ",
      language: "ЯЗЫК",
    },
  },
  uk: {
    nav: {
      home: "ГОЛОВНА",
      about: "ПРО НАС",
      classes: "КЛАСИ",
      staff: "ПЕДАГОГИ",
      contact: "КОНТАКТИ",
      settings: "НАЛАШТУВАННЯ",
    },
    footer: {
      enrollment: "Набір відкрито на осінь 2026 →",
    },
    notFound: {
      backToHome: "На головну",
    },
    mission: {
      jazzBalletAcro: "ДЖАЗ, БАЛЕТ, АКРО...",
      professionalPedagogy: "Професійна педагогіка",
      danceForAllAges: "Dance for all",
    },
    settings: {
      close: "ЗАКРИТИ // ESC",
      theme: "ТЕМА",
      light: "СВІТЛА",
      dark: "ТЕМНА",
      language: "МОВА",
    },
  },
  ja: {
    nav: {
      home: "ホーム",
      about: "私たちについて",
      classes: "クラス",
      staff: "スタッフ",
      contact: "お問い合わせ",
      settings: "設定",
    },
    footer: {
      enrollment: "2026年秋の入学受付中 →",
    },
    notFound: {
      backToHome: "ホームへ戻る",
    },
    mission: {
      jazzBalletAcro: "ジャズ、バレエ、アクロ...",
      professionalPedagogy: "プロフェッショナル指導",
      danceForAllAges: "Dance for all",
    },
    settings: {
      close: "閉じる // ESC",
      theme: "テーマ",
      light: "ライト",
      dark: "ダーク",
      language: "言語",
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
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
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

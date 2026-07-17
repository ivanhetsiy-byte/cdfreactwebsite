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

/** Studio motto — locked English, never translated. */
export const HOME_LOCKED_MOTTO = {
  line1: "ALWAYS TO THE TOP,",
  line2: "ALWAYS TOGETHER.",
  full: "ALWAYS TO THE TOP, ALWAYS TOGETHER.",
} as const;

/** Hero discipline rail — locked English. */
export const HOME_LOCKED_DISCIPLINES = "JAZZ · BALLET · ACRO";

/** Current season mark — locked English. */
export const HOME_LOCKED_SEASON = "SEASON 12";

const STORAGE_KEY = "cdf-language-pref";

type Dictionary = {
  nav: {
    home: string;
    about: string;
    classes: string;
    staff: string;
    contact: string;
    settings: string;
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
  /** Descriptive Mission Statement blocks — title lines stay in MISSION_LOCKED_TITLE; danceForAllAges is locked English. */
  mission: {
    jazzBalletAcro: string;
    professionalPedagogy: string;
    /** Locked English — never translate across locales. */
    danceForAllAges: string;
  };
  home: {
    motto: {
      index: string;
      label: string;
    };
    programs: {
      index: string;
      label: string;
      headline: string;
      body: string;
      cta: string;
      competitive: { name: string; line: string };
      recreational: { name: string; line: string };
    };
    gallery: {
      index: string;
      label: string;
    };
    enrollmentCta: {
      index: string;
      line: string;
      cta: string;
    };
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
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    footer: {
      explore: "Explore",
      follow: "Follow",
      rights: "© {year} CDF. All rights reserved.",
    },
    notFound: {
      backToHome: "Back to Home",
    },
    mission: {
      jazzBalletAcro: "JAZZ, BALLET, ACRO...",
      professionalPedagogy: "Professional Pedagogy",
      danceForAllAges: "Dance for all",
    },
    home: {
      motto: {
        index: "01",
        label: "Our Motto",
      },
      programs: {
        index: "02",
        label: "Programs",
        headline: "Ages 3–18",
        body: "Competitive and recreational groups built for every stage of the journey.",
        cta: "View classes →",
        competitive: {
          name: "Competitive",
          line: "Technique-driven training for dancers who want the stage.",
        },
        recreational: {
          name: "Recreational",
          line: "Joyful classes that build skill, confidence, and love of dance.",
        },
      },
      gallery: {
        index: "03",
        label: "Gallery",
      },
      enrollmentCta: {
        index: "04",
        line: "Fall enrollment is open",
        cta: "Check fall enrollment →",
      },
    },
    settings: {
      close: "CLOSE",
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
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
    },
    footer: {
      explore: "Навигация",
      follow: "Соцсети",
      rights: "© {year} CDF. Все права защищены.",
    },
    notFound: {
      backToHome: "На главную",
    },
    mission: {
      jazzBalletAcro: "ДЖАЗ, БАЛЕТ, АКРО...",
      professionalPedagogy: "Профессиональная педагогика",
      danceForAllAges: "Dance for all",
    },
    home: {
      motto: {
        index: "01",
        label: "Наш девиз",
      },
      programs: {
        index: "02",
        label: "Программы",
        headline: "Возраст 3–18",
        body: "Соревновательные и любительские группы для каждого этапа пути.",
        cta: "Смотреть классы →",
        competitive: {
          name: "Соревновательные",
          line: "Тренировки с акцентом на технику для тех, кто хочет сцену.",
        },
        recreational: {
          name: "Любительские",
          line: "Занятия, которые дают навык, уверенность и любовь к танцу.",
        },
      },
      gallery: {
        index: "03",
        label: "Галерея",
      },
      enrollmentCta: {
        index: "04",
        line: "Открыт набор на осень",
        cta: "Узнать про осенний набор →",
      },
    },
    settings: {
      close: "ЗАКРЫТЬ",
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
      openMenu: "Відкрити меню",
      closeMenu: "Закрити меню",
    },
    footer: {
      explore: "Навігація",
      follow: "Соцмережі",
      rights: "© {year} CDF. Усі права захищено.",
    },
    notFound: {
      backToHome: "На головну",
    },
    mission: {
      jazzBalletAcro: "ДЖАЗ, БАЛЕТ, АКРО...",
      professionalPedagogy: "Професійна педагогіка",
      danceForAllAges: "Dance for all",
    },
    home: {
      motto: {
        index: "01",
        label: "Наш девіз",
      },
      programs: {
        index: "02",
        label: "Програми",
        headline: "Вік 3–18",
        body: "Змагальні та аматорські групи для кожного етапу шляху.",
        cta: "Дивитися класи →",
        competitive: {
          name: "Змагальні",
          line: "Тренування з акцентом на техніку для тих, хто хоче сцену.",
        },
        recreational: {
          name: "Аматорські",
          line: "Заняття, що дають навичку, впевненість і любов до танцю.",
        },
      },
      gallery: {
        index: "03",
        label: "Галерея",
      },
      enrollmentCta: {
        index: "04",
        line: "Відкрито набір на осінь",
        cta: "Дізнатися про осінній набір →",
      },
    },
    settings: {
      close: "ЗАКРИТИ",
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
      openMenu: "メニューを開く",
      closeMenu: "メニューを閉じる",
    },
    footer: {
      explore: "ナビ",
      follow: "フォロー",
      rights: "© {year} CDF. All rights reserved.",
    },
    notFound: {
      backToHome: "ホームへ戻る",
    },
    mission: {
      jazzBalletAcro: "ジャズ、バレエ、アクロ...",
      professionalPedagogy: "プロフェッショナル指導",
      danceForAllAges: "Dance for all",
    },
    home: {
      motto: {
        index: "01",
        label: "私たちのモットー",
      },
      programs: {
        index: "02",
        label: "プログラム",
        headline: "対象年齢 3–18歳",
        body: "競技グループとレクリエーショングループ — それぞれの段階に合わせて。",
        cta: "クラスを見る →",
        competitive: {
          name: "競技",
          line: "ステージを目指すダンサーのための技術重視のトレーニング。",
        },
        recreational: {
          name: "レクリエーション",
          line: "スキルと自信、ダンスへの愛を育む楽しいクラス。",
        },
      },
      gallery: {
        index: "03",
        label: "ギャラリー",
      },
      enrollmentCta: {
        index: "04",
        line: "秋の入学受付中",
        cta: "秋の入学を確認 →",
      },
    },
    settings: {
      close: "閉じる",
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

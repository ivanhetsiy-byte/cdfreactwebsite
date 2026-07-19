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
    programs: {
      headline: string;
      body: string;
      cta: string;
      competitive: { name: string; line: string };
      recreational: { name: string; line: string };
    };
    gallery: {
      label: string;
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
      programs: {
        headline: "Ages 3 - 18",
        body: "Competitive and recreational groups built for every stage of the journey.",
        cta: "View classes →",
        competitive: {
          name: "Competitive",
          line: "Technique-driven training for dancers who want the stage. Structured classes build discipline, confidence, and teamwork while preparing students for competition and performance.",
        },
        recreational: {
          name: "Recreational",
          line: "Welcoming classes that build foundational technique, creativity, and confidence. Designed for dancers who love to move and grow—without the commitment of competition.",
        },
      },
      gallery: {
        label: "Gallery",
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
      programs: {
        headline: "Возраст 3 - 18",
        body: "Соревновательные и любительские группы для каждого этапа пути.",
        cta: "Смотреть классы →",
        competitive: {
          name: "Соревновательные",
          line: "Тренировки с акцентом на технику для тех, кто хочет сцену. Структурированные занятия развивают дисциплину, уверенность и командный дух, готовя учеников к соревнованиям и выступлениям.",
        },
        recreational: {
          name: "Любительские",
          line: "Доброжелательные занятия, которые дают базовую технику, креативность и уверенность. Для тех, кто любит двигаться и расти — без обязательств соревновательной программы.",
        },
      },
      gallery: {
        label: "Галерея",
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
      programs: {
        headline: "Вік 3 - 18",
        body: "Змагальні та аматорські групи для кожного етапу шляху.",
        cta: "Дивитися класи →",
        competitive: {
          name: "Змагальні",
          line: "Тренування з акцентом на техніку для тих, хто хоче сцену. Структуровані заняття розвивають дисципліну, впевненість і командний дух, готуючи учнів до змагань і виступів.",
        },
        recreational: {
          name: "Аматорські",
          line: "Дружні заняття, що дають базову техніку, креативність і впевненість. Для тих, хто любить рухатися і зростати — без зобов’язань змагальної програми.",
        },
      },
      gallery: {
        label: "Галерея",
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
      programs: {
        headline: "対象年齢 3 - 18歳",
        body: "競技グループとレクリエーショングループ — それぞれの段階に合わせて。",
        cta: "クラスを見る →",
        competitive: {
          name: "競技",
          line: "ステージを目指すダンサーのための技術重視のトレーニング。体系的なクラスで規律・自信・チームワークを養い、競技と公演に備えます。",
        },
        recreational: {
          name: "レクリエーション",
          line: "基礎技術・創造性・自信を育む、親しみやすいクラス。競技へのコミットなしで、動くことと成長を楽しむダンサーのために。",
        },
      },
      gallery: {
        label: "ギャラリー",
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

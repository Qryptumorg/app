import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { translations, type Language, type TranslationSet } from "./translations";

const LANG_KEY = "qryptum_lang";

function getSavedLang(): Language {
    try {
        const s = localStorage.getItem(LANG_KEY);
        if (s === "en" || s === "ru" || s === "zh") return s;
    } catch {}
    return "en";
}

interface LanguageContextValue {
    lang: Language;
    setLang: (l: Language) => void;
    t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextValue>({
    lang: "en",
    setLang: () => {},
    t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(getSavedLang);

    const setLang = (l: Language) => {
        setLangState(l);
        try { localStorage.setItem(LANG_KEY, l); } catch {}
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    return useContext(LanguageContext);
}

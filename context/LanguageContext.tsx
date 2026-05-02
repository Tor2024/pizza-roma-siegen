'use client';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { dictionaries } from '@/lib/i18n';

interface LanguageContextType {
  t: (key: string) => string;
  lang: Lang;
  setLanguage?: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type Lang = 'de' | 'ru';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('de');

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('pizza-roma-lang') as Lang;
    if (savedLang && (savedLang === 'de' || savedLang === 'ru')) {
      // Avoid setState during render by checking if value actually changed
      if (savedLang !== lang) {
        setLang(savedLang);
      }
    }
  }, []);

  // Save language when changed
  const setLanguage = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('pizza-roma-lang', newLang);
  };

  const t = (key: string) => {
    // Fallback to 'de' if language not found in dictionaries
    const dict = (dictionaries as Record<string, Record<string, string>>)[lang] || dictionaries.de;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, lang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

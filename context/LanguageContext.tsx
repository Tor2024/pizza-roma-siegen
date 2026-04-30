'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Lang } from '@/lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('de');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang;
    if (savedLang && (savedLang === 'de' || savedLang === 'ru')) {
      setLangState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string) => {
    return dictionaries[lang][key as keyof typeof dictionaries.de] || key;
  };

  // Prevent hydration mismatch - render default first, then update
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang: 'de', setLang: () => {}, t: (k) => k }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

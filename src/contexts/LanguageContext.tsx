'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Default empty translations - will be loaded dynamically
const defaultTranslations: Record<Language, Record<string, any>> = {
  en: {},
  fa: {},
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translationsData, setTranslationsData] = useState<Record<Language, Record<string, any>>>(defaultTranslations);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load translations dynamically
    const loadTranslations = async () => {
      try {
        // Use dynamic imports for JSON files
        const [enModule, faModule] = await Promise.all([
          import('@/translations/en.json'),
          import('@/translations/fa.json'),
        ]);
        
        const enData = enModule.default || enModule;
        const faData = faModule.default || faModule;
        
        setTranslationsData({
          en: enData,
          fa: faData,
        });
        setLoaded(true);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Set empty translations as fallback
        setTranslationsData(defaultTranslations);
        setLoaded(true);
      }
    };

    loadTranslations();
  }, []);

  useEffect(() => {
    // Load saved language preference and set document direction
    if (typeof window !== 'undefined' && loaded) {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      let initialLanguage: Language = 'en';
      
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fa')) {
        initialLanguage = savedLanguage;
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'fa') {
          initialLanguage = 'fa';
        }
      }
      
      setLanguageState(initialLanguage);
      
      // Set document direction and language
      document.documentElement.dir = initialLanguage === 'fa' ? 'rtl' : 'ltr';
      document.documentElement.lang = initialLanguage;
    }
  }, [loaded]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'fa' : 'en';
    setLanguage(newLang);
  };

  const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!loaded) return key;
    
    // Get translation from current language, fallback to English
    let translation = getNestedValue(translationsData[language], key) || 
                     getNestedValue(translationsData['en'], key) || 
                     key;
    
    // Handle pluralization (simple case)
    if (translation.includes('{{plural}}') && params?.count !== undefined) {
      const plural = params.count === 1 ? '' : 's';
      translation = translation.replace('{{plural}}', plural);
    }
    
    // Replace parameters
    if (params) {
      translation = translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return translation;
  };

  const isRTL = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    // Return default values if context is not available (for SSR)
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string) => key,
      isRTL: false,
    };
  }
  
  return context;
}

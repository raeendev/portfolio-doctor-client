'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setThemeState(initialTheme);
    setMounted(true);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', newTheme);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Always provide context, even before mount
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  // Return default values if context is not available (for server-side rendering or before mount)
  if (context === undefined) {
    // Check if we're in the browser and can access localStorage directly
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const defaultTheme: Theme = savedTheme || 'dark';
      
      return {
        theme: defaultTheme,
        toggleTheme: () => {
          console.warn('ThemeProvider not available');
        },
        setTheme: () => {
          console.warn('ThemeProvider not available');
        },
      };
    }
    
    // Server-side or before mount
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  
  return context;
}


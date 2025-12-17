import { useState, useEffect } from 'react';

const THEME_KEY = 'r7_theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}

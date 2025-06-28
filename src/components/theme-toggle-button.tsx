"use client";

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

function ThemeToggleButtonComponent() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentEffectiveTheme = theme === 'system' ? resolvedTheme : theme;

  if (!mounted) {
    // Placeholder to avoid layout shift and hydration mismatch
    return (
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <div className="h-5 w-9 sm:h-6 sm:w-11 rounded-full bg-input" /> {/* Mimics Switch dimensions */}
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      </div>
    );
  }

  const isDarkMode = currentEffectiveTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Sun className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch
        id="theme-mode-switch"
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        className="scale-75 sm:scale-100"
      />
      <Moon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
}

export const ThemeToggleButton = React.memo(ThemeToggleButtonComponent);

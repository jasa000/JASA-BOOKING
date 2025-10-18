
'use client';

import React, { useEffect } from 'react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorTheme, settingsLoading } = useTheme();

  useEffect(() => {
    // Wait until settings are loaded to prevent flashes or incorrect initial themes.
    if (settingsLoading) {
      return;
    }

    const body = document.body;

    // Remove any existing theme-` classes to ensure a clean slate.
    body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        body.classList.remove(className);
      }
    });

    // Add the new theme class if it's not the default 'zinc' theme.
    // The default 'zinc' styles are applied via globals.css, so no class is needed for it.
    if (colorTheme !== 'zinc') {
      body.classList.add(`theme-${colorTheme}`);
    }
  }, [colorTheme, settingsLoading]);
  
  return (
    <div
      className={cn(
        'font-body antialiased min-h-screen bg-background',
      )}
    >
        {children}
    </div>
  );
}

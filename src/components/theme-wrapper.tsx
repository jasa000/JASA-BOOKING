
'use client';

import React, { useEffect } from 'react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorTheme, settingsLoading, previewColorTheme } = useTheme();

  useEffect(() => {
    // Determine the active theme: preview takes precedence over saved theme.
    const activeTheme = previewColorTheme || colorTheme;
    
    // Don't apply themes until settings are loaded to avoid flashes.
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

    // Add the new theme class.
    body.classList.add(`theme-${activeTheme}`);
    
  }, [colorTheme, settingsLoading, previewColorTheme]);
  
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

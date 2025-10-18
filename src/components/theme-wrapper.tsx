
'use client';

import React, { useEffect } from 'react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorTheme, settingsLoading } = useTheme();

  useEffect(() => {
    document.body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });

    if (!settingsLoading && colorTheme !== 'zinc') {
      document.body.classList.add(`theme-${colorTheme}`);
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

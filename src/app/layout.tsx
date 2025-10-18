
'use client';

import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { cn } from '@/lib/utils';
import React from 'react';

function AppBody({ children }: { children: React.ReactNode }) {
  const { colorTheme, settingsLoading } = useTheme();

  return (
    <body
      className={cn(
        'font-body antialiased min-h-screen bg-background',
        !settingsLoading && colorTheme !== 'zinc' && `theme-${colorTheme}`
      )}
    >
      {children}
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <ThemeProvider>
        <AppBody>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </AppBody>
      </ThemeProvider>
    </html>
  );
}

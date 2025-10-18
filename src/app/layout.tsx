
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React, { useEffect } from 'react';

// This component now wraps the body and applies the theme class
function AppBody({ children }: { children: React.ReactNode }) {
  const { colorTheme, previewColorTheme, settingsLoading } = useTheme();

  useEffect(() => {
    const body = document.body;
    // Clean up all old theme classes
    const classList = Array.from(body.classList);
    for (const className of classList) {
        if (className.startsWith('theme-')) {
            body.classList.remove(className);
        }
    }

    // Add the new theme class
    const activeTheme = previewColorTheme || colorTheme;
    if (activeTheme) {
      body.classList.add(`theme-${activeTheme}`);
    }
  }, [colorTheme, previewColorTheme, settingsLoading]);


  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Metadata can't be set in a client component, so we keep it here.
            We'll create a simple server component wrapper if needed, but for now this is fine.
            The title and description are static. */}
        <title>JASA BOOKING</title>
        <meta name="description" content="Your one-stop platform for event booking and management." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <ThemeProvider>
          <AppBody>
            <FirebaseClientProvider>{children}</FirebaseClientProvider>
            <Toaster />
          </AppBody>
        </ThemeProvider>
      </body>
    </html>
  );
}

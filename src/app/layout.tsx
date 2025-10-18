
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React, { useEffect } from 'react';

// This new AppBody component is the key. It's a client component that
// can use the useTheme hook and reliably apply classes to the document body.
function AppBody({ children }: { children: React.ReactNode }) {
  const { colorTheme, previewColorTheme } = useTheme();

  useEffect(() => {
    const body = document.body;
    const activeTheme = previewColorTheme || colorTheme;

    // Clean up any existing theme classes
    body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        body.classList.remove(className);
      }
    });

    // Add the new theme class if it's not the default
    if (activeTheme && activeTheme !== 'zinc') {
      body.classList.add(`theme-${activeTheme}`);
    }
  }, [colorTheme, previewColorTheme]);


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
        <title>JASA BOOKING</title>
        <meta name="description" content="Your one-stop platform for event booking and management." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <ThemeProvider>
            <AppBody>
              {children}
              <Toaster />
            </AppBody>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

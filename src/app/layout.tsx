
'use client';

import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React, { useEffect } from 'react';


function AppBody({ children }: { children: React.ReactNode }) {
  const { colorTheme, settingsLoading } = useTheme();

  // This logic now runs on every render to ensure the class is always correct.
  if (typeof window !== 'undefined' && !settingsLoading) {
    const body = document.body;
    
    // Create a new class list by filtering out any existing theme classes.
    const newClassList = Array.from(body.classList).filter(
      (cls) => !cls.startsWith('theme-')
    );

    // Always add the class for the currently loaded theme.
    // If the theme is the default "zinc", no class is needed.
    if (colorTheme && colorTheme !== 'zinc') {
      newClassList.push(`theme-${colorTheme}`);
    }
    
    body.className = newClassList.join(' ');
  }


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

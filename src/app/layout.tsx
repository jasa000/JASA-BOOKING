
'use client';

import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import React from 'react';

// This AppBody component is the key. It's a client component that
// can use the useTheme hook and reliably apply classes to the document body.
function AppBody({ children }: { children: React.ReactNode }) {
  const { colorTheme } = useTheme();

  // This logic now runs on every render on the client, ensuring the class is always correct.
  if (typeof window !== 'undefined') {
    const body = document.body;
    
    // Create a new class list by filtering out any existing theme classes.
    const newClassList = Array.from(body.classList).filter(
      (cls) => !cls.startsWith('theme-')
    );

    // If there is a color theme from the DB, and it's not the default red, add its class.
    if (colorTheme && colorTheme !== 'red') {
      newClassList.push(`theme-${colorTheme}`);
    }

    // Set the className property directly. This is an atomic operation and more
    // reliable than adding/removing individual classes in a loop.
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

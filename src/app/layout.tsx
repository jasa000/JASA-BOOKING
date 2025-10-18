
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { cn } from '@/lib/utils';
import React from 'react';

// This component now needs to be a client component to use the useTheme hook.
// We wrap the main layout logic in a component that can access the theme context.
function AppBody({ children }: { children: React.ReactNode }) {
  const { theme, colorTheme } = useTheme();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <body
      className={cn(
        'font-body antialiased min-h-screen bg-background'
      )}
    >
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
      <Toaster />
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
      <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
        <AppBody>
          {children}
        </AppBody>
      </ThemeProvider>
    </html>
  );
}

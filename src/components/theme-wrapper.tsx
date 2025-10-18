
'use client';

import React from 'react';

// This component is no longer needed as its logic has been moved into ThemeProvider.
// It can be safely removed from the project if it's not referenced elsewhere, 
// but for now, returning children is safe.

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

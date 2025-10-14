'use client';

import { ReactNode, useEffect, useState } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

function MissingEnvVarsError() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="rounded-lg border border-destructive bg-card p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
        <p className="mt-4 text-card-foreground">
          Your Firebase environment variables are not set.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please copy the <code className="rounded bg-muted px-1 py-0.5 font-mono">.env.example</code> file to <code className="rounded bg-muted px-1 py-0.5 font-mono">.env.local</code> and fill in your Firebase project details.
        </p>
         <a href="https://firebase.google.com/docs/web/setup#find-config-object" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-primary underline">
          Find your Firebase config object here.
        </a>
      </div>
    </div>
  )
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseInstances, setFirebaseInstances] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    const instances = initializeFirebase();
    if (instances.firebaseApp) {
      setFirebaseInstances(instances);
    } else {
      setConfigError(true);
    }
  }, []);

  if (configError) {
    return <MissingEnvVarsError />;
  }

  if (!firebaseInstances) {
    return null; // or a loading indicator
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseInstances.firebaseApp}
      auth={firebaseInstances.auth}
      firestore={firebaseInstances.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, DocumentReference, doc, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export const useDoc = <T extends DocumentData>(ref: DocumentReference<T> | null) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ ...docSnap.data(), id: docSnap.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching document:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref?.path]); 

  return { data, loading, error };
};

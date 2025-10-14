
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, QuerySnapshot, DocumentData, collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export const useCollection = <T extends DocumentData>(query: Query<T> | null) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query?.path]);

  return { data, loading, error };
};

    

'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Institution } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';

export function InstitutionFilter() {
  const firestore = useFirestore();

  const institutionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const institutionsQuery = useMemo(() => {
    if (!institutionsCollectionRef) return null;
    return query(institutionsCollectionRef, orderBy('name', 'asc'));
  }, [institutionsCollectionRef]);

  const {
    data: institutions,
    loading,
    error,
  } = useCollection<Institution>(institutionsQuery);

  if (error) {
    return (
      <div className="container h-14 flex items-center justify-center">
          <p className="text-sm text-destructive">Error loading institutions.</p>
      </div>
    );
  }

  return (
    <div className="border-t">
        <div className="container py-4">
            <h3 className="text-lg font-semibold mb-2 font-headline">Browse by Institution</h3>
            <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-28 rounded-md" />
                ))
                ) : (
                institutions?.map((institution) => (
                    <Link key={institution.id} href={`/institution/${encodeURIComponent(institution.name)}`} passHref>
                        <Button
                            variant='outline'
                            size="sm"
                            className="shrink-0"
                            >
                            {institution.name}
                        </Button>
                    </Link>
                ))
                )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    </div>
  );
}

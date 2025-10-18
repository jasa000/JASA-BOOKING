
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Institution } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { MapPin } from 'lucide-react';

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
      <div className="container py-8">
        <p className="text-sm text-destructive">Error loading institutions.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        <h2 className="text-3xl font-bold font-headline mb-6 text-center">Browse by Institution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : institutions?.filter(inst => inst.mainImageUrl).map((institution) => (
                  <Link
                    key={institution.id}
                    href={`/institution/${encodeURIComponent(institution.name)}`}
                    passHref
                  >
                    <Card className="overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                      <div className="relative h-40 w-full bg-muted">
                        {institution.mainImageUrl && (
                          <Image
                            src={institution.mainImageUrl}
                            alt={institution.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <h3 className="font-semibold font-headline text-lg truncate hover:text-primary transition-colors">
                          {institution.name}
                        </h3>
                        <div className="text-sm text-muted-foreground flex items-center mt-2">
                          <MapPin className="mr-1.5 h-4 w-4 shrink-0" />
                          <span>{`${institution.district}, ${institution.state}`}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
      </div>
    </div>
  );
}

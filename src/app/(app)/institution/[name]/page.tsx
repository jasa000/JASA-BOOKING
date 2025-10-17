
'use client';

import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function InstitutionPage() {
  const firestore = useFirestore();
  const params = useParams();
  const institutionName = decodeURIComponent(params.name as string);

  const eventsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);

  const institutionEventsQuery = useMemo(() => {
    if (!eventsCollectionRef) return null;
    return query(
      eventsCollectionRef,
      where('status', '==', 'approved'),
      where('institution', '==', institutionName),
      orderBy('date', 'asc')
    );
  }, [eventsCollectionRef, institutionName]);

  const {
    data: events,
    loading,
    error,
  } = useCollection<Event>(institutionEventsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">Events at: <span className="text-primary">{institutionName}</span></h1>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[180px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="col-span-full text-center py-12 text-destructive">
            <h2 className="text-2xl font-semibold">Error Loading Events</h2>
            <p>{error.message}</p>
          </div>
        )}

        {!loading && !error && events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && (!events || events.length === 0) && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Events Found</h2>
            <p>
              There are currently no events for the &quot;{institutionName}&quot; institution.
            </p>
          </div>
        )}
      </div>
  );
}

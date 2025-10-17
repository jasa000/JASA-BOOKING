
'use client';

import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryFilter } from '@/components/category-filter';

export default function EventsPage() {
  const firestore = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch approved events
  const eventsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);

  const approvedEventsQuery = useMemo(() => {
    if (!eventsCollectionRef) return null;
    return query(
      eventsCollectionRef,
      where('status', '==', 'approved'),
      orderBy('date', 'asc')
    );
  }, [eventsCollectionRef]);

  const {
    data: allEvents,
    loading,
    error,
  } = useCollection<Event>(approvedEventsQuery);

  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    if (selectedCategory === 'all') {
      return allEvents;
    }
    return allEvents.filter((event) => event.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  return (
    <>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="container mx-auto px-4 py-8">
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

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Events Found</h2>
            <p>
              There are no events matching the selected category. Try a
              different one!
            </p>
          </div>
        )}
      </div>
    </>
  );
}

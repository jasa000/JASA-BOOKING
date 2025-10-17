
'use client';

import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryFilter } from '@/components/category-filter';
import { usePathname } from 'next/navigation';

export default function EventsPage() {
  const firestore = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const pathname = usePathname();
  const showCategoryFilter = pathname === '/';

  // 1. Fetch all approved events
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
    loading: eventsLoading,
    error: eventsError,
  } = useCollection<Event>(approvedEventsQuery);
  
  // 2. Filter events based on selected category
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    if (selectedCategory === 'all') {
      return allEvents;
    }
    return allEvents.filter(event => event.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  const loading = eventsLoading;
  const error = eventsError;
  
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <>
      {showCategoryFilter && (
        <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
           <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
        </div>
      )}
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

        {!loading && !error && filteredEvents && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && (!filteredEvents || filteredEvents.length === 0) && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Events Found</h2>
            <p>
              There are currently no events {selectedCategory === 'all' ? '' : `in the "${selectedCategory}" category`}.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

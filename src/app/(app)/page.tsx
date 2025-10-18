
'use client';

import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WelcomeBanner } from '@/components/welcome-banner';
import { CategoryFilter } from '@/components/category-filter';
import { InstitutionFilter } from '@/components/institution-filter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function EventsPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    error,
  } = useCollection<Event>(approvedEventsQuery);

  // 2. Filter events based on selected category
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    if (selectedCategory === 'all') return allEvents;
    return allEvents.filter((event) => event.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  if (error) {
    return (
        <div className="col-span-full text-center py-12 text-destructive">
          <h2 className="text-2xl font-semibold">Error Loading Page</h2>
          <p>{error.message}</p>
        </div>
    )
  }

  const loading = eventsLoading || userLoading;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner />
      </div>
      
       <div className="border-b py-8">
         <h2 className="text-3xl font-bold font-headline mb-6 text-center">Browse by Category</h2>
         <div className='bg-primary text-primary-foreground'>
            <div className='px-4 md:px-6 py-2'>
                <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </div>
         </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
         <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6 text-center">Upcoming Events</h2>
        {loading ? (
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
        ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        ) : (
            <div className="col-span-full text-center py-20 text-muted-foreground">
                <h2 className="text-2xl font-semibold">No Events Found</h2>
                <p>
                There are currently no events in the &quot;{selectedCategory}&quot; category.
                </p>
          </div>
        )}
      </div>

      <div className="py-8">
        {userLoading ? (
          <div className="container">
              <Skeleton className="h-8 w-1/2 mb-6 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                  </div>
                  ))}
              </div>
          </div>
        ) : user ? (
          <InstitutionFilter />
        ) : (
          <div className="text-center">
              <h2 className="text-3xl font-bold font-headline mb-6 text-center">Browse by Institution</h2>
              <p className="text-muted-foreground mb-4">
                  This section is only accessible when a user is logged in.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
          </div>
        )}
      </div>
    </>
  );
}

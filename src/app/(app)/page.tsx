
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
      
       <div className="border-b">
         <div className='px-4 md:px-6 pt-4 md:pt-6 bg-background'>
            <h3 className="text-base md:text-lg font-semibold mb-2 font-headline">Browse by Category</h3>
         </div>
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

      {userLoading ? (
        <div className="container py-8">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div className="flex gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 w-72">
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
        <div className="container py-8 text-center">
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">View Events by Institution</h2>
                    <p className="text-muted-foreground mb-6">
                        Log in or create an account to browse events hosted by specific colleges and institutions.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href="/register">Sign Up</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}

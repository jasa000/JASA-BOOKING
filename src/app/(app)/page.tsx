
'use client';

import type { Event, Category } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const firestore = useFirestore();

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

  // 2. Fetch all categories, ordered by the 'order' field
  const categoriesCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);

  const categoriesQuery = useMemo(() => {
    if (!categoriesCollectionRef) return null;
    return query(categoriesCollectionRef, orderBy('order', 'asc'));
  }, [categoriesCollectionRef]);

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCollection<Category>(categoriesQuery);

  // 3. Group events by category
  const eventsByCategory = useMemo(() => {
    if (!allEvents || !categories) return {};

    const grouped: { [key: string]: Event[] } = {};

    // Initialize with all categories to ensure every category is displayed
    categories.forEach(category => {
      grouped[category.name] = [];
    });
    
    // Populate with events
    allEvents.forEach((event) => {
      if (!grouped[event.category]) {
        // This case is unlikely if categories are managed well, but as a fallback
        grouped[event.category] = [];
      }
      grouped[event.category].push(event);
    });

    return grouped;
  }, [allEvents, categories]);

  const loading = eventsLoading || categoriesLoading;
  const error = eventsError || categoriesError;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {loading && (
        <>
        {[...Array(3)].map((_, i) => (
           <Card key={i} className="overflow-hidden">
             <CardHeader>
               <Skeleton className="h-8 w-48" />
             </CardHeader>
             <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex flex-col space-y-3">
                        <Skeleton className="h-[180px] w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
             </CardContent>
           </Card>
        ))}
        </>
      )}

      {error && (
        <div className="col-span-full text-center py-12 text-destructive">
          <h2 className="text-2xl font-semibold">Error Loading Data</h2>
          <p>{error.message}</p>
        </div>
      )}

      {!loading && !error && categories && (
        categories.map(category => {
          const categoryEvents = eventsByCategory[category.name] || [];
          return (
             <Card key={category.id} className="overflow-hidden border-none shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between px-2">
                <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                {categoryEvents.length > 0 && (
                   <Link href={`/category/${encodeURIComponent(category.name)}`}>
                    <Button variant="link">View All</Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="px-2">
                 {categoryEvents.length > 0 ? (
                  <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
                    <CarouselContent className="-ml-4">
                      {categoryEvents.map((event) => (
                        <CarouselItem key={event.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4">
                          <EventCard event={event} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden lg:flex" />
                    <CarouselNext className="hidden lg:flex" />
                  </Carousel>
                ) : (
                  <div className="flex items-center justify-center h-48 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No events yet. Stay tuned for upcoming ones!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  );
}

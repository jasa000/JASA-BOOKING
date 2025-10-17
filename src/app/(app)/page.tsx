
'use client';

import type { Event, Category } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function EventsPage() {
  const firestore = useFirestore();

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
    data: approvedEvents,
    loading: eventsLoading,
    error: eventsError,
  } = useCollection<Event>(approvedEventsQuery);

  // Fetch categories
  const categoriesCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);
  
  const categoriesQuery = useMemo(() => {
    if(!categoriesCollectionRef) return null;
    return query(categoriesCollectionRef, orderBy('order', 'asc'));
  }, [categoriesCollectionRef]);

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCollection<Category>(categoriesQuery);

  // Group events by category
  const eventsByCategory = useMemo(() => {
    if (!approvedEvents || !categories) return {};

    const grouped: { [key: string]: Event[] } = {};
    
    // Initialize with all categories to maintain order
    for (const category of categories) {
        grouped[category.name] = [];
    }

    for (const event of approvedEvents) {
      if (!grouped[event.category]) {
        // This handles events with categories that might have been deleted
        grouped[event.category] = [];
      }
      grouped[event.category].push(event);
    }

    return grouped;
  }, [approvedEvents, categories]);
  
  const loading = eventsLoading || categoriesLoading;
  const error = eventsError || categoriesError;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          Discover Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse through a curated list of events, organized by category.
        </p>
      </div>

      {loading && (
         <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="flex space-x-6">
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex flex-col space-y-3 w-1/3">
                            <Skeleton className="h-[150px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-center text-destructive">
          Error loading data: {error.message}
        </p>
      )}

      {!loading && !error && (
         <div className="space-y-12">
            {categories && categories.map(category => {
                const categoryEvents = eventsByCategory[category.name];
                if (!categoryEvents || categoryEvents.length === 0) {
                    return null;
                }
                return (
                    <Card key={category.id} className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Carousel 
                                opts={{
                                    align: "start",
                                    loop: false,
                                }}
                                className="w-full"
                             >
                                <CarouselContent className="-ml-4">
                                    {categoryEvents.map((event) => (
                                    <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <EventCard event={event} />
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="hidden sm:flex" />
                                <CarouselNext className="hidden sm:flex" />
                            </Carousel>
                        </CardContent>
                    </Card>
                )
            })}
             {Object.keys(eventsByCategory).length === 0 && (
                 <div className="col-span-full text-center py-12 text-muted-foreground">
                    <h2 className="text-2xl font-semibold">No Events Found</h2>
                    <p>Check back later for new and exciting events.</p>
                </div>
             )}
         </div>
      )}
    </div>
  );
}

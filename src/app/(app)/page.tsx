
'use client';

import type { Event, Category } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WelcomeBanner } from '@/components/welcome-banner';

export default function EventsPage() {
  const firestore = useFirestore();

  // 1. Fetch all categories, ordered by the 'order' field
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

  // 2. Fetch all approved events
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

  // 3. Group events by category
  const eventsByCategory = useMemo(() => {
    if (!allEvents) return {};
    return allEvents.reduce((acc, event) => {
      const categoryName = event.category;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [allEvents]);
  
  const loading = categoriesLoading || eventsLoading;

  if (categoriesError || eventsError) {
    return (
        <div className="col-span-full text-center py-12 text-destructive">
          <h2 className="text-2xl font-semibold">Error Loading Page</h2>
          <p>{categoriesError?.message || eventsError?.message}</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeBanner />
      
      <div className="space-y-12 mt-12">
        {loading ? (
           [...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-6">
                    {[...Array(3)].map((_, j) => (
                       <div key={j} className="flex flex-col space-y-3">
                          <Skeleton className="h-[180px] w-[300px] rounded-xl" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
             </Card>
           ))
        ) : (
          categories?.map(category => {
            const categoryEvents = eventsByCategory[category.name] || [];
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                  <Link href={`/category/${encodeURIComponent(category.name)}`}>
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {categoryEvents.length > 0 ? (
                    <Carousel
                      opts={{
                        align: "start",
                        loop: categoryEvents.length > 3
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-4">
                        {categoryEvents.map((event) => (
                          <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4">
                             <EventCard event={event} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="ml-14" />
                      <CarouselNext className="mr-14" />
                    </Carousel>
                  ) : (
                     <div className="flex items-center justify-center h-48 text-muted-foreground text-center">
                        <p>No events yet. Stay tuned for upcoming ones!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}

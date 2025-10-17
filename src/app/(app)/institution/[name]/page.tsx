
'use client';

import type { Event, Institution } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

export default function InstitutionPage() {
  const firestore = useFirestore();
  const params = useParams();
  const institutionName = decodeURIComponent(params.name as string);

  // 1. Fetch the institution details
  const institutionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const institutionQuery = useMemo(() => {
    if (!institutionsCollectionRef) return null;
    return query(
      institutionsCollectionRef,
      where('name', '==', institutionName),
      limit(1)
    );
  }, [institutionsCollectionRef, institutionName]);

  const { data: institutionData, loading: institutionLoading, error: institutionError } = useCollection<Institution>(institutionQuery);
  const institution = useMemo(() => institutionData?.[0], [institutionData]);

  // 2. Fetch approved events for the specific institution
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
    loading: eventsLoading,
    error: eventsError,
  } = useCollection<Event>(institutionEventsQuery);

  const error = institutionError || eventsError;
  const loading = institutionLoading || eventsLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      {institutionLoading && (
        <div className="mb-8">
            <Skeleton className="h-80 w-full rounded-lg" />
            <Skeleton className="h-8 w-1/2 mt-4" />
            <Skeleton className="h-5 w-1/3 mt-2" />
        </div>
      )}

      {error && (
         <div className="text-center py-12 text-destructive">
            <h2 className="text-2xl font-semibold">Error Loading Page</h2>
            <p>{error.message}</p>
        </div>
      )}

      {!institutionLoading && !error && institution && (
        <Card className="mb-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative">
                    <Carousel
                        opts={{ loop: true }}
                        plugins={[Autoplay({ delay: 4000 })]}
                        className="w-full"
                    >
                        <CarouselContent>
                        {institution.imageUrls.map((url, index) => (
                            <CarouselItem key={index}>
                            <div className="relative h-64 lg:h-full min-h-[300px]">
                                <Image
                                    src={url}
                                    alt={`${institution.name} image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                    </Carousel>
                </div>
                <div className="p-8">
                    <h1 className="text-4xl font-bold font-headline mb-4">{institution.name}</h1>
                     <div className="text-lg text-muted-foreground flex items-center mb-6">
                        <MapPin className="mr-2 h-5 w-5 shrink-0" />
                        <span>{`${institution.district}, ${institution.state}`}</span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{institution.address}</p>
                </div>
            </div>
        </Card>
      )}

      {!institutionLoading && !institution && !error && (
         <div className="text-center py-20 text-muted-foreground">
            <h2 className="text-2xl font-semibold">Institution Not Found</h2>
            <p>
              We couldn&apos;t find details for &quot;{institutionName}&quot;.
            </p>
          </div>
      )}

      {/* Events Section */}
      <div>
        <h2 className="text-3xl font-bold font-headline mb-8">Events at {institutionName}</h2>
         {eventsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

        {!eventsLoading && !error && events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!eventsLoading && !error && (!events || events.length === 0) && institution && (
          <div className="text-center py-20 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Upcoming Events</h2>
            <p>
              There are currently no events scheduled for {institutionName}.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

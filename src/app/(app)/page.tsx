
'use client';

import type { Event, Category } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function EventsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch approved events
  const eventsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);

  const approvedEventsQuery = useMemo(() => {
    if (!eventsCollectionRef) return null;
    return query(eventsCollectionRef, where('status', '==', 'approved'));
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
    return query(categoriesCollectionRef, orderBy('name', 'asc'));
  }, [categoriesCollectionRef]);

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCollection<Category>(categoriesQuery);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    if (!approvedEvents) return [];

    return approvedEvents
      .filter((event) => {
        const matchesCategory =
          categoryFilter === 'all' || event.category === categoryFilter;
        const matchesSearch =
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [approvedEvents, searchTerm, categoryFilter]);

  const loading = eventsLoading || categoriesLoading;
  const error = eventsError || categoriesError;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          Discover Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse through a curated list of events. Filter by category or search
          to find what you're looking for.
        </p>
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-card sticky top-[65px] z-30">
        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by event title or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
           <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              className="rounded-full shrink-0"
              onClick={() => setCategoryFilter('all')}
            >
              All
            </Button>
          {categoriesLoading ? (
             [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))
          ) : (
            categories?.map((category) => (
              <Button
                key={category.id}
                variant={categoryFilter === category.name ? 'default' : 'outline'}
                className="rounded-full shrink-0"
                onClick={() => setCategoryFilter(category.name)}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <h2 className="text-2xl font-semibold">No Events Found</h2>
              <p>Try adjusting your search or filter settings.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

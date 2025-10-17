
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const firestore = useFirestore();

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
    loading,
    error,
  } = useCollection<Category>(categoriesQuery);

  if (error) {
    return (
      <div className="h-14 flex items-center justify-center">
          <p className="text-sm text-destructive">Error loading categories.</p>
      </div>
    );
  }

  return (
    <div>
        <h3 className="text-lg font-semibold mb-2 font-headline">Browse by Category</h3>
        <ScrollArea className="w-full whitespace-nowrap">
        <div className="h-14 flex items-center gap-2">
            <Button
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSelectCategory('all')}
            className="rounded-full shrink-0"
            >
            All
            </Button>
            {loading ? (
                [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
            ) : (
            categories?.map((category) => (
                <Button
                key={category.id}
                variant={
                    selectedCategory === category.name ? 'secondary' : 'ghost'
                }
                size="sm"
                onClick={() => onSelectCategory(category.name)}
                className="rounded-full shrink-0"
                >
                {category.name}
                </Button>
            ))
            )}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    </div>
  );
}


'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

  const buttonClasses = (isActive: boolean) => cn(
      "rounded-full shrink-0",
      isActive 
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
          : "bg-primary/80 text-primary-foreground hover:bg-primary"
  );


  return (
    <div>
        <ScrollArea className="w-full whitespace-nowrap">
        <div className="h-14 flex items-center gap-2">
            <Button
                variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onSelectCategory('all')}
                className={buttonClasses(selectedCategory === 'all')}
            >
            All
            </Button>
            {loading ? (
                [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full bg-white/20" />
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
                    className={buttonClasses(selectedCategory === category.name)}
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

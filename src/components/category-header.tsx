
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function CategoryHeader() {
  const firestore = useFirestore();
  const pathname = usePathname();

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
  
  const isActive = (path: string) => pathname === path;


  if (error) {
    return (
      <div className="h-14 flex items-center justify-center border-b bg-background">
          <p className="text-sm text-destructive">Error loading categories.</p>
      </div>
    );
  }

  return (
    <div className="border-b bg-background sticky top-16 z-30">
        <ScrollArea className="w-full whitespace-nowrap">
        <div className="container h-14 flex items-center gap-2 px-4">
            <Link href="/" legacyBehavior passHref>
                <Button
                    asChild
                    variant={isActive('/') ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-full shrink-0"
                    >
                    <a>All</a>
                </Button>
            </Link>
            {loading ? (
                [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
            ) : (
            categories?.map((category) => {
                const categoryPath = `/category/${encodeURIComponent(category.name)}`;
                return (
                    <Link key={category.id} href={categoryPath} legacyBehavior passHref>
                        <Button
                            asChild
                            variant={isActive(categoryPath) ? 'secondary' : 'ghost'}
                            size="sm"
                            className="rounded-full shrink-0"
                        >
                            <a>{category.name}</a>
                        </Button>
                    </Link>
                );
            })
            )}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    </div>
  );
}

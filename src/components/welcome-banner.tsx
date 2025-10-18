
'use client';

import { Button } from './ui/button';
import Link from 'next/link';

export function WelcomeBanner() {
  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-2xl group bg-gradient-to-br from-blue-50 to-indigo-200 dark:from-gray-900 dark:to-blue-950">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-lg">
          Discover Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-700 dark:text-gray-200 drop-shadow-md">
          From workshops and concerts to community gatherings, find the events that move you.
        </p>
        <Link href="/events/create" className="mt-8">
            <Button size="lg" className="bg-primary text-primary-foreground text-lg h-12 px-8">
                Create Your Own Event
            </Button>
        </Link>
      </div>
    </div>
  );
}


'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

export function WelcomeBanner() {
  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-2xl group">
      <Image
        src="https://picsum.photos/seed/main-banner/1200/400"
        alt="Exciting events happening now"
        fill
        className="object-cover animate-background-zoom"
        data-ai-hint="events collage"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight drop-shadow-lg animate-float">
          Discover Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200 drop-shadow-md">
          From workshops and concerts to community gatherings, find the events that move you.
        </p>
        <Link href="/events/create" className="mt-8">
            <Button size="lg" className="bg-primary text-primary-foreground text-lg h-12 px-8 animate-pulse">
                Create Your Own Event
            </Button>
        </Link>
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative">
          <Link href={`/events/${event.id}`}>
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={600}
              height={400}
              className="object-cover w-full h-48"
              data-ai-hint={event.imageHint}
            />
          </Link>
          <Badge className="absolute top-2 right-2 bg-accent/90 text-accent-foreground">{event.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/events/${event.id}`}>
          <CardTitle className="font-headline text-lg mb-2 leading-tight hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
        </Link>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(new Date(event.date), 'EEE, MMM d, yyyy \'at\' h:mm a')}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

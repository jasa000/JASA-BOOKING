import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, User, Tag } from 'lucide-react';
import { events } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8 shadow-lg">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          data-ai-hint={event.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-white tracking-tight">{event.title}</h1>
          <p className="mt-2 text-md md:text-lg text-gray-200">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl md:text-2xl">About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm md:text-base">{event.description}</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <Button className="w-full text-base md:text-lg h-11 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 transition-opacity">Register Now</Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <h3 className="font-bold font-headline text-base md:text-lg mb-2">Details</h3>
               <div className="flex items-start">
                <Calendar className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Date and Time</p>
                  <p className="text-muted-foreground">{format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Organizer</p>
                  <p className="text-muted-foreground">{event.organizer}</p>
                </div>
              </div>
               <div className="flex items-start">
                <Tag className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Category</p>
                  <div className="text-muted-foreground"><Badge variant="secondary">{event.category}</Badge></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsCollectionRef = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);

  const pendingEventsQuery = React.useMemo(() => {
    if (!eventsCollectionRef) return null;
    return query(eventsCollectionRef, where('status', '==', 'pending'));
  }, [eventsCollectionRef]);

  const {
    data: pendingEvents,
    loading,
    error,
  } = useCollection<Event>(pendingEventsQuery);

  const handleEventStatusChange = async (eventId: string, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    const eventDocRef = doc(firestore, 'events', eventId);
    try {
      await updateDoc(eventDocRef, { status: newStatus });
      toast({
        title: `Event ${newStatus}`,
        description: `The event has been successfully ${newStatus}.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || 'Could not update event status.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Events</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading events...'
              : `There are ${
                  pendingEvents?.length || 0
                } events awaiting your approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading pending events...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-destructive"
                    >
                      Error loading events: {error.message}
                    </TableCell>
                  </TableRow>
                ) : pendingEvents && pendingEvents.length > 0 ? (
                  pendingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.title}
                      </TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-500 hover:text-green-600"
                          onClick={() => handleEventStatusChange(event.id, 'approved')}
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                           onClick={() => handleEventStatusChange(event.id, 'rejected')}
                        >
                          <XCircle className="h-5 w-5" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No pending events.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { events } from "@/lib/data";
import { EventCard } from "@/components/event-card";
import { Mail, User as UserIcon } from "lucide-react";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Mock: user is registered for first 3 events
  const registeredEvents = events.slice(0, 3); 

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ""} />
          <AvatarFallback className="text-3xl">
            {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-headline">{user.displayName || 'User'}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <Mail className="h-4 w-4 mr-2" />
            <span>{user.email}</span>
          </div>
        </div>
        <Button variant="outline" className="md:ml-auto">Edit Profile</Button>
      </div>

      <Separator className="my-8" />

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">My Registrations</h2>
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <CardHeader>
                <CardTitle>No Registered Events</CardTitle>
                <CardDescription>You haven't registered for any events yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Browse Events</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

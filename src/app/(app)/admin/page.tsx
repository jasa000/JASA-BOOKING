
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Event, Institution, UserProfile } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { Users, Calendar, Building, Hourglass } from 'lucide-react';
import React from 'react';

function StatCard({ title, value, icon: Icon, loading }: { title: string, value: number, icon: React.ElementType, loading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? '...' : value}
                </div>
            </CardContent>
        </Card>
    );
}


export default function AdminDashboardPage() {
  const firestore = useFirestore();

  // Fetch total users
  const usersQuery = React.useMemo(() => 
    firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  // Fetch total events (approved)
  const eventsQuery = React.useMemo(() =>
    firestore ? query(collection(firestore, 'events'), where('status', '==', 'approved')) : null, [firestore]);
  const { data: events, loading: eventsLoading } = useCollection<Event>(eventsQuery);
  
  // Fetch pending events
  const pendingEventsQuery = React.useMemo(() =>
    firestore ? query(collection(firestore, 'events'), where('status', '==', 'pending')) : null, [firestore]);
  const { data: pendingEvents, loading: pendingEventsLoading } = useCollection<Event>(pendingEventsQuery);

  // Fetch total institutions
  const institutionsQuery = React.useMemo(() =>
    firestore ? query(collection(firestore, 'institutions')) : null, [firestore]);
  const { data: institutions, loading: institutionsLoading } = useCollection<Institution>(institutionsQuery);


  return (
    <div className="container mx-auto px-4 py-8">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">An overview of your application's data.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={users?.length || 0} icon={Users} loading={usersLoading} />
            <StatCard title="Approved Events" value={events?.length || 0} icon={Calendar} loading={eventsLoading} />
            <StatCard title="Pending Events" value={pendingEvents?.length || 0} icon={Hourglass} loading={pendingEventsLoading} />
            <StatCard title="Total Institutions" value={institutions?.length || 0} icon={Building} loading={institutionsLoading} />
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
                <CardDescription>Use the menu above to manage your application.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>From here you can approve new events, manage users, and organize event categories and institutions.</p>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

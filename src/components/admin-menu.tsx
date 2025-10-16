
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AdminMenu() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [user, firestore]);

  if (loading || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="border-b bg-background">
      <div className="container px-4 md:px-6">
        <Menubar className="border-none rounded-none h-12 justify-start">
          <MenubarMenu>
             <Link href="/admin" passHref>
                <MenubarTrigger asChild className="cursor-pointer">
                    <a>Pending Events</a>
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
          <MenubarMenu>
             <Link href="/admin/users" passHref>
                <MenubarTrigger asChild className="cursor-pointer">
                    <a>Manage Users</a>
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}

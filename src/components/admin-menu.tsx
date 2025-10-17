
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
            <Link href="/" legacyBehavior={false}>
              <MenubarTrigger className="cursor-pointer">
                Dashboard
              </MenubarTrigger>
            </Link>
          </MenubarMenu>
          <MenubarMenu>
             <Link href="/admin" legacyBehavior={false}>
                <MenubarTrigger className="cursor-pointer">
                    Pending Events
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
          <MenubarMenu>
             <Link href="/admin/users" legacyBehavior={false}>
                <MenubarTrigger className="cursor-pointer">
                    Manage Users
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
          <MenubarMenu>
             <Link href="/admin/categories" legacyBehavior={false}>
                <MenubarTrigger className="cursor-pointer">
                    Categories
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
          <MenubarMenu>
             <Link href="/admin/institution" legacyBehavior={false}>
                <MenubarTrigger className="cursor-pointer">
                    INSTITUTION
                </MenubarTrigger>
             </Link>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}

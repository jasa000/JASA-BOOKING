
'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function useIdleTimeout() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }
    if (user && auth) {
      idleTimer.current = setTimeout(() => {
        signOut(auth).then(() => {
          toast({
            variant: 'destructive',
            title: 'Session Expired',
            description: 'You have been logged out due to inactivity. Please log in again.',
          });
          router.push('/login');
        });
      }, IDLE_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    if (!user) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
    };
  }, [user, auth, router, toast]);

  return null; // This hook does not render anything
}

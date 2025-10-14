"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/firebase/auth/use-user"
import { signOut } from "firebase/auth"
import { useAuth } from "@/firebase"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "./theme-toggle"

export function UserNav() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-10" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Sign Up</Button>
        </Link>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile">
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ""} />}
            <AvatarFallback>{(user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0))?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </Link>
      <ThemeToggle />
    </div>
  )
}

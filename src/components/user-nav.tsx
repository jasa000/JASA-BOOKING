
"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/firebase/auth/use-user"
import { Skeleton } from "@/components/ui/skeleton"
import { LogIn } from "lucide-react"

export function UserNav() {
  const { user, loading } = useUser();

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="icon">
          <LogIn className="h-5 w-5" />
          <span className="sr-only">Login</span>
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/profile">
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ""} />}
          <AvatarFallback>{(user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0))?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="sr-only">View Profile</span>
      </Button>
    </Link>
  )
}

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

export function UserNav() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button>Sign up / Sign in</Button>
      </Link>
    );
  }

  return (
    <Link href="/profile">
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ""} />}
          <AvatarFallback>{(user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0))?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Button>
    </Link>
  )
}

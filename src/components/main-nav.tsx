"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked } from "lucide-react"

import { cn } from "@/lib/utils"
// A mock hook, in a real app this would come from an auth provider
const useAuth = () => ({
  user: { role: 'admin' } // or 'user'
});


export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    {
      href: '/events',
      label: 'Events',
      active: pathname === '/events',
    },
    {
      href: '/events/create',
      label: 'Create Event',
      active: pathname === '/events/create',
    },
    ...(user.role === 'admin' ? [{
      href: '/admin',
      label: 'Admin',
      active: pathname === '/admin',
    }] : []),
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link href="/events" className="flex items-center space-x-2">
        <BookMarked className="h-6 w-6" />
        <span className="font-bold font-headline text-lg">JASA BOOKING</span>
      </Link>
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

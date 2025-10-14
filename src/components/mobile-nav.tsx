"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useUser } from "@/firebase/auth/use-user"

// A mock hook, in a real app this would come from an auth provider
const useMockAuth = () => ({
  user: { role: 'admin' } // or 'user'
});


export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname();
  // const { user } = useMockAuth();
  const { user: authUser } = useUser();

  // For now, let's keep the mock role for admin to show the admin link
  const mockUser = useMockAuth().user;

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
    ...(mockUser.role === 'admin' ? [{
      href: '/admin',
      label: 'Admin',
      active: pathname === '/admin',
    }] : []),
     {
      href: '/profile',
      label: 'Profile',
      active: pathname === '/profile',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <span className="font-bold">JASA BOOKING</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
             {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}

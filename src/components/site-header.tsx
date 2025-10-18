
"use client"

import { MainNav } from "./main-nav"
import { cn } from "@/lib/utils"
import { UserNav } from "./user-nav"
import { Button } from "./ui/button"
import Link from "next/link"
import { Plus, Home } from "lucide-react"

export function SiteHeader() {
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b bg-background"
    )}>
      <div className="relative flex h-16 items-center px-4 md:px-6">
        <div className="flex flex-1 items-center">
           <Link href="/" passHref>
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <MainNav />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
           <Link href="/events/create" passHref>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Create Event</span>
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  )
}

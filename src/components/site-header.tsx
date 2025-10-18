
import Link from "next/link"
import { Home, PlusSquare } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground animate-shine">
      <div className="container px-4 md:px-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/90">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Button>
              </Link>
              <ThemeToggle />
            </div>
            <div className="flex-1 flex justify-center">
              <MainNav />
            </div>
            <div className="flex items-center justify-end gap-2">
                <Link href="/events/create">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/90">
                        <PlusSquare className="h-5 w-5" />
                        <span className="sr-only">Create Event</span>
                    </Button>
                </Link>
                <UserNav />
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </header>
  )
}

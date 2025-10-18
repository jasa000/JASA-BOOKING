
import Link from "next/link"
import { Home, PlusSquare } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground animate-shine", "dark:bg-black dark:text-white")}>
      <div className="container px-4 md:px-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-white/10">
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
                <UserNav />
                <Link href="/events/create">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-white/10">
                        <PlusSquare className="h-5 w-5" />
                        <span className="sr-only">Create Event</span>
                    </Button>
                </Link>
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </header>
  )
}

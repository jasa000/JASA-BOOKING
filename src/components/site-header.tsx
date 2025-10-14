import Link from "next/link"
import { Home, PlusSquare } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
        <MainNav />
        <div className="flex items-center justify-end space-x-2">
            <Link href="/events/create">
                <Button variant="ghost" size="icon">
                    <PlusSquare className="h-5 w-5" />
                    <span className="sr-only">Create Event</span>
                </Button>
            </Link>
            <UserNav />
        </div>
      </div>
    </header>
  )
}

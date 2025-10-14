import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <MobileNav />
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
            <UserNav />
        </div>
      </div>
    </header>
  )
}

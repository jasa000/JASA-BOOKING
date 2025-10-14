import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex-1"></div>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
            <UserNav />
        </div>
      </div>
    </header>
  )
}

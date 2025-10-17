
'use client';

import { SiteHeader } from "@/components/site-header"
import { AdminMenu } from "@/components/admin-menu"
import { usePathname } from "next/navigation";
import { CategoryFilter } from "@/components/category-filter";

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    // Only show category filter on the root page of the app router
    const showCategoryFilter = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <AdminMenu />
      {showCategoryFilter && <CategoryFilter />}
      <main className="flex-1">{children}</main>
    </div>
  )
}

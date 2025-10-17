
'use client';

import { SiteHeader } from "@/components/site-header"
import { AdminMenu } from "@/components/admin-menu"
import { CategoryHeader } from "@/components/category-header";

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <AdminMenu />
      <CategoryHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}

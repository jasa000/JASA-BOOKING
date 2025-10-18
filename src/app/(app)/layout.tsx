
'use client';

import { SiteHeader } from "@/components/site-header"
import { AdminMenu } from "@/components/admin-menu"
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  useIdleTimeout();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <AdminMenu />
      <main className="flex-1">{children}</main>
    </div>
  )
}

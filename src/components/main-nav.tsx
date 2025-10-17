
"use client";

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {

  return (
    <nav
      className={cn("flex items-center", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold font-headline text-lg">
          JASA BOOKING
        </span>
      </Link>
    </nav>
  )
}

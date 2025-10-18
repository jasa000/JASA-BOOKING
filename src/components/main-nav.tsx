
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
      <Link href="/" className="flex flex-col items-center space-y-0">
        <span className="font-bold font-headline text-lg tracking-widest leading-none">
          JASA
        </span>
        <span className="font-headline text-sm leading-none">
          BOOKING
        </span>
      </Link>
    </nav>
  )
}

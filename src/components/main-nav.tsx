
"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {

  return (
    <nav
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Link href="/" className="flex flex-col items-center space-y-0">
        <div className="flex w-full justify-between">
            <span className="font-bold font-headline text-lg leading-none">J</span>
            <span className="font-bold font-headline text-lg leading-none">A</span>
            <span className="font-bold font-headline text-lg leading-none">S</span>
            <span className="font-bold font-headline text-lg leading-none">A</span>
        </div>
        <span className="font-headline text-sm leading-none">
          BOOKING
        </span>
      </Link>
    </nav>
  )
}

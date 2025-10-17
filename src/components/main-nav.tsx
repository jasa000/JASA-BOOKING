
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
        <span className="font-bold font-headline text-lg relative inline-block overflow-hidden whitespace-nowrap">
          <span className="relative text-primary bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            JASA BOOKING
          </span>
          <span
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shine"
            style={{ animationDuration: '4s' }}
          />
        </span>
      </Link>
    </nav>
  )
}

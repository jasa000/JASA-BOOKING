
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
      className={cn("flex items-center justify-center flex-1", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold font-headline text-lg relative inline-block overflow-hidden">
          <span className="relative text-primary">JASA BOOKING</span>
          <span className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-75"></span>
        </span>
      </Link>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">API Dashboard</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/file-upload"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/file-upload") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dosya Yükleme
        </Link>
      </nav>
    </div>
  )
}

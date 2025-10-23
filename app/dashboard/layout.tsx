import type React from "react"
import { Wrench, Users, FileText, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { GlobalSearch } from "@/components/search/global-search"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold text-foreground">JR Beckman</span>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-secondary"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/clientes"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-secondary"
          >
            <Users className="h-5 w-5" />
            <span>Clientes</span>
          </Link>
          <Link
            href="/dashboard/manutencoes"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-secondary"
          >
            <FileText className="h-5 w-5" />
            <span>Manutenções</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <GlobalSearch />
        </Suspense>
        {children}
      </main>
    </div>
  )
}

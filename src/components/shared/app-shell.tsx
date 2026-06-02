"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Layers } from "lucide-react"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { sidebarOpen } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* 2. Main Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex h-16 items-center border-b border-border bg-card px-4 shrink-0 justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent" />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
                <SheetHeader className="p-4 border-b border-sidebar-border">
                  <SheetTitle className="text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    TaskFlow
                  </SheetTitle>
                </SheetHeader>
                {/* Render the Sidebar component directly inside the mobile sheet */}
                <div className="h-[calc(100vh-4rem)]">
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>

            <span className="font-semibold text-foreground flex items-center gap-2 text-sm leading-none">
              <Layers className="h-4 w-4 text-primary" />
              TaskFlow
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto relative p-6 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

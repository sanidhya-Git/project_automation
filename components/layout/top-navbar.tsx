"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopNavbar() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              initial={{ width: 200, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 200, opacity: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, tasks, or team members..."
                className="h-10 w-full bg-secondary pl-9 pr-12"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                ESC
              </kbd>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-8 flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs">
                <Command className="h-3 w-3" />K
              </kbd>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </header>
  )
}

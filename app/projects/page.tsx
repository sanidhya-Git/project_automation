"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus,
  FolderKanban,
  Loader2,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"

interface Project {
  _id: string
  name: string
  description: string
  status: string
  progress: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()

      setProjects(data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilters.length === 0 ||
        statusFilters.includes(project.status)

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilters])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Projects
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage and track all your software projects
            </p>
          </div>

          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary md:max-w-sm"
          />

          <div className="flex items-center gap-3">
            <select
              value={statusFilters[0] || ""}
              onChange={(e) =>
                setStatusFilters(
                  e.target.value
                    ? [e.target.value]
                    : []
                )
              }
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
            >
              <option value="">
                All Status
              </option>

              <option value="Planning">
                Planning
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <div className="flex overflow-hidden rounded-xl border border-border">
              <button
                onClick={() =>
                  setViewMode("grid")
                }
                className={`px-4 py-2 text-sm transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
              >
                Grid
              </button>

              <button
                onClick={() =>
                  setViewMode("list")
                }
                className={`px-4 py-2 text-sm transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {filteredProjects.map(
              (project, index) => (
                <motion.div
                  key={project._id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <Link
                    href={`/projects/${project._id}`}
                  >
                    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold transition-colors group-hover:text-primary">
                              {project.name}
                            </h2>

                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          </div>

                          <span className="whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                            {project.status}
                          </span>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>

                            <span className="font-medium">
                              {project.progress}%
                            </span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No projects found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to get started
            </p>

            <Link
              href="/projects/new"
              className="mt-6"
            >
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
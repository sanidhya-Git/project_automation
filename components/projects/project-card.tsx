"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface TeamMember {
  _id: string
  name: string
  githubUrl: string
  jiraEmail: string
}

export interface Project {
  _id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold"
  figmaLink?: string
  prdFileName?: string
  contractFileName?: string
  teamMembers: TeamMember[]
  createdAt: string
  updatedAt: string
}

interface ProjectCardProps {
  project: Project
  index?: number
}

const statusConfig = {
  active: {
    label: "Active",
    icon: Circle,
    className: "text-primary bg-primary/10",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
  "on-hold": {
    label: "On Hold",
    icon: AlertCircle,
    className: "text-warning bg-warning/10",
  },
}

const projectColors = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getProjectColor(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return projectColors[hash % projectColors.length]
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const StatusIcon = status.icon
  const color = getProjectColor(project._id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Color accent */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: color }}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link
              href={`/projects/${project._id}`}
              className="text-lg font-semibold transition-colors hover:text-primary"
            >
              {project.name}
            </Link>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit project</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              status.className
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="mr-1 h-3 w-3 text-muted-foreground" />
            {project.teamMembers.length > 0 ? (
              <div className="flex -space-x-2">
                {project.teamMembers.slice(0, 3).map((member) => (
                  <div
                    key={member._id}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br from-primary to-chart-2 text-[10px] font-medium text-primary-foreground"
                    title={member.name}
                  >
                    {getInitials(member.name)}
                  </div>
                ))}
                {project.teamMembers.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-medium">
                    +{project.teamMembers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No team assigned</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

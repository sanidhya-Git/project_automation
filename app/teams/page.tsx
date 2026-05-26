"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout"

import {
  Search,
  Plus,
  Mail,
  MoreHorizontal,
  Github,
  Users,
  Loader2,
  Briefcase,
} from "lucide-react"

import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { cn } from "@/lib/utils"

interface TeamMember {

  _id: string

  name: string

  email: string

  role: string

  githubUsername: string

  githubUrl: string

  jiraEmail: string

  projectCount: number

  createdAt: string
}

function getInitials(name: string) {

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function TeamsPage() {

  const [members, setMembers] =
    useState<TeamMember[]>([])

  const [searchQuery, setSearchQuery] =
    useState("")

  const [isLoading, setIsLoading] =
    useState(true)

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [formData, setFormData] =
    useState({

      name: "",

      email: "",

      role: "Developer",

      githubUsername: "",

      githubUrl: "",

      jiraEmail: "",
    })

  async function fetchMembers() {

    try {

      const response =
        await fetch(
          "/api/team-members"
        )

      if (response.ok) {

        const data =
          await response.json()

        setMembers(data)
      }

    } catch (error) {

      console.error(
        "Failed to fetch team members:",
        error
      )

    } finally {

      setIsLoading(false)
    }
  }

  useEffect(() => {

    fetchMembers()

  }, [])

  async function handleAddMember(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setIsSubmitting(true)

    try {

      const response =
        await fetch(
          "/api/team-members",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              name:
                formData.name,

              email:
                formData.email,

              role:
                formData.role,

              githubUsername:
                formData.githubUsername,

              githubUrl:
                formData.githubUrl,

              jiraEmail:
                formData.jiraEmail,
            }),
          }
        )

      if (response.ok) {

        setFormData({

          name: "",

          email: "",

          role: "Developer",

          githubUsername: "",

          githubUrl: "",

          jiraEmail: "",
        })

        setIsAddModalOpen(false)

        fetchMembers()
      }

    } catch (error) {

      console.error(
        "Failed to add team member:",
        error
      )

    } finally {

      setIsSubmitting(false)
    }
  }

  async function handleDeleteMember(
    id: string
  ) {

    try {

      const response =
        await fetch(
          `/api/team-members/${id}`,
          {
            method: "DELETE",
          }
        )

      if (response.ok) {

        fetchMembers()
      }

    } catch (error) {

      console.error(
        "Failed to delete team member:",
        error
      )
    }
  }

  const filteredMembers =
    members.filter(
      (member) =>

        member.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||

        member.jiraEmail
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    )

  return (

    <DashboardLayout>

      <div className="space-y-6">

        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="flex items-center justify-between"
        >

          <div>

            <h1 className="text-3xl font-bold tracking-tight">
              Teams
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage your team members and assignments
            </p>

          </div>

          <Button
            className="gap-2"
            onClick={() =>
              setIsAddModalOpen(true)
            }
          >

            <Plus className="h-4 w-4" />

            Add Member

          </Button>

        </motion.div>

        {/* Search */}

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search members..."

            value={searchQuery}

            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }

            className="pl-9"
          />

        </div>

        {/* Loading */}

        {
          isLoading ? (

            <div className="flex items-center justify-center py-20">

              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

            </div>

          ) : filteredMembers.length > 0 ? (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {
                filteredMembers.map(
                  (
                    member,
                    index
                  ) => (

                    <motion.div
                      key={member._id}

                      initial={{
                        opacity: 0,
                        y: 20,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      transition={{
                        duration: 0.3,
                        delay:
                          index * 0.05,
                      }}

                      className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-4">

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-lg font-medium text-primary-foreground">

                            {
                              getInitials(
                                member.name
                              )
                            }

                          </div>

                          <div>

                            <h3 className="font-semibold">
                              {member.name}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              {member.role}
                            </p>

                          </div>

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

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteMember(
                                  member._id
                                )
                              }
                            >

                              Remove member

                            </DropdownMenuItem>

                          </DropdownMenuContent>

                        </DropdownMenu>

                      </div>

                      <div className="mt-4 space-y-2 text-sm">

                        <div className="flex items-center gap-2 text-muted-foreground">

                          <Mail className="h-4 w-4" />

                          <span className="truncate">
                            {member.email}
                          </span>

                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">

                          <Briefcase className="h-4 w-4" />

                          <span className="truncate">
                            {member.role}
                          </span>

                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">

                          <Github className="h-4 w-4" />

                          <span className="truncate">
                            {
                              member.githubUsername
                            }
                          </span>

                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">

                          <Mail className="h-4 w-4" />

                          <span className="truncate">
                            {
                              member.jiraEmail
                            }
                          </span>

                        </div>

                      </div>

                      <div className="mt-4 border-t border-border pt-4">

                        <div
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                            member.projectCount === 0
                              ? "bg-secondary text-muted-foreground"
                              : member.projectCount >= 3
                              ? "bg-warning/10 text-warning"
                              : "bg-primary/10 text-primary"
                          )}
                        >

                          {
                            member.projectCount === 0

                              ? "Available"

                              : member.projectCount >= 3

                              ? "High workload"

                              : "Active"
                          }

                        </div>

                      </div>

                    </motion.div>
                  )
                )
              }

            </div>

          ) : (

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">

              <Users className="h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-semibold">
                No team members yet
              </h3>

            </div>
          )
        }

      </div>

      {/* Modal */}

      <Dialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Add Team Member
            </DialogTitle>

            <DialogDescription>
              Add developer details for GitHub and Jira automation
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={handleAddMember}
            className="space-y-4"
          >

            <div>

              <label className="text-sm font-medium">
                Name
              </label>

              <Input
                placeholder="John Doe"

                value={formData.name}

                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name:
                      e.target.value,
                  })
                }

                className="mt-1.5"

                required
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Email
              </label>

              <Input
                placeholder="john@company.com"

                value={formData.email}

                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email:
                      e.target.value,
                  })
                }

                className="mt-1.5"

                required
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Role
              </label>

              <Input
                placeholder="Frontend Developer"

                value={formData.role}

                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role:
                      e.target.value,
                  })
                }

                className="mt-1.5"

                required
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                GitHub Username
              </label>

              <div className="relative mt-1.5">

                <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="sanidhya"

                  value={
                    formData.githubUsername
                  }

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      githubUsername:
                        e.target.value,
                    })
                  }

                  className="pl-9"

                  required
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-medium">
                GitHub URL
              </label>

              <div className="relative mt-1.5">

                <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="https://github.com/username"

                  value={
                    formData.githubUrl
                  }

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      githubUrl:
                        e.target.value,
                    })
                  }

                  className="pl-9"

                  required
                />

              </div>

            </div>

            <div>

              <label className="text-sm font-medium">
                Jira Email
              </label>

              <div className="relative mt-1.5">

                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="email"

                  placeholder="john@company.com"

                  value={
                    formData.jiraEmail
                  }

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jiraEmail:
                        e.target.value,
                    })
                  }

                  className="pl-9"

                  required
                />

              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsAddModalOpen(false)
                }
              >

                Cancel

              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
              >

                {
                  isSubmitting ? (

                    <>

                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Adding...

                    </>

                  ) : (

                    "Add Member"
                  )
                }

              </Button>

            </div>

          </form>

        </DialogContent>

      </Dialog>

    </DashboardLayout>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import Link from "next/link"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Users,
  FileText,
  Figma,
  Loader2,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"

import { toast } from "sonner"

const steps = [
  {
    id: 1,
    title: "Project Details",
    icon: FileText,
  },

  {
    id: 2,
    title: "Upload Documents",
    icon: Upload,
  },

  {
    id: 3,
    title: "Select Team",
    icon: Users,
  },
]

interface TeamMember {

  _id: string

  name: string

  githubUrl: string

  jiraEmail: string

  projectCount: number
}

function getInitials(
  name: string
) {

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function NewProjectPage() {

  const router =
    useRouter()

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1)

  const [
    teamMembers,
    setTeamMembers,
  ] = useState<
    TeamMember[]
  >([])

  const [
    isLoadingTeam,
    setIsLoadingTeam,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    formData,
    setFormData,
  ] = useState({

    name: "",

    description: "",

    prd:
      null as File | null,

    contract:
      null as File | null,

    figmaLink: "",

    selectedTeam:
      [] as string[],
  })

  useEffect(() => {

    fetchTeamMembers()

  }, [])

  async function fetchTeamMembers() {

    try {

      const response =
        await fetch(
          "/api/team-members"
        )

      if (response.ok) {

        const data =
          await response.json()

        setTeamMembers(data)
      }

    } catch (error) {

      console.log(error)

    } finally {

      setIsLoadingTeam(false)
    }
  }

  const handleNext = () => {

    if (
      currentStep <
      steps.length
    ) {

      setCurrentStep(
        currentStep + 1
      )
    }
  }

  const handleBack = () => {

    if (
      currentStep > 1
    ) {

      setCurrentStep(
        currentStep - 1
      )
    }
  }

  const toggleTeamMember = (
    id: string
  ) => {

    setFormData(
      (prev) => ({

        ...prev,

        selectedTeam:
          prev.selectedTeam.includes(
            id
          )
            ? prev.selectedTeam.filter(
                (m) =>
                  m !== id
              )
            : [
                ...prev.selectedTeam,
                id,
              ],
      })
    )
  }

  const handleCreateProject =
    async () => {

      setIsSubmitting(true)

      try {

        let prdUrl = ""

        let contractUrl =
          ""

        // ===================
        // UPLOAD PRD
        // ===================

        if (
          formData.prd
        ) {

          const prdFormData =
            new FormData()

          prdFormData.append(
            "file",
            formData.prd
          )

          const prdUpload =
            await fetch(
              "/api/upload",
              {
                method:
                  "POST",

                body:
                  prdFormData,
              }
            )

          if (
            !prdUpload.ok
          ) {

            throw new Error(
              "Failed to upload PRD"
            )
          }

          const prdResult =
            await prdUpload.json()

          prdUrl =
            prdResult.url
        }

        // ===================
        // UPLOAD CONTRACT
        // ===================

        if (
          formData.contract
        ) {

          const contractFormData =
            new FormData()

          contractFormData.append(
            "file",
            formData.contract
          )

          const contractUpload =
            await fetch(
              "/api/upload",
              {
                method:
                  "POST",

                body:
                  contractFormData,
              }
            )

          if (
            !contractUpload.ok
          ) {

            throw new Error(
              "Failed to upload contract"
            )
          }

          const contractResult =
            await contractUpload.json()

          contractUrl =
            contractResult.url
        }

        // ===================
        // SAVE PROJECT
        // ===================

        const response =
          await fetch(
            "/api/projects",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                name:
                  formData.name,

                description:
                  formData.description,

                figmaLink:
                  formData.figmaLink,

                prdUrl,

                contractUrl,

                teamMembers:
                  formData.selectedTeam,
              }),
            }
          )

        const result =
          await response.json()

        if (
          !response.ok
        ) {

          throw new Error(
            result.error ||
              "Failed to create project"
          )
        }

        toast.success(
          "Project Created Successfully"
        )

        router.push(
          "/projects"
        )

      } catch (
        error: any
      ) {

        console.log(
          error
        )

        toast.error(
          error.message ||
            "Something went wrong"
        )

      } finally {

        setIsSubmitting(
          false
        )
      }
    }

  return (

    <DashboardLayout>

      <div className="mx-auto max-w-3xl space-y-8">

        {/* BACK BUTTON */}

        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}

          animate={{
            opacity: 1,
            x: 0,
          }}
        >

          <Link
            href="/projects"

            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Projects

          </Link>

        </motion.div>

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <h1 className="text-3xl font-bold tracking-tight">
            Create New Project
          </h1>

          <p className="mt-1 text-muted-foreground">
            Set up a new project with automated GitHub and Jira integration
          </p>

        </motion.div>

        {/* STEPS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          className="flex items-center justify-between"
        >

          {steps.map(
            (
              step,
              index
            ) => {

              const Icon =
                step.icon

              const isActive =
                step.id ===
                currentStep

              const isCompleted =
                step.id <
                currentStep

              return (

                <div
                  key={step.id}

                  className="flex items-center"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",

                        isActive &&
                          "border-primary bg-primary text-primary-foreground",

                        isCompleted &&
                          "border-primary bg-primary text-primary-foreground",

                        !isActive &&
                          !isCompleted &&
                          "border-border bg-secondary text-muted-foreground"
                      )}
                    >

                      {isCompleted ? (

                        <Check className="h-5 w-5" />

                      ) : (

                        <Icon className="h-5 w-5" />
                      )}

                    </div>

                    <span
                      className={cn(
                        "mt-2 text-xs font-medium",

                        isActive &&
                          "text-primary",

                        !isActive &&
                          "text-muted-foreground"
                      )}
                    >

                      {step.title}

                    </span>

                  </div>

                  {index <
                    steps.length -
                      1 && (

                    <div
                      className={cn(
                        "mx-4 h-0.5 w-12 transition-colors",

                        step.id <
                          currentStep
                          ? "bg-primary"
                          : "bg-border"
                      )}
                    />
                  )}

                </div>
              )
            }
          )}

        </motion.div>

        {/* CARD */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          className="rounded-xl border border-border bg-card p-8"
        >

          <AnimatePresence mode="wait">

            {/* STEP 1 */}

            {currentStep ===
              1 && (

              <motion.div
                key="step1"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="space-y-6"
              >

                <div>

                  <h2 className="text-xl font-semibold">
                    Project Details
                  </h2>

                </div>

                <div className="space-y-4">

                  <div>

                    <label className="text-sm font-medium">
                      Project Name
                    </label>

                    <Input
                      placeholder="E-commerce Platform"

                      value={
                        formData.name
                      }

                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name:
                            e.target
                              .value,
                        })
                      }

                      className="mt-1.5"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Description
                    </label>

                    <Textarea
                      placeholder="Description"

                      value={
                        formData.description
                      }

                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description:
                            e.target
                              .value,
                        })
                      }

                      className="mt-1.5 min-h-[120px]"
                    />

                  </div>

                </div>

              </motion.div>
            )}

            {/* STEP 2 */}

            {currentStep ===
              2 && (

              <motion.div
                key="step2"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="space-y-6"
              >

                <div>

                  <h2 className="text-xl font-semibold">
                    Upload Documents
                  </h2>

                </div>

                <div className="space-y-6">

                  {/* PRD */}

                  <div className="rounded-lg border border-dashed border-border p-6">

                    <div className="flex flex-col items-center justify-center text-center">

                      <Upload className="h-10 w-10 text-muted-foreground" />

                      <p className="mt-2 font-medium">
                        Upload PRD Document
                      </p>

                      <input
                        type="file"

                        hidden

                        id="prd-upload"

                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prd:
                              e.target
                                .files?.[0] ||
                              null,
                          })
                        }
                      />

                      <label htmlFor="prd-upload">

                        <Button
                          type="button"

                          variant="outline"

                          size="sm"

                          className="mt-4"
                        >

                          {formData.prd
                            ? formData
                                .prd
                                .name
                            : "Choose File"}

                        </Button>

                      </label>

                    </div>

                  </div>

                  {/* CONTRACT */}

                  <div className="rounded-lg border border-dashed border-border p-6">

                    <div className="flex flex-col items-center justify-center text-center">

                      <FileText className="h-10 w-10 text-muted-foreground" />

                      <p className="mt-2 font-medium">
                        Upload Contract
                      </p>

                      <input
                        type="file"

                        hidden

                        id="contract-upload"

                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contract:
                              e.target
                                .files?.[0] ||
                              null,
                          })
                        }
                      />

                      <label htmlFor="contract-upload">

                        <Button
                          type="button"

                          variant="outline"

                          size="sm"

                          className="mt-4"
                        >

                          {formData.contract
                            ? formData
                                .contract
                                .name
                            : "Choose File"}

                        </Button>

                      </label>

                    </div>

                  </div>

                  {/* FIGMA */}

                  <div>

                    <label className="text-sm font-medium">
                      Figma Link
                    </label>

                    <div className="relative mt-1.5">

                      <Figma className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        placeholder="https://figma.com/file/..."

                        value={
                          formData.figmaLink
                        }

                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            figmaLink:
                              e.target
                                .value,
                          })
                        }

                        className="pl-9"
                      />

                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* STEP 3 */}

            {currentStep ===
              3 && (

              <motion.div
                key="step3"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="space-y-6"
              >

                <div>

                  <h2 className="text-xl font-semibold">
                    Select Team Members
                  </h2>

                </div>

                {isLoadingTeam ? (

                  <div className="flex items-center justify-center py-12">

                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

                  </div>

                ) : (

                  <div className="grid gap-3 sm:grid-cols-2">

                    {teamMembers.map(
                      (
                        member
                      ) => {

                        const isSelected =
                          formData.selectedTeam.includes(
                            member._id
                          )

                        return (

                          <button
                            key={
                              member._id
                            }

                            onClick={() =>
                              toggleTeamMember(
                                member._id
                              )
                            }

                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",

                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            )}
                          >

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 font-medium text-primary-foreground">

                              {getInitials(
                                member.name
                              )}

                            </div>

                            <div className="flex-1">

                              <p className="font-medium">
                                {
                                  member.name
                                }
                              </p>

                            </div>

                            {isSelected && (

                              <div className="rounded-full bg-primary p-1">

                                <Check className="h-3 w-3 text-primary-foreground" />

                              </div>
                            )}

                          </button>
                        )
                      }
                    )}

                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>

          {/* BUTTONS */}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">

            <Button
              variant="outline"

              onClick={
                handleBack
              }

              disabled={
                currentStep ===
                1
              }

              className="gap-2"
            >

              <ArrowLeft className="h-4 w-4" />

              Back

            </Button>

            {currentStep <
            steps.length ? (

              <Button
                onClick={
                  handleNext
                }

                className="gap-2"
              >

                Next

                <ArrowRight className="h-4 w-4" />

              </Button>

            ) : (

              <Button
                className="gap-2 bg-primary"

                onClick={
                  handleCreateProject
                }

                disabled={
                  isSubmitting
                }
              >

                {isSubmitting ? (

                  <>

                    <Loader2 className="h-4 w-4 animate-spin" />

                    Creating...

                  </>

                ) : (

                  <>

                    <Check className="h-4 w-4" />

                    Create Project

                  </>
                )}

              </Button>
            )}

          </div>

        </motion.div>

      </div>

    </DashboardLayout>
  )
}
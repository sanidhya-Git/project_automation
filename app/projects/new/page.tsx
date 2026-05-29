"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

import { DashboardLayout } from "@/components/layout"

import {

  ArrowLeft,

  ArrowRight,

  Check,

  Upload,

  Users,

  FileText,

  Figma,

  Loader2,

  Code2,

} from "lucide-react"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"

import Link from "next/link"
import { templates } from "@/lib/templates"

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

  const [currentStep, setCurrentStep] =
    useState(1)

  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>([])

  const [isLoadingTeam, setIsLoadingTeam] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

const [formData, setFormData] =
  useState({
    name: "",
    description: "",
    prd: null as File | null,
    contract: null as File | null,
    figmaLink: "",
    template: "nextjs",

    useJira: true,

    selectedTeam: [] as string[],
  })

  useEffect(() => {

    const fetchTeamMembers =
      async () => {

        try {

          const response =
            await fetch(
              "/api/team-members"
            )

          if (
            response.ok
          ) {

            const data =
              await response.json()

            setTeamMembers(
              data
            )
          }

        } catch (error) {

          console.error(
            "Failed to fetch team members:",
            error
          )

        } finally {

          setIsLoadingTeam(
            false
          )
        }
      }

    fetchTeamMembers()

  }, [])

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
          prev.selectedTeam.includes(id)

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

      setIsSubmitting(
        true
      )

      try {

        let prdUrl = ""

        let contractUrl = ""



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

          const prdResult =
            await prdUpload.json()

          prdUrl =
            prdResult.url
        }



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

          const contractResult =
            await contractUpload.json()

          contractUrl =
            contractResult.url
        }


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

              body:
                
JSON.stringify({

  name:
    formData.name,

  description:
    formData.description,

  figmaLink:
    formData.figmaLink,

  prdUrl,

  contractUrl,

  template:
    formData.template,

  useJira:
    formData.useJira,

  teamMembers:
    formData.selectedTeam,
}),
            }
          )

        if (
          response.ok
        ) {

          router.push(
            "/projects"
          )

        } else {

          const err =
            await response.json()

          console.log(
            err
          )
        }

      } catch (error) {

        console.error(
          "Failed to create project:",
          error
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

          transition={{
            duration: 0.3,
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

          transition={{
            duration: 0.3,
            delay: 0.1,
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
                step.id === currentStep

              const isCompleted =
                step.id < currentStep

              return (

                <div
                  key={
                    step.id
                  }

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

          transition={{
            duration: 0.3,
            delay: 0.2,
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

                  <p className="text-sm text-muted-foreground">

                    Enter the basic information about your project

                  </p>

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
                            e.target.value,
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

                      placeholder="A full-stack e-commerce solution..."

                      value={
                        formData.description
                      }

                      onChange={(e) =>

                        setFormData({

                          ...formData,

                          description:
                            e.target.value,
                        })
                      }

                      className="mt-1.5 min-h-[120px]"
                    />
                  </div>

                  {/* TEMPLATE */}

      <div>
  <label className="text-sm font-medium">
    Project Template
  </label>

  <div className="mt-3 grid gap-3 sm:grid-cols-3">
    {Object.keys(templates).map(
      (template) => (
        <button
          key={template}
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              template,
            })
          }
          className={cn(
            "rounded-lg border p-4 transition-all",
            formData.template === template
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/30"
          )}
        >
          <Code2 className="mx-auto h-6 w-6" />

          <p className="mt-2 text-sm font-medium capitalize">
            {template}
          </p>
        </button>
      )
    )}
  </div>
</div>
<div className="rounded-lg border p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">
        Enable Jira Automation
      </p>

      <p className="text-sm text-muted-foreground">
        Automatically create Jira project and tasks
      </p>
    </div>

    <input
      type="checkbox"
      checked={formData.useJira}
      onChange={(e) =>
        setFormData({
          ...formData,
          useJira: e.target.checked,
        })
      }
      className="h-5 w-5"
    />
  </div>
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

                  <p className="text-sm text-muted-foreground">

                    Upload PRD, contracts, and design files

                  </p>

                </div>

                <div className="space-y-4">

                  {/* PRD */}

                  <div className="rounded-lg border border-dashed border-border p-6">

                    <div className="flex flex-col items-center justify-center text-center">

                      <Upload className="h-10 w-10 text-muted-foreground" />

                      <p className="mt-2 font-medium">

                        Upload PRD Document

                      </p>

                      <p className="text-sm text-muted-foreground">

                        PDF, DOC, DOCX

                      </p>

                      <input

                        type="file"

                        id="prd-upload"

                        className="hidden"

                        onChange={(e) => {

                          const file =
                            e.target
                              .files?.[0]

                          if (file) {

                            setFormData({

                              ...formData,

                              prd:
                                file,
                            })
                          }
                        }}
                      />

                      <Button

                        variant="outline"

                        size="sm"

                        className="mt-4"

                        onClick={() => {

                          document
                            .getElementById(
                              "prd-upload"
                            )
                            ?.click()
                        }}
                      >

                        {formData.prd

                          ? formData.prd.name

                          : "Choose File"}

                      </Button>
                    </div>
                  </div>

                  {/* CONTRACT */}

                  <div className="rounded-lg border border-dashed border-border p-6">

                    <div className="flex flex-col items-center justify-center text-center">

                      <FileText className="h-10 w-10 text-muted-foreground" />

                      <p className="mt-2 font-medium">

                        Upload Contract

                      </p>

                      <p className="text-sm text-muted-foreground">

                        PDF up to 10MB

                      </p>

                      <input

                        type="file"

                        id="contract-upload"

                        className="hidden"

                        onChange={(e) => {

                          const file =
                            e.target
                              .files?.[0]

                          if (file) {

                            setFormData({

                              ...formData,

                              contract:
                                file,
                            })
                          }
                        }}
                      />

                      <Button

                        variant="outline"

                        size="sm"

                        className="mt-4"

                        onClick={() => {

                          document
                            .getElementById(
                              "contract-upload"
                            )
                            ?.click()
                        }}
                      >

                        {formData.contract

                          ? formData.contract.name

                          : "Choose File"}

                      </Button>
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
                              e.target.value,
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

                  <p className="text-sm text-muted-foreground">

                    Choose developers to assign to this project

                  </p>

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

                                {member.name}

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

          {/* FOOTER */}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">

            <Button

              variant="outline"

              onClick={
                handleBack
              }

              disabled={
                currentStep === 1
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
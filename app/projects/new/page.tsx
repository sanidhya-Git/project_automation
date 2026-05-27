"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import {
  Upload,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react"

import { toast } from "sonner"

export default function NewProjectPage() {

  const router =
    useRouter()

  const [step, setStep] =
    useState(1)

  const [isSubmitting,
    setIsSubmitting] =
    useState(false)

  const [teamMembers,
    setTeamMembers] =
    useState<any[]>([])

  const [formData,
    setFormData] =
    useState({

      name: "",

      description: "",

      figmaLink: "",

      prd: null as File | null,

      contract:
        null as File | null,

      selectedTeam:
        [] as string[],

      template:
        "nodejs",
    })

  // =========================
  // FETCH TEAM MEMBERS
  // =========================

  useEffect(() => {

    const fetchMembers =
      async () => {

        try {

          const response =
            await fetch(
              "/api/team-members"
            )

          const data =
            await response.json()

          setTeamMembers(
            data
          )

        } catch (error) {

          console.log(error)
        }
      }

    fetchMembers()

  }, [])

  // =========================
  // NEXT STEP
  // =========================

  const nextStep = () => {

    if (step < 4) {

      setStep(
        step + 1
      )
    }
  }

  // =========================
  // PREV STEP
  // =========================

  const prevStep = () => {

    if (step > 1) {

      setStep(
        step - 1
      )
    }
  }

  // =========================
  // SELECT DEVELOPER
  // =========================

  const toggleDeveloper =
    (id: string) => {

      setFormData({
        ...formData,

        selectedTeam:

          formData.selectedTeam.includes(id)

            ? formData.selectedTeam.filter(
                (memberId) =>
                  memberId !== id
              )

            : [
                ...formData.selectedTeam,
                id,
              ],
      })
    }

  // =========================
  // CREATE PROJECT
  // =========================

  const handleCreateProject =
    async () => {

      try {

        setIsSubmitting(true)

        // ===================
        // UPLOAD FILES
        // ===================

        const uploads = []

        // PRD

        if (formData.prd) {

          const prdForm =
            new FormData()

          prdForm.append(
            "file",
            formData.prd
          )

          uploads.push(

            fetch(
              "/api/upload",
              {
                method: "POST",
                body: prdForm,
              }
            ).then((res) =>
              res.json()
            )
          )

        } else {

          uploads.push(
            Promise.resolve({
              url: "",
            })
          )
        }

        // CONTRACT

        if (
          formData.contract
        ) {

          const contractForm =
            new FormData()

          contractForm.append(
            "file",
            formData.contract
          )

          uploads.push(

            fetch(
              "/api/upload",
              {
                method: "POST",
                body: contractForm,
              }
            ).then((res) =>
              res.json()
            )
          )

        } else {

          uploads.push(
            Promise.resolve({
              url: "",
            })
          )
        }

        const [
          prdResult,
          contractResult,
        ] = await Promise.all(
          uploads
        )

        // ===================
        // CREATE PROJECT
        // ===================

        const response =
          await fetch(
            "/api/projects",
            {
              method: "POST",

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

                prdUrl:
                  prdResult.url,

                contractUrl:
                  contractResult.url,

                teamMembers:
                  formData.selectedTeam,

                template:
                  formData.template,
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
              "Project creation failed"
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

        console.log(error)

        toast.error(
          error.message
        )

      } finally {

        setIsSubmitting(
          false
        )
      }
    }

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">
            Create New Project
          </h1>

          <p className="text-zinc-400 text-lg">
            Setup your project with
            GitHub + Jira automation
          </p>
        </div>

        {/* STEPS */}

        <div className="flex items-center justify-between mb-14">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}

                className="flex flex-col items-center gap-3"
              >

                <div

                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border transition-all

                  ${
                    step > item

                      ? "bg-emerald-500 border-emerald-500"

                      : step === item

                      ? "border-violet-500 text-violet-400"

                      : "border-zinc-800 text-zinc-500"
                  }`}
                >

                  {step > item ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    item
                  )}
                </div>

                <p className="text-sm text-zinc-400">

                  {
                    item === 1

                      ? "Project Details"

                      : item === 2

                      ? "Upload Documents"

                      : item === 3

                      ? "Select Developers"

                      : "Select Template"
                  }

                </p>
              </div>
            )
          )}
        </div>

        {/* CARD */}

        <div className="bg-[#050505] border border-zinc-900 rounded-3xl p-10">

          {/* STEP 1 */}

          {step === 1 && (

            <div className="space-y-8">

              <div>

                <label className="block mb-3 text-lg font-medium">
                  Project Name
                </label>

                <input

                  type="text"

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

                  className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"

                  placeholder="Enter project name"
                />
              </div>

              <div>

                <label className="block mb-3 text-lg font-medium">
                  Description
                </label>

                <textarea

                  rows={6}

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

                  className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"

                  placeholder="Project description"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (

            <div className="space-y-8">

              {/* PRD */}

              <div className="border border-zinc-800 rounded-2xl p-10">

                <div className="flex flex-col items-center gap-5">

                  <Upload className="w-14 h-14 text-zinc-500" />

                  <h2 className="text-2xl font-semibold">
                    Upload PRD
                  </h2>

                  <input

                    id="prd-upload"

                    type="file"

                    accept=".pdf,.doc,.docx"

                    className="hidden"

                    onChange={(e) =>
                      setFormData({
                        ...formData,

                        prd:
                          e.target.files?.[0] || null,
                      })
                    }
                  />

                  <label

                    htmlFor="prd-upload"

                    className="cursor-pointer px-6 py-3 bg-emerald-500 text-black rounded-xl font-semibold hover:bg-emerald-400"
                  >
                    Choose File
                  </label>

                  {formData.prd && (

                    <p className="text-zinc-400">

                      {
                        formData.prd.name
                      }

                    </p>
                  )}
                </div>
              </div>

              {/* CONTRACT */}

              <div className="border border-zinc-800 rounded-2xl p-10">

                <div className="flex flex-col items-center gap-5">

                  <FileText className="w-14 h-14 text-zinc-500" />

                  <h2 className="text-2xl font-semibold">
                    Upload Contract
                  </h2>

                  <input

                    id="contract-upload"

                    type="file"

                    accept=".pdf,.doc,.docx"

                    className="hidden"

                    onChange={(e) =>
                      setFormData({
                        ...formData,

                        contract:
                          e.target.files?.[0] || null,
                      })
                    }
                  />

                  <label

                    htmlFor="contract-upload"

                    className="cursor-pointer px-6 py-3 bg-cyan-500 text-black rounded-xl font-semibold hover:bg-cyan-400"
                  >
                    Choose File
                  </label>

                  {formData.contract && (

                    <p className="text-zinc-400">

                      {
                        formData.contract.name
                      }

                    </p>
                  )}
                </div>
              </div>

              {/* FIGMA */}

              <div>

                <label className="block mb-3 text-lg font-medium">
                  Figma Link
                </label>

                <input

                  type="text"

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

                  className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"

                  placeholder="https://figma.com/..."
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (

            <div className="space-y-5">

              {teamMembers.map(
                (member) => (

                  <div

                    key={member._id}

                    onClick={() =>
                      toggleDeveloper(
                        member._id
                      )
                    }

                    className={`p-5 rounded-2xl border cursor-pointer transition-all

                    ${
                      formData.selectedTeam.includes(
                        member._id
                      )

                        ? "border-emerald-500 bg-emerald-500/10"

                        : "border-zinc-800 bg-black"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="text-xl font-semibold">
                          {member.name}
                        </h3>

                        <p className="text-zinc-400">
                          {member.role}
                        </p>
                      </div>

                      <div>

                        <input
                          type="checkbox"

                          checked={formData.selectedTeam.includes(
                            member._id
                          )}

                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (

            <div className="grid grid-cols-2 gap-6">

              {/* NODEJS */}

              <div

                onClick={() =>
                  setFormData({
                    ...formData,

                    template:
                      "nodejs",
                  })
                }

                className={`p-8 rounded-2xl border cursor-pointer transition-all

                ${
                  formData.template ===
                  "nodejs"

                    ? "border-emerald-500 bg-emerald-500/10"

                    : "border-zinc-800 bg-black"
                }`}
              >

                <h2 className="text-3xl font-bold mb-3">
                  Node.js
                </h2>

                <p className="text-zinc-400">
                  Express starter template
                </p>
              </div>

              {/* DOTNET */}

              <div

                onClick={() =>
                  setFormData({
                    ...formData,

                    template:
                      "dotnet",
                  })
                }

                className={`p-8 rounded-2xl border cursor-pointer transition-all

                ${
                  formData.template ===
                  "dotnet"

                    ? "border-cyan-500 bg-cyan-500/10"

                    : "border-zinc-800 bg-black"
                }`}
              >

                <h2 className="text-3xl font-bold mb-3">
                  .NET
                </h2>

                <p className="text-zinc-400">
                  ASP.NET starter template
                </p>
              </div>
            </div>
          )}

          {/* BUTTONS */}

          <div className="flex items-center justify-between mt-12">

            <button

              onClick={prevStep}

              disabled={step === 1}

              className="px-6 py-3 rounded-xl border border-zinc-800 flex items-center gap-2 disabled:opacity-50"
            >

              <ArrowLeft className="w-5 h-5" />

              Back
            </button>

            {step < 4 ? (

              <button

                onClick={nextStep}

                className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold flex items-center gap-2"
              >

                Next

                <ArrowRight className="w-5 h-5" />
              </button>

            ) : (

              <button

                onClick={
                  handleCreateProject
                }

                disabled={
                  isSubmitting
                }

                className="px-8 py-3 rounded-xl bg-violet-500 text-white font-semibold"
              >

                {isSubmitting
                  ? "Creating..."
                  : "Create Project"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
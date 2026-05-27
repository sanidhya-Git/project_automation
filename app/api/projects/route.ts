import { NextResponse } from "next/server"

import dbConnect from "@/lib/mongodb"

import Project from "@/lib/models/project"

import TeamMember from "@/lib/models/team-member"

import { templates } from "@/lib/template"

export async function GET() {

  try {

    await dbConnect()

    const projects =
      await Project.find()
        .populate("teamMembers")
        .sort({
          createdAt: -1,
        })

    return NextResponse.json(
      projects
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(
      {
        error:
          "Failed to fetch projects",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  req: Request
) {

  try {

    await dbConnect()

    const body =
      await req.json()

    // =========================
    // REPO NAME
    // =========================

    const repoName =
      body.name
        .toLowerCase()
        .replace(/\s+/g, "-")

    // =========================
    // CREATE GITHUB REPO
    // =========================

    console.time(
      "github-repo"
    )

    const githubRepoResponse =
      await fetch(
        "https://api.github.com/user/repos",
        {
          method: "POST",

          headers: {

            Authorization:
              `token ${process.env.GITHUB_TOKEN}`,

            Accept:
              "application/vnd.github+json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            name:
              repoName,

            private: true,
          }),
        }
      )

    const githubRepoData =
      await githubRepoResponse.json()

    console.timeEnd(
      "github-repo"
    )

    if (
      !githubRepoResponse.ok
    ) {

      console.log(
        githubRepoData
      )

      throw new Error(
        githubRepoData.message ||
        "GitHub repo creation failed"
      )
    }



// =========================
// PUSH TEMPLATE FILES
// =========================

const selectedTemplate =
  templates[
    body.template as keyof typeof templates
  ]

if (selectedTemplate) {

  // FIRST WAIT 3 SEC
  // FOR REPO INITIALIZATION

  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        3000
      )
  )

  for (
    const file of selectedTemplate.files
  ) {

    const pushResponse =
      await fetch(

        `https://api.github.com/repos/${githubRepoData.owner.login}/${repoName}/contents/${file.path}`,

        {
          method: "PUT",

          headers: {

            Authorization:
              `token ${process.env.GITHUB_TOKEN}`,

            Accept:
              "application/vnd.github+json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            message:
              `Add ${file.path}`,

            content:
              Buffer.from(
                file.content
              ).toString(
                "base64"
              ),

            branch:
              "main",
          }),
        }
      )

    const pushData =
      await pushResponse.json()

    console.log(
      "PUSH FILE:",
      file.path,
      pushData
    )
  }
}

    // =========================
    // GET TEAM MEMBERS
    // =========================

    const selectedMembers =
      await TeamMember.find({

        _id: {
          $in:
            body.teamMembers,
        },
      })

    // =========================
    // INVITE DEVELOPERS
    // =========================

    await Promise.all(

      selectedMembers.map(
        async (member) => {

          if (
            member.githubUsername
          ) {

            try {

              await fetch(

                `https://api.github.com/repos/${githubRepoData.owner.login}/${repoName}/collaborators/${member.githubUsername}`,

                {
                  method: "PUT",

                  headers: {

                    Authorization:
                      `token ${process.env.GITHUB_TOKEN}`,

                    Accept:
                      "application/vnd.github+json",

                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({

                    permission:
                      "push",
                  }),
                }
              )

            } catch (error) {

              console.log(
                "GitHub invite failed:",
                member.githubUsername
              )
            }
          }
        }
      )
    )

    // =========================
    // CREATE JIRA PROJECT
    // =========================

    const jiraKey =
      body.name
        .replace(/[^A-Z0-9]/gi, "")
        .substring(0, 4)
        .toUpperCase()

    console.time(
      "jira-project"
    )

    const jiraResponse =
      await fetch(

        `${process.env.JIRA_HOST}/rest/api/3/project`,

        {
          method: "POST",

          headers: {

            Authorization:
              `Basic ${Buffer.from(

                `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`

              ).toString("base64")}`,

            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            key:
              jiraKey,

            name:
              body.name,

            projectTypeKey:
              "software",

            projectTemplateKey:
              "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban",

            leadAccountId:
              process.env
                .JIRA_ACCOUNT_ID,
          }),
        }
      )

    const jiraData =
      await jiraResponse.json()

    console.timeEnd(
      "jira-project"
    )

    if (
      !jiraResponse.ok
    ) {

      console.log(
        jiraData
      )

      throw new Error(
        jiraData.errorMessages?.[0] ||
        "Jira project creation failed"
      )
    }

    // =========================
    // SAVE PROJECT
    // =========================

    const project =
      await Project.create({

        name:
          body.name,

        description:
          body.description,

        figmaLink:
          body.figmaLink,

        prdUrl:
          body.prdUrl,

        contractUrl:
          body.contractUrl,

        teamMembers:
          body.teamMembers,

        githubRepo:
          githubRepoData.name,

        githubRepoUrl:
          githubRepoData.html_url,

        jiraProjectId:
          jiraData.id,

        jiraProjectKey:
          jiraData.key,

        jiraBoardUrl:

          `${process.env.JIRA_HOST}/jira/software/projects/${jiraData.key}/boards/1`,

        status:
          "In Progress",

        progress: 0,

        activity: [

          {
            type:
              "project_created",

            message:
              "Project created successfully",
          },

          {
            type:
              "github_repo_created",

            message:
              `GitHub repository created: ${githubRepoData.name}`,
          },

          {
            type:
              "jira_project_created",

            message:
              `Jira project created: ${jiraData.key}`,
          },

          {
            type:
              "template_initialized",

            message:
              `${body.template} template pushed to repository`,
          },
        ],
      })

    return NextResponse.json(
      project
    )

  } catch (error: any) {

    console.log(error)

    return NextResponse.json(
      {
        error:
          error.message ||
          "Project creation failed",
      },
      {
        status: 500,
      }
    )
  }
}
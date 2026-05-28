import { NextResponse } from "next/server"

import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/project"
import TeamMember from "@/lib/models/team-member"
import { templates } from "@/lib/templates"
import { generateTasks } from "@/lib/claude"
import { createJiraTask } from "@/lib/jira"

async function getJiraAccountId(email: string) {
  try {
    const jiraAuth = Buffer.from(
      `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
    ).toString("base64")

    const response = await fetch(
      `${process.env.JIRA_HOST}/rest/api/3/user/search?query=${email}`,
      {
        method: "GET",

        headers: {
          Authorization: `Basic ${jiraAuth}`,
          Accept: "application/json",
        },
      }
    )

    const data = await response.json()

    console.log("JIRA USER SEARCH:", data)

    return data?.[0]?.accountId || null
  } catch (error) {
    console.log("ACCOUNT ID FETCH ERROR:", error)
    return null
  }
}

export async function GET() {
  try {
    await dbConnect()

    const projects = await Project.find()
      .populate("teamMembers")
      .sort({
        createdAt: -1,
      })

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()

    const body = await req.json()

    const baseRepoName = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const repoName = baseRepoName

    const selectedTemplate =
      templates[
        body.template as keyof typeof templates
      ]

    // =========================
    // CREATE GITHUB REPOSITORY
    // =========================

    const templateResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${selectedTemplate.templateRepo}/generate`,
      {
        method: "POST",

        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,

          Accept:
            "application/vnd.github.baptiste-preview+json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          owner:
            process.env.GITHUB_USERNAME,

          name:
            repoName,

          private:
            true,
        }),
      }
    )

    const githubRepoData =
      await templateResponse.json()

    console.log(
      "TEMPLATE RESPONSE:",
      githubRepoData
    )

    if (
      !githubRepoData.owner
    ) {
      throw new Error(
        githubRepoData.message ||
          "GitHub repository creation failed"
      )
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
    // INVITE GITHUB USERS
    // =========================

    for (
      const member of selectedMembers
    ) {
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
            "GitHub Invite Error:",
            error
          )
        }
      }
    }

    // =========================
    // CREATE JIRA PROJECT
    // =========================

    const jiraKey =
      body.name
        .replace(/[^A-Z0-9]/gi, "")
        .substring(0, 8)
        .toUpperCase()

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

    console.log(
      "JIRA PROJECT:",
      jiraData
    )

    if (
      jiraData?.errorMessages
    ) {
      throw new Error(
        jiraData.errorMessages[0]
      )
    }

    // =========================
    // GENERATE AI TASKS
    // =========================

    const aiResult =
      await generateTasks({
        projectName:
          body.name,

        description:
          body.description,

        figmaLink:
          body.figmaLink,

        prdText:
          body.prdUrl,

        developers:
          selectedMembers,
      })

    console.log(
      "AI RESULT:",
      aiResult
    )

    // =========================
    // CREATE JIRA TASKS
    // =========================

    if (
      aiResult?.tasks?.length
    ) {
      for (
        let index = 0;
        index <
        aiResult.tasks.length;
        index++
      ) {
        const task =
          aiResult.tasks[index]

        const member =
          selectedMembers[
            index %
              selectedMembers.length
          ]

        try {
          let assigneeId = null

          if (
            member?.jiraEmail
          ) {
            assigneeId =
              await getJiraAccountId(
                member.jiraEmail
              )
          }

          await createJiraTask({
            projectKey:
              jiraData.key,

            summary:
              task.title,

            description:
`
${task.description}

Acceptance Criteria:

${task.acceptanceCriteria
  ?.map(
    (item: string) =>
      `- ${item}`
  )
  .join("\n")}

Priority:
${task.priority}

Type:
${task.type}
`,

            issueType:
              "Story",

            assigneeId,

            priority:
              task.priority ===
              "high"
                ? "High"
                : task.priority ===
                  "medium"
                ? "Medium"
                : "Low",

            labels: [
              "ai-generated",
              "claude-task",
            ],
          })
        } catch (error) {
          console.log(
            "JIRA TASK ERROR:",
            error
          )
        }
      }
    }

    // =========================
    // CREATE README
    // =========================

    const readmeContent =
`
# ${body.name}

## Description

${body.description}

---

## Figma

${body.figmaLink}

---

## PRD

${body.prdUrl}

---

## AI Tasks

${aiResult?.tasks
  ?.map(
    (task: any) =>
`
### ${task.title}

${task.description}

Priority:
${task.priority}

Type:
${task.type}
`
  )
  .join("\n")}
`

    await fetch(
      `https://api.github.com/repos/${githubRepoData.owner.login}/${repoName}/contents/README.md`,
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
            "Add AI README",

          content:
            Buffer.from(
              readmeContent
            ).toString(
              "base64"
            ),

          branch:
            "main",
        }),
      }
    )

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
          `${process.env.JIRA_HOST}/jira/software/projects/${jiraData.key}`,

        status:
          "In Progress",

        progress: 0,
      })

    return NextResponse.json(
      project
    )
  } catch (error: any) {
    console.log(error)

    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    )
  }
}
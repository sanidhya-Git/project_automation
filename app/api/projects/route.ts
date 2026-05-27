import { NextResponse } from "next/server"

import dbConnect from "@/lib/mongodb"

import Project from "@/lib/models/project"

import TeamMember from "@/lib/models/team-member"

import { templates } from "@/lib/templates"

import { generateTasks } from "@/lib/claude"

import { createJiraTask } from "@/lib/jira"

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

    const repoName =
      body.name
        .toLowerCase()
        .replace(/\s+/g, "-")

    const selectedTemplate =

      templates[
        body.template as keyof typeof templates
      ]

    const templateResponse =
      await fetch(

        `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${selectedTemplate.templateRepo}/generate`,

        {
          method: "POST",

          headers: {

            Authorization:
              `token ${process.env.GITHUB_TOKEN}`,

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
        "GitHub repository creation failed"
      )
    }

    const selectedMembers =
      await TeamMember.find({

        _id: {
          $in:
            body.teamMembers,
        },
      })

    for (
      const member of selectedMembers
    ) {

      if (
        member.githubUsername
      ) {

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
      }
    }

    const randomNumber =
      Math.floor(
        100 + Math.random() * 900
      )

    const jiraKey =

      (
        body.name
          .replace(
            /[^A-Z0-9]/gi,
            ""
          )
          .substring(0, 4) +

        randomNumber
      ).toUpperCase()

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

    if (
      aiResult?.tasks?.length
    ) {

      for (
        const task of aiResult.tasks
      ) {

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
`,
        })
      }
    }

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
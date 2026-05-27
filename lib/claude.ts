async function askClaude(
  prompt: string
) {

  const response =
    await fetch(

      "https://api.anthropic.com/v1/messages",

      {
        method: "POST",

        headers: {

          "x-api-key":
            process.env.CLAUDE_API_KEY!,

          "anthropic-version":
            "2023-06-01",

          "content-type":
            "application/json",
        },

        body: JSON.stringify({

          model:
            "claude-sonnet-4-6",

          max_tokens: 3000,

          messages: [

            {
              role: "user",

              content:
                prompt,
            },
          ],
        }),
      }
    )

  const data =
    await response.json()

  console.log(
    "CLAUDE:",
    data
  )

  if (
    data.error
  ) {

    return []
  }

  try {

    const raw =
      data.content[0].text

    const cleaned =
      raw
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim()

    const parsed =
      JSON.parse(cleaned)

    return (
      parsed.tasks || []
    )

  } catch {

    return []
  }
}

export async function generateTasks({

  projectName,

  description,

  figmaLink,

  prdText,

  developers,

}: any) {

  const phases = [

    {
      name:
        "Phase 1",

      focus:
        "Project setup, authentication, database schema, backend architecture",
    },

    {
      name:
        "Phase 2",

      focus:
        "Student module, profiles, dashboards, APIs",
    },

    {
      name:
        "Phase 3",

      focus:
        "Teacher module, classes, assignments, management",
    },

    {
      name:
        "Phase 4",

      focus:
        "Attendance, exams, reports, analytics",
    },

    {
      name:
        "Phase 5",

      focus:
        "AI features, chatbot, recommendations, automation",
    },

    {
      name:
        "Phase 6",

      focus:
        "DevOps, CI/CD, deployment, monitoring",
    },
  ]

  let allTasks: any[] = []

  for (const phase of phases) {

    const prompt = `

You are a senior software architect.

Generate tasks ONLY for:

${phase.name}

Focus:
${phase.focus}

Generate maximum 8 tasks.

Return ONLY valid JSON.

{
  "tasks": [
    {
      "title": "",
      "description": "",
      "type": "",
      "priority": ""
    }
  ]
}

Project:
${projectName}

Description:
${description}

Figma:
${figmaLink}

PRD:
${prdText}

Developers:
${developers
  .map(
    (dev: any) =>
      `${dev.name} (${dev.role})`
  )
  .join(", ")}
`

    const tasks =
      await askClaude(
        prompt
      )

    allTasks = [
      ...allTasks,
      ...tasks,
    ]
  }

  return {
    tasks:
      allTasks,
  }
}
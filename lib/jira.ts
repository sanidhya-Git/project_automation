export async function createJiraTask({

  projectKey,

  summary,

  description,

  assigneeId,

}: any) {

  return fetch(

    `${process.env.JIRA_HOST}/rest/api/3/issue`,

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

        fields: {

          project: {

            key:
              projectKey,
          },

          summary,

          description: {

            type: "doc",

            version: 1,

            content: [

              {
                type: "paragraph",

                content: [

                  {
                    text:
                      description,

                    type: "text",
                  },
                ],
              },
            ],
          },

          issuetype: {

            name: "Task",
          },

          assignee:
            assigneeId
              ? {
                  id:
                    assigneeId,
                }
              : undefined,
        },
      }),
    }
  )
}
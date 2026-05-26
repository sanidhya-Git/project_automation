import axios from "axios"

const jira = axios.create({
  baseURL: `https://${process.env.JIRA_DOMAIN}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
})

export async function createJiraProject(name: string) {
  const response = await jira.post("/project", {
    key: name.substring(0, 4).toUpperCase(),
    name,
    projectTypeKey: "software",
    projectTemplateKey:
      "com.pyxis.greenhopper.jira:gh-simplified-agility-scrum",
    leadAccountId: "YOUR_ACCOUNT_ID",
  })

  return response.data
}
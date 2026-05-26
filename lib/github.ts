import axios from "axios"

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
})

export async function createGithubRepo(repoName: string) {
  const response = await github.post("/user/repos", {
    name: repoName,
    private: true,
    auto_init: true,
  })

  return response.data
}

export async function addCollaborator(
  repo: string,
  username: string
) {
  await github.put(
    `/repos/${process.env.GITHUB_OWNER}/${repo}/collaborators/${username}`
  )
}
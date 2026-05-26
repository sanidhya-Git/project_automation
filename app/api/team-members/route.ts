import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import TeamMember from "@/lib/models/team-member"

export async function GET() {

  try {

    await dbConnect()

    const members =
      await TeamMember.find()
      .sort({ createdAt: -1 })

    return NextResponse.json(members)

  } catch (error) {

    console.log(
      "Error fetching team members:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to fetch team members"
      },
      {
        status: 500
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

    const member =
      await TeamMember.create({

        name: body.name,

        email: body.email,

        role: body.role,

        githubUsername:
          body.githubUsername,

        githubUrl:
          body.githubUrl,

        jiraEmail:
          body.jiraEmail,
      })

    return NextResponse.json(member)

  } catch (error) {

    console.log(
      "Error creating team member:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to create team member"
      },
      {
        status: 500
      }
    )
  }
}
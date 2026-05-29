import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import TeamMember from "@/lib/models/team-member"
import Project from "@/lib/models/project"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params


    await Project.updateMany(
      { teamMembers: id },
      { $pull: { teamMembers: id } }
    )

    const deletedMember = await TeamMember.findByIdAndDelete(id)

    if (!deletedMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Team member deleted successfully" })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { name, githubUrl, jiraEmail } = body

    const updatedMember = await TeamMember.findByIdAndUpdate(
      id,
      { name, githubUrl, jiraEmail },
      { new: true, runValidators: true }
    )

    if (!updatedMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...updatedMember.toObject(),
      _id: updatedMember._id.toString(),
    })
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    )
  }
}

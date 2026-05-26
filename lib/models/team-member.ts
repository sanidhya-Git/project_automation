import mongoose, {
  Schema,
  models,
  model
} from "mongoose"

const TeamMemberSchema =
  new Schema(
    {

      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        default: "Developer",
      },

      githubUsername: {
        type: String,
        required: true,
      },

      githubUrl: {
        type: String,
      },

      jiraEmail: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  )

const TeamMember =

  models.TeamMember ||

  model(
    "TeamMember",
    TeamMemberSchema
  )

export default TeamMember
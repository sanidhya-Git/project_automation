import mongoose, {
  Schema,
  models,
  model,
} from "mongoose"

const ActivitySchema =
  new Schema({

    type: {
      type: String,
    },

    message: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  })

const TaskSchema =
  new Schema({

    title: String,

    status: String,

    priority: String,
  })

const ProjectSchema =
  new Schema(
    {

      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        default: "active",
      },

      progress: {
        type: Number,
        default: 0,
      },

      githubRepo: String,

      githubRepoUrl:
        String,

      jiraProjectId:
        String,

      jiraProjectKey:
        String,

      jiraBoardUrl:
        String,

      figmaLink:
        String,

      prdUrl:
        String,

      contractUrl:
        String,

      teamMembers: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref:
            "TeamMember",
        },
      ],

      tasks: [TaskSchema],

      activity:
        [ActivitySchema],
    },
    {
      timestamps: true,
    }
  )

const Project =

  models.Project ||

  model(
    "Project",
    ProjectSchema
  )

export default Project
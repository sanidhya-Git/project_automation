export const templates = {

  nodejs: {

    files: [

      {
        path: "README.md",

        content:
`# Node.js Starter

Generated automatically by Fulminous DevOS.
`,
      },

      {
        path: ".gitignore",

        content:
`node_modules
.env
dist
`,
      },

      {
        path: "package.json",

        content:
JSON.stringify(
  {

    name:
      "nodejs-template",

    version:
      "1.0.0",

    main:
      "src/index.js",

    scripts: {

      dev:
        "nodemon src/index.js",

      start:
        "node src/index.js",
    },

    dependencies: {

      express:
        "^4.18.2",

      cors:
        "^2.8.5",

      dotenv:
        "^16.4.0",
    },

    devDependencies: {

      nodemon:
        "^3.0.2",
    },
  },

  null,
  2
),
      },

      {
        path: "src/index.js",

        content:
`const express = require("express")

const cors = require("cors")

require("dotenv").config()

const app = express()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "API Running"
  })
})

const PORT =
  process.env.PORT || 5000

app.listen(PORT, () => {

  console.log(
    "Server started on",
    PORT
  )
})
`,
      },
    ],
  },

  dotnet: {

    files: [

      {
        path: "README.md",

        content:
`# ASP.NET Core Starter

Generated automatically by Fulminous DevOS.
`,
      },

      {
        path: ".gitignore",

        content:
`bin/
obj/
`,
      },
    ],
  },
}
import { NextResponse } from "next/server"

export async function POST(
  req: Request
) {

  try {

    const formData =
      await req.formData()

    const file =
      formData.get(
        "file"
      ) as File

    if (!file) {

      return NextResponse.json(
        {
          error:
            "No file uploaded",
        },
        {
          status: 400,
        }
      )
    }

const cloudinaryForm =
  new FormData()

cloudinaryForm.append(
  "file",
  file
)

cloudinaryForm.append(
  "upload_preset",
  "projects"
)
    const response =
      await fetch(

        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,

        {
          method: "POST",

          body:
            cloudinaryForm,
        }
      )

    const data =
      await response.json()

    console.log(
      "CLOUDINARY:",
      data
    )

    if (!response.ok) {

      throw new Error(
        "Upload failed"
      )
    }

    return NextResponse.json({

      url:
        data.secure_url,
    })

  } catch (error) {

    console.log(
      "UPLOAD ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Upload failed",
      },
      {
        status: 500,
      }
    )
  }
}
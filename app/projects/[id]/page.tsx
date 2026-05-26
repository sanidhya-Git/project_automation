'use client'

import {
  useEffect,
  useState
} from 'react'

import {
  useParams
} from 'next/navigation'

import {DashboardLayout}
from "@/components/layout/dashboard-layout";

interface Project {

  _id: string

  name: string

  description: string

  status: string

  progress: number

  githubRepoUrl: string

  jiraBoardUrl: string

  figmaLink: string

  prdUrl: string

  contractUrl: string

  timeline: string

  teamMembers: any[]
}

export default function ProjectDetailsPage() {

  const params =
    useParams()

  const [project,
    setProject] =
      useState<Project | null>(null)

  const [loading,
    setLoading] =
      useState(true)

  useEffect(() => {

    fetchProject()

  }, [])

  async function fetchProject() {

    try {

      const response =
        await fetch(
          `/api/projects/${params.id}`
        )

      const data =
        await response.json()

      setProject(data)

    } catch (error) {

      console.log(error)

    } finally {

      setLoading(false)
    }
  }

  if (loading) {

    return (

      <DashboardLayout>

        <div className='h-[80vh] flex items-center justify-center'>

          <div className='text-3xl'>
            Loading...
          </div>

        </div>

      </DashboardLayout>
    )
  }

  if (!project) {

    return (

      <DashboardLayout>

        <div className='h-[80vh] flex items-center justify-center'>

          <div className='text-3xl'>
            Project Not Found
          </div>

        </div>

      </DashboardLayout>
    )
  }

  return (

    <DashboardLayout>

      <div className='flex justify-between items-start mb-14'>

        <div>

          <h1 className='text-6xl font-bold'>
            {project.name}
          </h1>

          <p className='text-zinc-400 text-2xl mt-4 max-w-4xl'>
            {project.description}
          </p>

        </div>

        <div
          className='bg-[#151226] border border-[#2A234A] text-[#8B7FFF] px-6 py-3 rounded-full text-xl'
        >

          {project.status}

        </div>

      </div>

      <div className='grid grid-cols-3 gap-8 mb-10'>

        <div className='bg-[#050505] border border-white/10 rounded-[32px] p-8'>

          <p className='text-zinc-500 text-xl mb-5'>
            Progress
          </p>

          <h2 className='text-5xl font-bold mb-6'>
            {project.progress}%
          </h2>

          <div className='h-4 bg-[#26213D] rounded-full overflow-hidden'>

            <div
              className='h-full bg-[#8B7FFF]'
              style={{
                width: `${project.progress}%`
              }}
            />

          </div>

        </div>

        <a
          href={project.githubRepoUrl}
          target='_blank'
          className='bg-[#050505] border border-white/10 rounded-[32px] p-8'
        >

          <p className='text-zinc-500 text-xl mb-5'>
            GitHub Repository
          </p>

          <h2 className='text-3xl font-bold'>
            Open Repository
          </h2>

        </a>

        <a
          href={project.jiraBoardUrl}
          target='_blank'
          className='bg-[#050505] border border-white/10 rounded-[32px] p-8'
        >

          <p className='text-zinc-500 text-xl mb-5'>
            Jira Board
          </p>

          <h2 className='text-3xl font-bold'>
            Open Jira
          </h2>

        </a>

      </div>

      <div className='grid grid-cols-2 gap-8 mb-10'>

        <a
          href={project.prdUrl}
          target='_blank'
          className='bg-[#050505] border border-white/10 rounded-[32px] p-8'
        >

          <p className='text-zinc-500 text-xl mb-5'>
            PRD Document
          </p>

          <h2 className='text-3xl font-bold'>
            View PRD
          </h2>

        </a>

        <a
          href={project.contractUrl}
          target='_blank'
          className='bg-[#050505] border border-white/10 rounded-[32px] p-8'
        >

          <p className='text-zinc-500 text-xl mb-5'>
            Contract
          </p>

          <h2 className='text-3xl font-bold'>
            View Contract
          </h2>

        </a>

      </div>

      <div className='bg-[#050505] border border-white/10 rounded-[32px] p-10'>

        <div className='flex justify-between items-center mb-10'>

          <h2 className='text-4xl font-bold'>
            Team Members
          </h2>

          <div className='text-zinc-500 text-xl'>
            {project.teamMembers.length} Members
          </div>

        </div>

        <div className='grid grid-cols-2 gap-6'>

          {
            project.teamMembers.map(
              (member: any) => (

                <div
                  key={member._id}
                  className='border border-white/10 rounded-2xl p-6 flex items-center gap-5'
                >

                  <div className='h-16 w-16 rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold text-black'>

                    {
                      member.name
                        ?.slice(0, 2)
                        .toUpperCase()
                    }

                  </div>

                  <div>

                    <h3 className='text-2xl font-bold'>
                      {member.name}
                    </h3>

                    <p className='text-zinc-500'>
                      {member.role}
                    </p>

                  </div>

                </div>
              )
            )
          }

        </div>

      </div>

    </DashboardLayout>
  )
}
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Github, Play } from 'lucide-react'
import { projects } from '../data/projects'

const linkIconMap = {
  github: Github,
  live: ExternalLink,
  video: Play,
}

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const demoVideoRef = useRef(null)
  const [demoRatio, setDemoRatio] = useState('16 / 9')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const projectId = useMemo(() => Number(id), [id])
  const project = projects.find((item) => item.id === projectId)

  const handleBackClick = () => {
    navigate('/', { state: { fromProjectDetail: true } })
  }

  const handleVideoMetadata = () => {
    if (demoVideoRef.current) {
      const { videoWidth, videoHeight } = demoVideoRef.current
      if (videoWidth && videoHeight) {
        setDemoRatio(`${videoWidth} / ${videoHeight}`)
      }
    }
  }

  const renderPrimaryMedia = () => {
    if (!project) return null
    const shouldUseVideo = project.type === 'video' || project.image?.endsWith('.mp4')

    if (shouldUseVideo) {
      return (
        <video
          src={project.image}
          poster={project.staticImage}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      )
    }

    return <img src={project.image} alt={project.title} />
  }

  const renderLinks = () => {
    if (!project?.links || project.links.length === 0) return null

    return (
      <div className="project-detail__links">
        {project.links.map((link) => {
          const Icon = linkIconMap[link.type] || ExternalLink
          return (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              <Icon size={16} strokeWidth={2} />
              <span>{link.label}</span>
            </a>
          )
        })}
      </div>
    )
  }

  const renderSupplementalMedia = () => {
    if (!project) return null

    if (project.youtubeEmbed) {
      return (
        <div className="project-detail__embed">
          <div className="project-detail__embed-media project-detail__embed-media--wide">
            <iframe
              src={project.youtubeEmbed}
              title={`${project.title} demo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      )
    }

    if (project.iframeUrl) {
      return (
        <div className="project-detail__embed">
          <div className="project-detail__embed-media project-detail__embed-media--tall">
            <iframe
              src={project.iframeUrl}
              title={`${project.title} interactive`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      )
    }

    if (project.demoVideo) {
      return (
        <div className="project-detail__embed">
          <div className="project-detail__embed-media" style={{ aspectRatio: demoRatio }}>
            <video
              ref={demoVideoRef}
              controls
              playsInline
              preload="metadata"
              src={project.demoVideo}
              onLoadedMetadata={handleVideoMetadata}
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      )
    }

    return (
      <div className="project-detail__embed project-detail__embed--empty">
        <Play size={42} strokeWidth={1.5} />
        <p>Demo coming soon — this section updates alongside the live xrarchitect build.</p>
      </div>
    )
  }

  if (!project) {
    return (
      <section className="project-detail" aria-labelledby="project-missing">
        <div className="project-detail__content">
          <h1 id="project-missing">Project not found</h1>
          <p>Try selecting a different project from the grid — we might still be wiring this route.</p>
          <button type="button" className="button" onClick={handleBackClick}>
            Return home
          </button>
        </div>
      </section>
    )
  }

  const metaEntries = [
    { label: 'Roles', value: project.roles },
    { label: 'Technologies', value: project.technologies },
    { label: 'Status', value: project.status },
    { label: 'Team', value: project.teamSize },
    { label: 'Year', value: project.year },
  ].filter((entry) => entry.value && entry.value.length !== 0)

  return (
    <section className="project-detail">
      <button type="button" className="project-detail__back" onClick={handleBackClick}>
        <ArrowLeft size={16} strokeWidth={2} />
        Back to projects
      </button>

      <header className="project-detail__header">
        <p className="project-detail__category">{project.category}</p>
        <h1>{project.title}</h1>
        {project.status && (
          <p className="project-detail__lede">
            {project.status} • {project.year}
          </p>
        )}
      </header>

      <div className="project-detail__media">{renderPrimaryMedia()}</div>

      <div className="project-detail__grid">
        <div className="project-detail__content">
          <h2>Project overview</h2>
          <p>{project.overview}</p>

          {Array.isArray(project.keyWork) && project.keyWork.length > 0 && (
            <>
              <h3>Key work</h3>
              <ul className="project-detail__list">
                {project.keyWork.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {renderLinks()}
        </div>

        {metaEntries.length > 0 && (
          <aside className="project-detail__meta" aria-label="Project details">
            <dl>
              {metaEntries.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>
                    {Array.isArray(entry.value)
                      ? entry.value.join(', ')
                      : entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>

      {renderSupplementalMedia()}
    </section>
  )
}

export default ProjectDetailPage

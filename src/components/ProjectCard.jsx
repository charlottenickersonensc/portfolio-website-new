import { Link } from 'react-router-dom'

function ProjectCard({ project }) {
  const {
    id,
    title,
    category,
    overview,
    image,
    staticImage,
    type,
    year,
    status,
  } = project

  const shouldUseVideo = type === 'video' || image.endsWith('.mp4')

  return (
    <Link to={`/project/${id}`} className="project-card">
      <div className="project-card__media" aria-hidden>
        {shouldUseVideo ? (
          <video
            src={image}
            poster={staticImage}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <img src={image} alt="" />
        )}
      </div>

      <div className="project-card__body">
        <p className="project-card__category">{category}</p>
        <h3 className="project-card__title">{title}</h3>
        <p className="project-card__summary">{overview}</p>
        <p className="project-card__meta">
          {year} • {status}
        </p>
      </div>
    </Link>
  )
}

export default ProjectCard

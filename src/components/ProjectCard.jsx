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
    roles,
  } = project

  const shouldUseVideo = type === 'video' || image.endsWith('.mp4')

  return (
    <Link
      to={`/project/${id}`}
      className="project-card"
      aria-label={`View ${title}`}
      data-project-card
    >
      <span className="sr-only">{overview}</span>
      <div className="project-card__media" aria-hidden>
        {shouldUseVideo ? (
          <video
            src={image}
            poster={staticImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={image} alt="" loading="lazy" />
        )}

        <div className="project-card__overlay">
          <p className="project-card__category">{category}</p>
          <h3 className="project-card__title" data-project-card-title>
            {title}
          </h3>
          {roles?.length ? (
            <p className="project-card__roles">{roles.join(', ')}</p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard

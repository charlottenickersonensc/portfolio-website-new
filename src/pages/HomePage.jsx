import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'

const heroPhotos = ['/media/name-photos/1.png']

function HomePage() {
  const spotlightProjects = projects.slice(0, 6)

  return (
    <section className="home" aria-label="Featured work">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Charlotte Anne Nickerson</p>
          <h1 className="home-hero__title">
            Building tactile futures across AI, robotics, and playful computation
          </h1>
          <p className="home-hero__subtitle">
            I architect weird, ambitious systems: biomimetic Mars rovers, AR interfaces,
            soft robots, and full-stack products for emerging companies. This repo
            mirrors xrarchitect.xyz so every interaction is editable source instead of a
            minified bundle.
          </p>

          <div className="home-hero__cta">
            <a className="button" href="#projects">
              Explore work
            </a>
            <a className="button" href="/media/Ian-Curtis-Resume.pdf" target="_blank" rel="noreferrer">
              Download CV
            </a>
          </div>

        </div>

        <div className="home-hero__photos" aria-hidden>
          {heroPhotos.map((src, index) => (
            <img key={src} src={src} alt="Charlotte Anne Nickerson" data-index={index} />
          ))}
        </div>
      </div>

      <div className="home-projects" id="projects">
        <div className="section-header">
          <p className="home-hero__eyebrow">Selected work</p>
        </div>

        <div className="project-grid">
          {spotlightProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePage

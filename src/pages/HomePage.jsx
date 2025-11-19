import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'

const heroPhotos = ['/media/name-photos/1.png']

function HomePage() {
  const spotlightProjects = projects.slice(0, 6)
  const archiveProjects = projects.slice(6)

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
          <h2>Systems engineered with equal parts rigor and play</h2>
          <p>
            These are the projects people ask about most often during portfolio walks —
            spanning robotics, AI, research, education, and delightful tools for thought.
          </p>
        </div>

        <div className="project-grid">
          {spotlightProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      <div className="home-projects" aria-label="Project archive">
        <div className="section-header">
          <p className="home-hero__eyebrow">Archive</p>
          <h2>Everything else still on rotation</h2>
          <p>
            The remaining experiments from xrarchitect.xyz stay available for quick
            reference while we wire up dedicated detail pages.
          </p>
        </div>

        <div className="project-grid">
          {archiveProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePage

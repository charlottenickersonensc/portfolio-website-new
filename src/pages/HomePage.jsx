import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'

function HomePage() {
  const spotlightProjects = projects.slice(0, 6)

  return (
    <section className="home" aria-label="Featured work">
      <div className="home-projects" id="projects">
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

import { Link } from 'react-router-dom'

const heroPhotos = ['/media/name-photos/1.png']

function AboutPage() {
  return (
    <section className="home" aria-label="About Charlotte Anne Nickerson">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Charlotte Anne Nickerson</p>
          <h1 className="home-hero__title">
            Building tactile futures across AI, robotics, and playful computation
          </h1>
          <p className="home-hero__subtitle">
            I architect weird, ambitious systems: biomimetic Mars rovers, AR interfaces, soft robots,
            and full-stack products for emerging companies. This repo mirrors xrarchitect.xyz so every
            interaction is editable source instead of a minified bundle.
          </p>

          <div className="home-hero__cta">
            <a className="button" href="/#projects">
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

      <div className="home-projects">
        <div className="section-header">
          <p className="home-hero__eyebrow">Still curious?</p>
          <p>
            Peek around the publications tab for deep dives, or drop a note if you want to jam on
            robotics, embodied interfaces, or playful research collaborations.
          </p>
          <Link className="button" to="/play">
            Browse publications
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutPage

import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="home">
      <div className="section-header">
        <p className="home-hero__eyebrow">404</p>
        <h1>We can&apos;t find that page yet</h1>
        <p>
          The rebuilt site currently ships with the home experience. Use the link below
          to jump back to the main showcase.
        </p>
        <div>
          <Link className="button" to="/">
            Back to Projects
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage

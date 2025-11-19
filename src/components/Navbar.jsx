import { useCallback, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Github, Linkedin, Sun, Moon, Twitter } from 'lucide-react'

const portraits = ['/media/name-photos/1.png', '/media/name-photos/2.png']
const socialLinks = [
  { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/charlottenickersonensc' },
  { icon: Linkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/ian-curtis-138492102' },
  { icon: Github, label: 'GitHub', url: 'https://github.com/icurtis1' },
]

function Navbar({ theme = 'light', onToggleTheme = () => {} }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const navigate = useNavigate()

  const handleCyclePortrait = useCallback(() => {
    setPhotoIndex((prev) => (prev + 1) % portraits.length)
    navigate('/', { replace: false })
  }, [navigate])

  const linkClass = ({ isActive }) =>
    isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'

  return (
    <div className="site-header__inner">
      <button type="button" className="site-header__brand" onClick={handleCyclePortrait}>
        <span className="site-header__avatar" aria-hidden>
          <img src={portraits[photoIndex]} alt="Charlotte Anne Nickerson" />
        </span>
        <span>
          Charlotte Anne
          <br /> Nickerson
        </span>
      </button>

      <div className="site-header__nav-cluster">
        <nav aria-label="Site">
          <ul className="site-nav__list">
            <li>
              <NavLink to="/" className={linkClass}>
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/play" className={linkClass}>
                Play
              </NavLink>
            </li>
            <li>
              <a className="site-nav__link" href="/media/Ian-Curtis-Resume.pdf" target="_blank" rel="noreferrer">
                About
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <div className="site-header__social" aria-label="Social links">
            {socialLinks.map(({ icon: Icon, label, url }) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon size={20} strokeWidth={1.9} />
              </a>
            ))}
          </div>
          <button type="button" className="site-header__theme" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar

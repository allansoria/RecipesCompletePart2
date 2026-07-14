import { Link } from 'react-router-dom'
import { CATEGORIES } from '../api'

export default function Sidebar({ onCategoryClick }) {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__brand">
        <span className="sidebar__brand-icon">🗂️</span>
        <span className="sidebar__brand-text">The Recipe Box</span>
      </Link>

      <nav className="sidebar__nav">
        <span className="sidebar__nav-heading">Categories</span>
        {CATEGORIES.map((cat) => (
          <a
            key={cat.key}
            href={`#cat-${cat.key}`}
            className="sidebar__link"
            onClick={(e) => onCategoryClick(e, cat.key)}
          >
            <span className="sidebar__link-icon">{cat.icon}</span>
            {cat.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

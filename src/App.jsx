import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './views/Dashboard'
import RecipeDetail from './views/RecipeDetail'
import './App.css'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Manually match the detail route instead of using <Routes>/<Route>, so
  // Dashboard never unmounts when navigating to/from a recipe - its state
  // (loaded categories, active search, filters) just stays in memory.
  const detailMatch = matchPath('/recipe/:id', location.pathname)

  function handleCategoryClick(e, key) {
    e.preventDefault()
    navigate('/')
    // Dashboard is always mounted (just hidden), so its category sections
    // already exist in the DOM - no need to wait for anything to render.
    requestAnimationFrame(() => {
      document.getElementById(`cat-${key}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <div className="layout">
      <Sidebar onCategoryClick={handleCategoryClick} />

      <div className="layout__main">
        <div style={{ display: detailMatch ? 'none' : 'block' }}>
          <Dashboard />
        </div>
        {detailMatch && <RecipeDetail id={detailMatch.params.id} />}
      </div>
    </div>
  )
}

export default App
import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, EMPTY_FILTERS, fetchRecipes } from '../api'
import StatsBoard from '../components/StatsBoard'
import DashboardView from './DashboardView'
import SearchResultsView from './SearchResultsView'

const SEARCH_DEBOUNCE_MS = 500

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null) // null = no active search
  const [searchStatus, setSearchStatus] = useState('idle')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [quickFilter, setQuickFilter] = useState('')

  const [categoryData, setCategoryData] = useState({}) // { [mealType]: recipes[] }
  const [loadingCategories, setLoadingCategories] = useState(true)

  const pendingSearch = useRef(null)

  // Load the dashboard once on mount: a small worker pool fetches a few
  // categories at a time (gentler on the API's rate limit than firing all
  // 11 at once), and each row renders as soon as its own data lands.
  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoadingCategories(true)
      const CONCURRENCY = 3
      const queue = [...CATEGORIES]

      async function worker() {
        while (queue.length > 0) {
          const cat = queue.shift()
          if (!cat || cancelled) return
          try {
            const recipes = await fetchRecipes({ meal_type: cat.key, per_page: 8 })
            if (cancelled) return
            setCategoryData((prev) => ({ ...prev, [cat.key]: recipes }))
          } catch (err) {
            console.error(`Failed to load ${cat.key}`, err)
            if (!cancelled) setCategoryData((prev) => ({ ...prev, [cat.key]: [] }))
          }
        }
      }

      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
      if (!cancelled) setLoadingCategories(false)
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  async function runSearch(term) {
    setSearchStatus('loading')
    setFilters(EMPTY_FILTERS)
    try {
      const recipes = await fetchRecipes({ search: term, per_page: 10 })
      setSearchResults(recipes)
      setSearchStatus('done')
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
    }
  }

  // Debounced live search: fires automatically ~500ms after the user stops
  // typing, so the list updates without requiring a manual submit. The API
  // has a fairly tight rate limit, so we debounce rather than searching on
  // every keystroke directly.
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
      setSearchStatus('idle')
      return
    }

    const timeout = setTimeout(() => runSearch(query.trim()), SEARCH_DEBOUNCE_MS)
    pendingSearch.current = timeout
    return () => clearTimeout(timeout)
  }, [query])

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    clearTimeout(pendingSearch.current)
    runSearch(query.trim())
  }

  function clearSearch() {
    clearTimeout(pendingSearch.current)
    setQuery('')
    setSearchResults(null)
    setSearchStatus('idle')
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div className="App">
      <div className="corkboard">
        <header className="header">
          <h1 className="header__title">The Recipe Box</h1>
          <p className="header__subtitle">pin a search, pull up the card</p>
        </header>

        {searchResults === null && !loadingCategories && (
          <StatsBoard recipes={Object.values(categoryData).flat()} />
        )}

        {!loadingCategories && (
          <form className="search" onSubmit={handleSubmit}>
            <input
              className="search__input"
              type="text"
              placeholder="pasta, tacos, banana bread..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search__button" type="submit">
              Find recipes
            </button>
            {searchResults !== null && (
              <button type="button" className="search__clear" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>
        )}

        {searchResults !== null ? (
          <SearchResultsView
            searchResults={searchResults}
            searchStatus={searchStatus}
            filters={filters}
            onFiltersChange={setFilters}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
          />
        ) : (
          <DashboardView
            categoryData={categoryData}
            loadingCategories={loadingCategories}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
          />
        )}
      </div>
    </div>
  )
}

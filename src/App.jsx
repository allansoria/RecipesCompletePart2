import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = 'https://recipeapi.io/api/v1/recipes'
const API_KEY = import.meta.env.VITE_RECIPEAPI_KEY

// meal_type enum values from the API, with a friendly label + tab icon
const CATEGORIES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { key: 'brunch', label: 'Brunch', icon: '🍳' },
  { key: 'starter', label: 'Starters', icon: '🥗' },
  { key: 'appetizer', label: 'Appetizers', icon: '🍤' },
  { key: 'soup', label: 'Soups', icon: '🍲' },
  { key: 'main', label: 'Mains', icon: '🍝' },
  { key: 'side_dish', label: 'Side Dishes', icon: '🥔' },
  { key: 'dessert', label: 'Desserts', icon: '🍰' },
  { key: 'snack', label: 'Snacks', icon: '🍿' },
  { key: 'drink', label: 'Drinks', icon: '🥤' },
  { key: 'sauce', label: 'Sauces', icon: '🥣' },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchRecipes(params, retries = 3) {
  const url = new URL(API_BASE)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value)
  })

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })

  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After'))
    const wait = Number.isFinite(retryAfter) ? retryAfter * 1000 : 800
    await sleep(wait)
    return fetchRecipes(params, retries - 1)
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.message ?? body.error ?? JSON.stringify(body)
    } catch {
      detail = await res.text()
    }
    throw new Error(`Request failed: ${res.status} ${detail}`)
  }

  const json = await res.json()
  return json.data ?? []
}

function RecipeCard({ recipe, rotation }) {
  const time = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <article className="card" style={{ '--tilt': `${rotation}deg` }}>
      <span className="card__tape" aria-hidden="true"></span>
      <h3 className="card__title">{recipe.name}</h3>

      <div className="card__meta">
        {recipe.cuisine && <span className="card__tag">{recipe.cuisine}</span>}
        {time > 0 && <span className="card__tag card__tag--time">{time} min</span>}
        {recipe.calories_per_serving && (
          <span className="card__tag card__tag--cal">
            {recipe.calories_per_serving} cal
          </span>
        )}
      </div>

      {recipe.dietary_tags?.length > 0 && (
        <div className="card__diet">
          {recipe.dietary_tags.map((tag) => (
            <span key={tag} className="card__diet-tag">
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {recipe.ingredients?.length > 0 && (
        <ul className="card__ingredients">
          {recipe.ingredients.slice(0, 4).map((ing, i) => (
            <li key={ing.id ?? i}>
              {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
            </li>
          ))}
          {recipe.ingredients.length > 4 && (
            <li className="card__more">+ {recipe.ingredients.length - 4} more</li>
          )}
        </ul>
      )}
    </article>
  )
}

function CategoryRow({ category, recipes, loading }) {
  return (
    <section className="row">
      <div className="row__tab">
        <span className="row__icon">{category.icon}</span>
        <h2 className="row__label">{category.label}</h2>
      </div>

      {loading && <p className="status">Pulling recipes for this drawer...</p>}

      {!loading && recipes.length === 0 && (
        <p className="status">Nothing filed here yet.</p>
      )}

      {!loading && recipes.length > 0 && (
        <div className="row__scroll">
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              rotation={(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function StatsBoard({ recipes }) {
  if (recipes.length === 0) return null

  const totalRecipes = recipes.length

  const avgCalories = Math.round(
    recipes.reduce((sum, r) => sum + (r.calories_per_serving ?? 0), 0) /
      totalRecipes
  )

  const avgTime = Math.round(
    recipes.reduce(
      (sum, r) => sum + (r.prep_time ?? 0) + (r.cook_time ?? 0),
      0
    ) / totalRecipes
  )

  const cuisineCounts = recipes.reduce((counts, r) => {
    if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] ?? 0) + 1
    return counts
  }, {})
  const topCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]

  const stats = [
    { label: 'Recipes on the board', value: totalRecipes },
    { label: 'Avg. calories / serving', value: avgCalories },
    { label: 'Avg. total time', value: `${avgTime} min` },
    { label: 'Top cuisine', value: topCuisine ? topCuisine[0] : '—' },
  ]

  return (
    <div className="stats">
      {stats.map((stat) => (
        <div key={stat.label} className="stats__card">
          <span className="stats__value">{stat.value}</span>
          <span className="stats__label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

function FilterBar({ recipes, filters, onChange }) {
  const uniqueValues = (getValue) =>
    [...new Set(recipes.map(getValue).filter(Boolean))].sort()

  const cuisines = uniqueValues((r) => r.cuisine)
  const difficulties = uniqueValues((r) => r.difficulty)
  const mealTypes = uniqueValues((r) => r.meal_type)
  const dietaryTags = uniqueValues((r) => r.dietary_tags ?? []).length
    ? [...new Set(recipes.flatMap((r) => r.dietary_tags ?? []))].sort()
    : []

  return (
    <div className="filters">
      <select
        className="filters__select"
        value={filters.cuisine}
        onChange={(e) => onChange({ ...filters, cuisine: e.target.value })}
      >
        <option value="">All cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="filters__select"
        value={filters.difficulty}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value })}
      >
        <option value="">All difficulties</option>
        {difficulties.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        className="filters__select"
        value={filters.mealType}
        onChange={(e) => onChange({ ...filters, mealType: e.target.value })}
      >
        <option value="">All meal types</option>
        {mealTypes.map((m) => (
          <option key={m} value={m}>
            {m.replace('_', ' ')}
          </option>
        ))}
      </select>

      <select
        className="filters__select"
        value={filters.dietaryTag}
        onChange={(e) => onChange({ ...filters, dietaryTag: e.target.value })}
      >
        <option value="">All diets</option>
        {dietaryTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag.replace('_', ' ')}
          </option>
        ))}
      </select>

      {(filters.cuisine || filters.difficulty || filters.mealType || filters.dietaryTag) && (
        <button
          type="button"
          className="filters__reset"
          onClick={() =>
            onChange({ cuisine: '', difficulty: '', mealType: '', dietaryTag: '' })
          }
        >
          Reset filters
        </button>
      )}
    </div>
  )
}

function QuickFilterControl({ value, onChange }) {
  return (
    <div className="quickfilter">
      <input
        className="quickfilter__input"
        type="text"
        placeholder="Quick filter these results..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="filters__reset"
          onClick={() => onChange('')}
        >
          Clear
        </button>
      )}
    </div>
  )
}

const EMPTY_FILTERS = { cuisine: '', difficulty: '', mealType: '', dietaryTag: '' }

function App() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null) // null = no active search
  const [searchStatus, setSearchStatus] = useState('idle')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [quickFilter, setQuickFilter] = useState('')

  const [categoryData, setCategoryData] = useState({}) // { [mealType]: recipes[] }
  const [loadingCategories, setLoadingCategories] = useState(true)

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
            // render this row as soon as its data is in, don't wait on the rest
            setCategoryData((prev) => ({ ...prev, [cat.key]: recipes }))
          } catch (err) {
            console.error(`Failed to load ${cat.key}`, err)
            if (!cancelled) {
              setCategoryData((prev) => ({ ...prev, [cat.key]: [] }))
            }
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

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    setSearchStatus('loading')
    setFilters(EMPTY_FILTERS)
    try {
      const recipes = await fetchRecipes({ search: query.trim(), per_page: 10 })
      setSearchResults(recipes)
      setSearchStatus('done')
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
    }
  }

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
    setSearchStatus('idle')
    setFilters(EMPTY_FILTERS)
  }

  const filteredCategoryData = quickFilter.trim()
    ? Object.fromEntries(
        Object.entries(categoryData).map(([key, recipes]) => [
          key,
          recipes.filter((r) =>
            r.name?.toLowerCase().includes(quickFilter.trim().toLowerCase())
          ),
        ])
      )
    : categoryData

  const filteredResults =
    searchResults
      ?.filter(
        (r) =>
          (!filters.cuisine || r.cuisine === filters.cuisine) &&
          (!filters.difficulty || r.difficulty === filters.difficulty) &&
          (!filters.mealType || r.meal_type === filters.mealType) &&
          (!filters.dietaryTag || r.dietary_tags?.includes(filters.dietaryTag))
      )
      .filter((r) =>
        quickFilter.trim()
          ? r.name?.toLowerCase().includes(quickFilter.trim().toLowerCase())
          : true
      ) ?? null

  return (
    <div className="App">
      <div className="corkboard">
        <header className="header">
          <h1 className="header__title">The Recipe Box</h1>
          <p className="header__subtitle">pin a search, pull up the card</p>
        </header>

        {searchResults === null && !loadingCategories && (
          <StatsBoard recipes={Object.values(filteredCategoryData).flat()} />
        )}
        {searchStatus === 'done' && filteredResults?.length > 0 && (
          <StatsBoard recipes={filteredResults} />
        )}

        {!loadingCategories && (
          <form className="search" onSubmit={handleSearch}>
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
              <button
                type="button"
                className="search__clear"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </form>
        )}

        {searchResults !== null ? (
          <section className="row">
            <div className="row__tab row__tab--split">
              <div className="row__tab-label">
                <span className="row__icon">🔍</span>
                <h2 className="row__label">Search Results</h2>
              </div>
              {searchStatus === 'done' && searchResults.length > 0 && (
                <QuickFilterControl value={quickFilter} onChange={setQuickFilter} />
              )}
            </div>

            {searchStatus === 'done' && searchResults.length > 0 && (
              <FilterBar
                recipes={searchResults}
                filters={filters}
                onChange={setFilters}
              />
            )}

            {searchStatus === 'loading' && (
              <p className="status">Flipping through the box...</p>
            )}
            {searchStatus === 'error' && (
              <p className="status status--error">
                Couldn't reach the recipe box. Check your API key and try again.
              </p>
            )}
            {searchStatus === 'done' && searchResults.length === 0 && (
              <p className="status">No recipes filed under that name yet.</p>
            )}
            {searchStatus === 'done' &&
              searchResults.length > 0 &&
              filteredResults.length === 0 && (
                <p className="status">No recipes match these filters.</p>
              )}
            {searchStatus === 'done' && filteredResults.length > 0 && (
              <div className="row__scroll">
                {filteredResults.map((recipe, i) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    rotation={(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          (() => {
            const hasAnyDashboardData = Object.values(categoryData).flat().length > 0
            const visibleCategories = CATEGORIES.filter(
              (cat) => (filteredCategoryData[cat.key] ?? []).length > 0
            )
            return (
              <>
                {hasAnyDashboardData && (
                  <div className="row__tab row__tab--split row__tab--plain">
                    <div className="row__tab-label">
                      <span className="row__icon">📋</span>
                      <h2 className="row__label">Recipe Box</h2>
                    </div>
                    <QuickFilterControl value={quickFilter} onChange={setQuickFilter} />
                  </div>
                )}
                {!hasAnyDashboardData && loadingCategories && (
                  <p className="status">Pulling recipes for the box...</p>
                )}
                {visibleCategories.length === 0 && (hasAnyDashboardData || !loadingCategories) && (
                  <p className="status">
                    Nothing on the board matches "{quickFilter}".
                  </p>
                )}
                {visibleCategories.map((cat) => (
                  <CategoryRow
                    key={cat.key}
                    category={cat}
                    recipes={filteredCategoryData[cat.key]}
                    loading={false}
                  />
                ))}
                {loadingCategories && hasAnyDashboardData && (
                  <p className="status status--loading-more">Still filling the box...</p>
                )}
              </>
            )
          })()
        )}
      </div>
    </div>
  )
}

export default App
import { RecipeRow } from '../components/RecipeRow'
import StatsBoard from '../components/StatsBoard'
import FilterBar from '../components/FilterBar'
import QuickFilterControl from '../components/QuickFilterControl'

export default function SearchResultsView({
  searchResults,
  searchStatus,
  filters,
  onFiltersChange,
  quickFilter,
  onQuickFilterChange,
}) {
  const filteredResults = searchResults
    .filter(
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
    )

  return (
    <section className="row">
      <div className="row__tab row__tab--split">
        <div className="row__tab-label">
          <span className="row__icon">🔍</span>
          <h2 className="row__label">Search Results</h2>
        </div>
        {searchStatus === 'done' && searchResults.length > 0 && (
          <QuickFilterControl value={quickFilter} onChange={onQuickFilterChange} />
        )}
      </div>

      {searchStatus === 'done' && searchResults.length > 0 && (
        <FilterBar recipes={searchResults} filters={filters} onChange={onFiltersChange} />
      )}

      {searchStatus === 'loading' && <p className="status">Flipping through the box...</p>}
      {searchStatus === 'error' && (
        <p className="status status--error">
          Couldn't reach the recipe box. Check your API key and try again.
        </p>
      )}
      {searchStatus === 'done' && searchResults.length === 0 && (
        <p className="status">No recipes filed under that name yet.</p>
      )}
      {searchStatus === 'done' && searchResults.length > 0 && filteredResults.length === 0 && (
        <p className="status">No recipes match these filters.</p>
      )}
      {searchStatus === 'done' && filteredResults.length > 0 && (
        <>
          <StatsBoard recipes={filteredResults} />
          <RecipeRow recipes={filteredResults} />
        </>
      )}
    </section>
  )
}

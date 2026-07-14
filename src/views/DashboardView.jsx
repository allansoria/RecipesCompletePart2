import { CATEGORIES } from '../api'
import { CategoryRow } from '../components/RecipeRow'
import QuickFilterControl from '../components/QuickFilterControl'
import DashboardCharts from '../components/DashboardCharts'

export default function DashboardView({
  categoryData,
  loadingCategories,
  quickFilter,
  onQuickFilterChange,
}) {
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

  const hasAnyDashboardData = Object.values(categoryData).flat().length > 0
  const visibleCategories = CATEGORIES.filter(
    (cat) => (filteredCategoryData[cat.key] ?? []).length > 0
  )

  return (
    <>
      {hasAnyDashboardData && !quickFilter.trim() && (
        <DashboardCharts categoryData={categoryData} />
      )}

      {hasAnyDashboardData && (
        <div className="row__tab row__tab--split row__tab--plain">
          <div className="row__tab-label">
            <span className="row__icon">📋</span>
            <h2 className="row__label">Recipe Box</h2>
          </div>
          <QuickFilterControl value={quickFilter} onChange={onQuickFilterChange} />
        </div>
      )}

      {!hasAnyDashboardData && loadingCategories && (
        <p className="status">Pulling recipes for the box...</p>
      )}
      {visibleCategories.length === 0 && (hasAnyDashboardData || !loadingCategories) && (
        <p className="status">Nothing on the board matches "{quickFilter}".</p>
      )}
      {visibleCategories.map((cat) => (
        <CategoryRow key={cat.key} category={cat} recipes={filteredCategoryData[cat.key]} />
      ))}
      {loadingCategories && hasAnyDashboardData && (
        <p className="status status--loading-more">Still filling the box...</p>
      )}
    </>
  )
}

import { EMPTY_FILTERS } from '../api'

export default function FilterBar({ recipes, filters, onChange }) {
  const uniqueValues = (getValue) =>
    [...new Set(recipes.map(getValue).filter(Boolean))].sort()

  const cuisines = uniqueValues((r) => r.cuisine)
  const difficulties = uniqueValues((r) => r.difficulty)
  const mealTypes = uniqueValues((r) => r.meal_type)
  const dietaryTags = [...new Set(recipes.flatMap((r) => r.dietary_tags ?? []))].sort()

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
        <button type="button" className="filters__reset" onClick={() => onChange(EMPTY_FILTERS)}>
          Reset filters
        </button>
      )}
    </div>
  )
}

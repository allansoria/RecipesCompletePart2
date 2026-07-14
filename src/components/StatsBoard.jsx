export default function StatsBoard({ recipes }) {
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

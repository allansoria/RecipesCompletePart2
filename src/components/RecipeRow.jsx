import RecipeCard from './RecipeCard'

export function RecipeRow({ recipes }) {
  return (
    <div className="row__scroll">
      {recipes.map((recipe, i) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          rotation={(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}
        />
      ))}
    </div>
  )
}

export function CategoryRow({ category, recipes }) {
  return (
    <section className="row" id={`cat-${category.key}`}>
      <div className="row__tab">
        <span className="row__icon">{category.icon}</span>
        <h2 className="row__label">{category.label}</h2>
      </div>
      {recipes.length === 0 ? (
        <p className="status">Nothing filed here yet.</p>
      ) : (
        <RecipeRow recipes={recipes} />
      )}
    </section>
  )
}
import { Link } from 'react-router-dom'

export default function RecipeCard({ recipe, rotation }) {
  const time = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      state={{ recipe }}
      className="card"
      style={{ '--tilt': `${rotation}deg` }}
    >
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
    </Link>
  )
}

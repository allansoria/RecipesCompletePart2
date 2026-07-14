import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { fetchRecipeById } from '../api'

export default function RecipeDetail({ id }) {
  const location = useLocation()
  const passedRecipe = location.state?.recipe

  const [recipe, setRecipe] = useState(passedRecipe ?? null)
  const [status, setStatus] = useState(passedRecipe ? 'done' : 'loading')

  useEffect(() => {
    // The dashboard stays mounted and scrolled wherever it was, so without
    // this the detail view would just silently inherit that scroll position.
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    // If we already have the recipe (handed off from the card's click),
    // skip the network call entirely.
    if (passedRecipe) {
      setRecipe(passedRecipe)
      setStatus('done')
      return
    }

    let cancelled = false
    setStatus('loading')

    fetchRecipeById(id)
      .then((data) => {
        if (!cancelled) {
          setRecipe(data)
          setStatus('done')
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [id, passedRecipe])

  if (status === 'loading') {
    return (
      <div className="App">
        <div className="corkboard corkboard--narrow">
          <p className="status">Pulling that card out of the box...</p>
        </div>
      </div>
    )
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="App">
        <div className="corkboard corkboard--narrow">
          <p className="status status--error">
            Couldn't find that recipe directly — this can happen on a refreshed or
            shared link if the API doesn't support looking recipes up by id.
          </p>
          <Link to="/" className="search__clear detail__back">
            ← Back to the board
          </Link>
        </div>
      </div>
    )
  }

  const time = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <div className="App">
      <div className="corkboard corkboard--narrow">
        <Link to="/" className="search__clear detail__back">
          ← Back to the board
        </Link>

        <article className="detail-card">
          <span className="card__tape" aria-hidden="true"></span>
          <h1 className="detail-card__title">{recipe.name}</h1>

          {recipe.description && (
            <p className="detail-card__description">{recipe.description}</p>
          )}

          <div className="card__meta detail-card__meta">
            {recipe.cuisine && <span className="card__tag">{recipe.cuisine}</span>}
            {recipe.difficulty && (
              <span className="card__tag">{recipe.difficulty}</span>
            )}
            {recipe.meal_type && (
              <span className="card__tag">{recipe.meal_type.replace('_', ' ')}</span>
            )}
            {time > 0 && <span className="card__tag card__tag--time">{time} min total</span>}
            {recipe.calories_per_serving && (
              <span className="card__tag card__tag--cal">
                {recipe.calories_per_serving} cal / serving
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

          <div className="detail-card__stats">
            {recipe.servings && (
              <div className="detail-stat">
                <span className="detail-stat__value">{recipe.servings}</span>
                <span className="detail-stat__label">servings</span>
              </div>
            )}
            {recipe.prep_time != null && (
              <div className="detail-stat">
                <span className="detail-stat__value">{recipe.prep_time}m</span>
                <span className="detail-stat__label">prep</span>
              </div>
            )}
            {recipe.cook_time != null && (
              <div className="detail-stat">
                <span className="detail-stat__value">{recipe.cook_time}m</span>
                <span className="detail-stat__label">cook</span>
              </div>
            )}
            {recipe.protein != null && (
              <div className="detail-stat">
                <span className="detail-stat__value">{recipe.protein}g</span>
                <span className="detail-stat__label">protein</span>
              </div>
            )}
          </div>

          {recipe.ingredients?.length > 0 && (
            <section className="detail-section">
              <h2 className="detail-section__title">Ingredients</h2>
              <ul className="detail-ingredients">
                {recipe.ingredients.map((ing, i) => (
                  <li key={ing.id ?? i}>
                    {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                    {ing.optional && <em> (optional)</em>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipe.instructions?.length > 0 && (
            <section className="detail-section">
              <h2 className="detail-section__title">Instructions</h2>
              <ol className="detail-instructions">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{typeof step === 'string' ? step : step.text ?? JSON.stringify(step)}</li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </div>
    </div>
  )
}
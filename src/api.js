export const API_BASE = 'https://recipeapi.io/api/v1/recipes'
export const API_KEY = import.meta.env.VITE_RECIPEAPI_KEY

// meal_type enum values from the API, with a friendly label + tab icon
export const CATEGORIES = [
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

export const EMPTY_FILTERS = { cuisine: '', difficulty: '', mealType: '', dietaryTag: '' }

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Fetch a list of recipes matching query params (search, meal_type, per_page...).
// Retries once-a-429 with backoff, respecting Retry-After when the API sends one.
export async function fetchRecipes(params, retries = 3) {
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

// Fetch a single recipe by id. Used as a fallback on the detail page when a
// recipe wasn't handed off via router state (e.g. a direct link or refresh).
// recipeapi.io's docs don't explicitly confirm a GET /recipes/:id route, so
// this is a best-effort REST convention guess - if it 404s, the detail page
// falls back to a "go back and click through" message instead of crashing.
export async function fetchRecipeById(id, retries = 3) {
  const url = `${API_BASE}/${id}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })

  if (res.status === 429 && retries > 0) {
    await sleep(800)
    return fetchRecipeById(id, retries - 1)
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }

  const json = await res.json()
  return json.data ?? json
}

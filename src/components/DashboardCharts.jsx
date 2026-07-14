import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { CATEGORIES } from '../api'

const PIE_COLORS = ['#d4a017', '#b5533c', '#6d7a5a', '#8a6d3b', '#a3765a', '#5f7a6e', '#c98a3f']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <strong>{label ?? payload[0].name}</strong>
      <span>{payload[0].value}</span>
    </div>
  )
}

export default function DashboardCharts({ categoryData }) {
  const allRecipes = Object.values(categoryData).flat()
  if (allRecipes.length === 0) return null

  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat.label,
    count: (categoryData[cat.key] ?? []).length,
  })).filter((c) => c.count > 0)

  const cuisineTally = allRecipes.reduce((counts, r) => {
    if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] ?? 0) + 1
    return counts
  }, {})

  const sortedCuisines = Object.entries(cuisineTally).sort((a, b) => b[1] - a[1])
  const topCuisines = sortedCuisines.slice(0, 6).map(([name, value]) => ({ name, value }))
  const otherTotal = sortedCuisines.slice(6).reduce((sum, [, v]) => sum + v, 0)
  if (otherTotal > 0) topCuisines.push({ name: 'other', value: otherTotal })

  return (
    <div className="charts">
      <div className="chart-card">
        <h3 className="chart-card__title">Recipes per category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryCounts} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#d8dccb', fontSize: 11 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={55}
            />
            <YAxis tick={{ fill: '#d8dccb', fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(212,160,23,0.1)' }} />
            <Bar dataKey="count" fill="#d4a017" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-card__title">Cuisine breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={topCuisines}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={75}
              label={({ name }) => name}
              labelLine={false}
            >
              {topCuisines.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.7rem', color: '#d8dccb' }}
              formatter={(value) => <span style={{ color: '#d8dccb' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function QuickFilterControl({ value, onChange }) {
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
        <button type="button" className="filters__reset" onClick={() => onChange('')}>
          Clear
        </button>
      )}
    </div>
  )
}

function FilterButtons({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeFilter === filter.value
              ? 'bg-r7-blue text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-r7-blue hover:text-r7-blue hover:bg-blue-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;

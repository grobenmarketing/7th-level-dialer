function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1 min-w-[250px]">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-r7-blue focus:border-transparent transition-all"
      />
    </div>
  );
}

export default SearchBar;

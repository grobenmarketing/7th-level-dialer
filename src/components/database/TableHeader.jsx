function TableHeader({ columns, sortBy, sortDirection, onSort, showCheckbox = false, onCheckAll, allChecked = false }) {
  const getSortIcon = (columnKey) => {
    if (sortBy !== columnKey) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <thead className="bg-gray-100 border-b-2 border-gray-200">
      <tr>
        {showCheckbox && (
          <th className="px-4 py-3 text-left w-12">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={onCheckAll}
              className="w-5 h-5 cursor-pointer accent-r7-blue rounded focus:ring-2 focus:ring-r7-blue"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
              column.sortable ? 'cursor-pointer select-none hover:bg-gray-200 transition-colors' : ''
            } ${column.className || ''}`}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort && onSort(column.key)}
          >
            <div className="flex items-center gap-1">
              {column.label}
              {column.sortable && (
                <span className={`text-xs ${sortBy === column.key ? 'text-r7-blue font-bold' : 'opacity-50'}`}>
                  {getSortIcon(column.key)}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;

function BulkActions({ selectedCount, onDelete, onExport, onImport, totalCount }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-r7-blue text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-slideUp">
      <span className="font-semibold">
        {selectedCount} of {totalCount} selected
      </span>
      <div className="flex gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2 bg-white text-r7-blue rounded hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            📤 Export Selected
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium text-sm"
          >
            🗑️ Delete Selected
          </button>
        )}
      </div>
    </div>
  );
}

export default BulkActions;

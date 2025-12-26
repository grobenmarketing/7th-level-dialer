function ActionButtons({ onView, onEdit, onDelete, showView = true, showEdit = false, showDelete = true }) {
  return (
    <div className="flex gap-2 justify-end">
      {showView && onView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-r7-blue hover:text-r7-blue transition-colors"
          title="View details"
        >
          👁 View
        </button>
      )}
      {showEdit && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-blue-500 hover:text-blue-600 transition-colors"
          title="Edit"
        >
          ✏️ Edit
        </button>
      )}
      {showDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-red-100 hover:border-red-500 hover:text-red-600 transition-colors"
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ActionButtons;

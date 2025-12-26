function TableWrapper({ children, footer }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
      {footer && (
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

export default TableWrapper;

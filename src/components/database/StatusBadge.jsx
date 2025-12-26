function StatusBadge({ status, type = 'default' }) {
  const getStatusClasses = () => {
    if (type === 'okCode') {
      const okCodeColors = {
        'OK-1': 'bg-blue-500',
        'OK-2': 'bg-purple-500',
        'OK-3': 'bg-pink-500',
        'OK-4': 'bg-orange-500',
        'OK-5': 'bg-green-500',
        'OK-6': 'bg-cyan-500',
        'OK-7': 'bg-teal-500',
        'OK-8': 'bg-indigo-500',
        'OK-9': 'bg-fuchsia-500',
        'OK-10': 'bg-rose-500',
      };

      return `${okCodeColors[status] || 'bg-gray-400'} text-white`;
    }

    const statusMap = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      client: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      skipped: 'bg-gray-100 text-gray-800',
      'do-not-call': 'bg-red-100 text-red-800',
      'closed-won': 'bg-blue-100 text-blue-800',
      'closed-lost': 'bg-gray-100 text-gray-800',
      never_contacted: 'bg-gray-100 text-gray-600',
      paused: 'bg-yellow-100 text-yellow-800',
      dead: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800',
    };

    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!status || status === '-' || status === 'N/A') {
    return (
      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-500">
        —
      </span>
    );
  }

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full uppercase ${getStatusClasses()}`}>
      {status}
    </span>
  );
}

export default StatusBadge;

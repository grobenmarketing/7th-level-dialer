export const OK_CODES = [
  { code: 'OK-01', label: 'Interested - Follow Up', color: 'green' },
  { code: 'OK-02', label: 'Not Interested - Budget', color: 'red' },
  { code: 'OK-03', label: 'Not Interested - No Need', color: 'red' },
  { code: 'OK-04', label: 'Already Using Competitor', color: 'yellow' },
  { code: 'OK-05', label: 'Wrong Contact', color: 'gray' },
  { code: 'OK-06', label: 'Do Not Call', color: 'red' },
  { code: 'OK-07', label: 'Callback Requested', color: 'blue' },
  { code: 'OK-08', label: 'Gatekeeper Block', color: 'yellow' },
  { code: 'OK-09', label: 'Voicemail - Left Message', color: 'blue' },
  { code: 'OK-10', label: 'No Answer - Try Again', color: 'gray' },
  { code: 'OK-11', label: 'Meeting Scheduled', color: 'green' },
  { code: 'OK-12', label: 'Qualified Lead - Hot', color: 'green' }
];

export const CALL_OUTCOMES = [
  { id: 'NA', label: 'No Answer', icon: '📵' },
  { id: 'GK', label: 'Gatekeeper', icon: '🚪' },
  { id: 'DM', label: 'Decision Maker', icon: '👤' }
];

// Utility function to format call duration in seconds to readable time
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const NEPQ_PHASES = [
  { id: 'connection', name: 'Connection', icon: '🤝', order: 1 },
  { id: 'situation', name: 'Situation', icon: '📋', order: 2 },
  { id: 'problem-awareness', name: 'Problem Awareness', icon: '🔍', order: 3 },
  { id: 'solution-awareness', name: 'Solution Awareness', icon: '💡', order: 4 },
  { id: 'consequence', name: 'Consequence', icon: '⚠️', order: 5 },
  { id: 'commitment', name: 'Commitment', icon: '🤝', order: 6 },
  { id: 'presentation', name: 'Presentation', icon: '📊', order: 7 }
];

export const PROBLEM_LEVELS = [
  { level: 1, name: 'Obvious', description: 'Wants/Not Wants', color: 'blue' },
  { level: 2, name: 'Common', description: 'Lack of...', color: 'green' },
  { level: 3, name: 'Specific', description: 'Quantified Impact', color: 'yellow' },
  { level: 4, name: 'Mission Critical', description: 'Cost of Inaction', color: 'red' }
];

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

export const DEAL_STAGES = [
  'prospect',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost'
];

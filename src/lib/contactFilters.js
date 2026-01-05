/**
 * Reusable contact filtering utilities
 * Centralizes common contact filtering logic used across components
 */

/**
 * Get contacts with 'active' status
 */
export const getActiveContacts = (contacts) => {
  return contacts.filter(c => c.status === 'active');
};

/**
 * Get contacts that have never been called (totalDials === 0)
 */
export const getNeverContactedLeads = (contacts) => {
  return contacts.filter(c => c.totalDials === 0);
};

/**
 * Get contacts currently in a sequence (sequence_day > 0)
 */
export const getSequenceContacts = (contacts) => {
  return contacts.filter(c => c.sequence_day > 0 && c.status !== 'client' && c.status !== 'inactive');
};

/**
 * Get contacts with 'client' status
 */
export const getClientContacts = (contacts) => {
  return contacts.filter(c => c.status === 'client');
};

/**
 * Get contacts with 'inactive' (dead) status
 */
export const getInactiveContacts = (contacts) => {
  return contacts.filter(c => c.status === 'inactive');
};

/**
 * Filter contacts by OK code
 */
export const filterByOkCode = (contacts, okCode) => {
  if (!okCode || okCode === 'all') return contacts;
  return contacts.filter(c => c.currentOkCode === okCode);
};

/**
 * Filter contacts by status
 */
export const filterByStatus = (contacts, status) => {
  if (!status || status === 'all') return contacts;
  return contacts.filter(c => c.status === status);
};

/**
 * Search contacts by text across multiple fields
 */
export const searchContacts = (contacts, searchTerm) => {
  if (!searchTerm) return contacts;

  const search = searchTerm.toLowerCase();
  return contacts.filter(c =>
    c.companyName?.toLowerCase().includes(search) ||
    c.phone?.includes(search) ||
    c.industry?.toLowerCase().includes(search) ||
    c.website?.toLowerCase().includes(search) ||
    c.address?.toLowerCase().includes(search) ||
    c.linkedin?.toLowerCase().includes(search)
  );
};

/**
 * Sort contacts by a given key and direction
 */
export const sortContacts = (contacts, sortKey, direction = 'asc') => {
  return [...contacts].sort((a, b) => {
    let aVal, bVal;

    switch (sortKey) {
      case 'companyName':
        aVal = a.companyName || '';
        bVal = b.companyName || '';
        break;
      case 'phone':
        aVal = a.phone || '';
        bVal = b.phone || '';
        break;
      case 'totalDials':
        aVal = a.totalDials || 0;
        bVal = b.totalDials || 0;
        break;
      case 'lastCall':
        aVal = new Date(a.lastCall || 0).getTime();
        bVal = new Date(b.lastCall || 0).getTime();
        break;
      case 'status':
        aVal = a.status || '';
        bVal = b.status || '';
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
};

/**
 * Get contacts that need email follow-up
 */
export const getEmailNeededContacts = (contacts) => {
  return contacts.filter(c =>
    c.callHistory?.some(call => call.needsEmail) &&
    c.status !== 'client' &&
    c.status !== 'inactive'
  );
};

/**
 * Get contacts that need callback
 */
export const getCallbackContacts = (contacts) => {
  return contacts.filter(c => {
    const okCode = c.currentOkCode?.toLowerCase() || '';
    return (
      (okCode.includes('call back') || okCode.includes('callback') || okCode.includes('follow up')) &&
      c.status !== 'client' &&
      c.status !== 'inactive'
    );
  });
};

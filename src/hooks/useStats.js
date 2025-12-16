import { useContacts } from './useContacts';
import { useAvatars } from './useAvatars';

export function useStats() {
  const { contacts } = useContacts();
  const { avatars } = useAvatars();

  // Get all call history records across all contacts
  const getAllCallRecords = () => {
    return contacts.flatMap(contact =>
      (contact.callHistory || []).map(call => ({
        ...call,
        contactId: contact.id,
        contact: contact
      }))
    );
  };

  // Basic Activity Stats
  const getActivityStats = () => {
    const activeContacts = contacts.filter(c => c.status === 'active');
    const totalDials = contacts.reduce((sum, c) => sum + (c.totalDials || 0), 0);
    const allCalls = getAllCallRecords();

    const dmCalls = allCalls.filter(call => call.outcome === 'DM');
    const gkCalls = allCalls.filter(call => call.outcome === 'GK');
    const naCalls = allCalls.filter(call => call.outcome === 'NA');

    const meetingsBooked = contacts.filter(c =>
      c.currentOkCode === 'OK-08'
    ).length;

    const contactRate = totalDials > 0 ? ((dmCalls.length / totalDials) * 100).toFixed(1) : 0;
    const meetingRate = dmCalls.length > 0 ? ((meetingsBooked / dmCalls.length) * 100).toFixed(1) : 0;

    // Calculate duration stats
    const totalDuration = allCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = allCalls.length > 0 ? Math.round(totalDuration / allCalls.length) : 0;

    const dmDuration = dmCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDmDuration = dmCalls.length > 0 ? Math.round(dmDuration / dmCalls.length) : 0;

    const gkDuration = gkCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgGkDuration = gkCalls.length > 0 ? Math.round(gkDuration / gkCalls.length) : 0;

    const naDuration = naCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgNaDuration = naCalls.length > 0 ? Math.round(naDuration / naCalls.length) : 0;

    return {
      totalContacts: contacts.length,
      activeContacts: activeContacts.length,
      totalDials,
      totalCalls: allCalls.length,
      dmCalls: dmCalls.length,
      gkCalls: gkCalls.length,
      naCalls: naCalls.length,
      meetingsBooked,
      contactRate: parseFloat(contactRate),
      meetingRate: parseFloat(meetingRate),
      // Duration stats
      totalDuration,
      avgDuration,
      avgDmDuration,
      avgGkDuration,
      avgNaDuration
    };
  };

  // Time-based Activity Trends
  const getActivityTrends = (days = 30) => {
    const allCalls = getAllCallRecords();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentCalls = allCalls.filter(call => new Date(call.date) >= cutoffDate);

    // Group by date
    const callsByDate = {};
    recentCalls.forEach(call => {
      const date = new Date(call.date).toLocaleDateString();
      if (!callsByDate[date]) {
        callsByDate[date] = {
          total: 0,
          dm: 0,
          gk: 0,
          na: 0
        };
      }
      callsByDate[date].total++;
      if (call.outcome === 'DM') callsByDate[date].dm++;
      if (call.outcome === 'GK') callsByDate[date].gk++;
      if (call.outcome === 'NA') callsByDate[date].na++;
    });

    return {
      totalCallsInPeriod: recentCalls.length,
      dailyAverage: (recentCalls.length / days).toFixed(1),
      callsByDate
    };
  };

  // OK Code Distribution
  const getOKCodeDistribution = () => {
    const okCodes = {};
    contacts.forEach(contact => {
      if (contact.currentOkCode) {
        if (!okCodes[contact.currentOkCode]) {
          okCodes[contact.currentOkCode] = 0;
        }
        okCodes[contact.currentOkCode]++;
      }
    });

    return Object.entries(okCodes).map(([code, count]) => ({
      code,
      count,
      percentage: ((count / contacts.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  return {
    getActivityStats,
    getActivityTrends,
    getOKCodeDistribution,
    getAllCallRecords
  };
}

import { useContacts } from './useContacts';
import { useAvatars } from './useAvatars';
import { NEPQ_PHASES, PROBLEM_LEVELS } from '../lib/constants';

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
      c.currentOkCode === 'OK-11' || c.currentOkCode === 'OK-12'
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

  // NEPQ Funnel Analysis
  const getNEPQFunnelStats = () => {
    const funnelData = NEPQ_PHASES.map(phase => {
      const contactsAtPhase = contacts.filter(c => c.nepqPhase === phase.id);
      const contactsReachedPhase = contacts.filter(c => {
        const currentPhaseIndex = NEPQ_PHASES.findIndex(p => p.id === c.nepqPhase);
        const targetPhaseIndex = NEPQ_PHASES.findIndex(p => p.id === phase.id);
        return currentPhaseIndex >= targetPhaseIndex;
      });

      return {
        phase: phase.name,
        phaseId: phase.id,
        icon: phase.icon,
        order: phase.order,
        contactsAtPhase: contactsAtPhase.length,
        contactsReachedPhase: contactsReachedPhase.length,
        percentage: contacts.length > 0
          ? ((contactsReachedPhase.length / contacts.length) * 100).toFixed(1)
          : 0
      };
    });

    return funnelData;
  };

  // Problem Level Distribution
  const getProblemLevelDistribution = () => {
    const distribution = PROBLEM_LEVELS.map(level => {
      const contactsAtLevel = contacts.filter(c => c.problemLevel === level.level);
      const contactsReachedLevel = contacts.filter(c => c.problemLevel >= level.level);

      return {
        level: level.level,
        name: level.name,
        description: level.description,
        color: level.color,
        contactsAtLevel: contactsAtLevel.length,
        contactsReachedLevel: contactsReachedLevel.length,
        percentage: contacts.length > 0
          ? ((contactsAtLevel.length / contacts.length) * 100).toFixed(1)
          : 0
      };
    });

    // Add "None" category for contacts with no problem level
    const noProblemContacts = contacts.filter(c => !c.problemLevel || c.problemLevel === 0);
    distribution.unshift({
      level: 0,
      name: 'No Problem Identified',
      description: 'Not yet discovered',
      color: 'gray',
      contactsAtLevel: noProblemContacts.length,
      contactsReachedLevel: noProblemContacts.length,
      percentage: contacts.length > 0
        ? ((noProblemContacts.length / contacts.length) * 100).toFixed(1)
        : 0
    });

    return distribution;
  };

  // Avatar Performance Analysis
  const getAvatarPerformanceStats = () => {
    return avatars.map(avatar => {
      const avatarContacts = contacts.filter(c => c.avatarId === avatar.id);
      const avatarCalls = getAllCallRecords().filter(call => call.contact.avatarId === avatar.id);
      const dmCalls = avatarCalls.filter(call => call.outcome === 'DM');

      const meetingsBooked = avatarContacts.filter(c =>
        c.currentOkCode === 'OK-11' || c.currentOkCode === 'OK-12'
      ).length;

      // Calculate average problem level reached
      const contactsWithProblems = avatarContacts.filter(c => c.problemLevel > 0);
      const avgProblemLevel = contactsWithProblems.length > 0
        ? (contactsWithProblems.reduce((sum, c) => sum + c.problemLevel, 0) / contactsWithProblems.length).toFixed(1)
        : 0;

      // Calculate NEPQ progression
      const avgPhaseOrder = avatarContacts.length > 0
        ? (avatarContacts.reduce((sum, c) => {
            const phase = NEPQ_PHASES.find(p => p.id === c.nepqPhase);
            return sum + (phase?.order || 1);
          }, 0) / avatarContacts.length).toFixed(1)
        : 0;

      const conversionRate = dmCalls.length > 0
        ? ((meetingsBooked / dmCalls.length) * 100).toFixed(1)
        : 0;

      return {
        avatarId: avatar.id,
        avatarName: avatar.name || 'Unnamed Avatar',
        position: avatar.position || '',
        totalContacts: avatarContacts.length,
        totalCalls: avatarCalls.length,
        dmCalls: dmCalls.length,
        meetingsBooked,
        conversionRate: parseFloat(conversionRate),
        avgProblemLevel: parseFloat(avgProblemLevel),
        avgPhaseOrder: parseFloat(avgPhaseOrder),
        contactRate: avatarCalls.length > 0
          ? ((dmCalls.length / avatarCalls.length) * 100).toFixed(1)
          : 0
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  };

  // Conversion Funnel by Phase
  const getPhaseConversionRates = () => {
    const phases = NEPQ_PHASES.map((phase, index) => {
      const contactsAtPhase = contacts.filter(c => {
        const phaseIndex = NEPQ_PHASES.findIndex(p => p.id === c.nepqPhase);
        return phaseIndex >= index;
      });

      const nextPhase = NEPQ_PHASES[index + 1];
      const contactsAtNextPhase = nextPhase
        ? contacts.filter(c => {
            const phaseIndex = NEPQ_PHASES.findIndex(p => p.id === c.nepqPhase);
            return phaseIndex >= index + 1;
          })
        : [];

      const dropOff = contactsAtPhase.length - contactsAtNextPhase.length;
      const conversionRate = contactsAtPhase.length > 0 && nextPhase
        ? ((contactsAtNextPhase.length / contactsAtPhase.length) * 100).toFixed(1)
        : 0;

      return {
        phase: phase.name,
        phaseId: phase.id,
        icon: phase.icon,
        contactsIn: contactsAtPhase.length,
        contactsOut: contactsAtNextPhase.length,
        dropOff,
        conversionRate: parseFloat(conversionRate)
      };
    });

    return phases.slice(0, -1); // Remove last phase (no next phase to convert to)
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

  // Top Performing Contacts (by NEPQ progress)
  const getTopContacts = (limit = 10) => {
    return [...contacts]
      .filter(c => c.totalDials > 0)
      .sort((a, b) => {
        const aPhaseIndex = NEPQ_PHASES.findIndex(p => p.id === a.nepqPhase);
        const bPhaseIndex = NEPQ_PHASES.findIndex(p => p.id === b.nepqPhase);

        if (bPhaseIndex !== aPhaseIndex) {
          return bPhaseIndex - aPhaseIndex;
        }

        return (b.problemLevel || 0) - (a.problemLevel || 0);
      })
      .slice(0, limit);
  };

  // Duration stats by NEPQ Phase
  const getDurationByPhase = () => {
    const allCalls = getAllCallRecords();

    return NEPQ_PHASES.map(phase => {
      const phaseCalls = allCalls.filter(call => call.nepqPhaseReached === phase.id);
      const totalDuration = phaseCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
      const avgDuration = phaseCalls.length > 0 ? Math.round(totalDuration / phaseCalls.length) : 0;

      return {
        phase: phase.name,
        phaseId: phase.id,
        icon: phase.icon,
        callCount: phaseCalls.length,
        totalDuration,
        avgDuration
      };
    });
  };

  return {
    getActivityStats,
    getNEPQFunnelStats,
    getProblemLevelDistribution,
    getAvatarPerformanceStats,
    getPhaseConversionRates,
    getActivityTrends,
    getOKCodeDistribution,
    getTopContacts,
    getAllCallRecords,
    getDurationByPhase
  };
}

/**
 * Week Analytics Hook
 *
 * Consolidates week data, totals, averages, and ratios into a single hook.
 * Reduces duplication and provides a cleaner API for analytics.
 */

import { useMemo } from 'react';

/**
 * Get start of current week (Monday)
 */
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

/**
 * Hook to get comprehensive week analytics
 *
 * @param {Object} kpiData - Full KPI data object
 * @param {string} weekStart - Start date of week (optional, defaults to current week)
 * @returns {Object} Week analytics with data, totals, averages, and ratios
 */
export function useWeekAnalytics(kpiData, weekStart = null) {
  const startDate = weekStart || getWeekStart();

  return useMemo(() => {
    // Get week data (Mon-Fri only)
    const weekData = [];
    const start = new Date(startDate);

    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayKPI = kpiData[dateStr] || {
        dials: 0,
        pickups: 0,
        conversations: 0,
        triage: 0,
        bookedMeetings: 0,
        meetingsRan: 0,
        objections: []
      };

      weekData.push({
        date: dateStr,
        dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i],
        ...dayKPI
      });
    }

    // Calculate totals
    const totals = weekData.reduce((acc, day) => ({
      dials: acc.dials + (day.dials || 0),
      pickups: acc.pickups + (day.pickups || 0),
      conversations: acc.conversations + (day.conversations || 0),
      triage: acc.triage + (day.triage || 0),
      bookedMeetings: acc.bookedMeetings + (day.bookedMeetings || 0),
      meetingsRan: acc.meetingsRan + (day.meetingsRan || 0),
      objections: [...acc.objections, ...(day.objections || [])]
    }), {
      dials: 0,
      pickups: 0,
      conversations: 0,
      triage: 0,
      bookedMeetings: 0,
      meetingsRan: 0,
      objections: []
    });

    // Calculate days worked
    const daysWorked = weekData.filter(day => (day.dials || 0) > 0).length;

    // Calculate averages
    const averages = daysWorked > 0 ? {
      dials: totals.dials / daysWorked,
      pickups: totals.pickups / daysWorked,
      conversations: totals.conversations / daysWorked,
      triage: totals.triage / daysWorked,
      bookedMeetings: totals.bookedMeetings / daysWorked,
      meetingsRan: totals.meetingsRan / daysWorked,
      daysWorked
    } : {
      dials: 0,
      pickups: 0,
      conversations: 0,
      triage: 0,
      bookedMeetings: 0,
      meetingsRan: 0,
      daysWorked: 0
    };

    // Calculate performance ratios
    const ratios = {
      meetingsShowedRatio: totals.bookedMeetings > 0
        ? (totals.meetingsRan / totals.bookedMeetings)
        : 0,
      conversationsToMeetings: totals.conversations > 0
        ? (totals.bookedMeetings / totals.conversations)
        : 0,
      triageToConversations: totals.conversations > 0
        ? (totals.triage / totals.conversations)
        : 0,
      pickupsToConversations: totals.pickups > 0
        ? (totals.conversations / totals.pickups)
        : 0
    };

    // Get objection frequency
    const objectionFrequency = {};
    totals.objections.forEach(objection => {
      const key = objection.toLowerCase().trim();
      objectionFrequency[key] = (objectionFrequency[key] || 0) + 1;
    });

    const topObjections = Object.entries(objectionFrequency)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count);

    return {
      weekStart: startDate,
      weekData,
      totals,
      averages,
      ratios,
      topObjections
    };
  }, [kpiData, startDate]);
}

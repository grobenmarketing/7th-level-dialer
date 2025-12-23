import { useState, useEffect } from 'react';
import { storage, KEYS } from '../lib/cloudStorage';
import eventBus, { EVENTS } from '../lib/eventBus';

// Get start of current week (Monday)
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

export function useKPI() {
  const [kpiData, setKpiData] = useState({});
  const [weeklyTargets, setWeeklyTargets] = useState({
    dials: 125 // Default weekly dial target (25 * 5 days)
  });
  const [dailyDialGoal, setDailyDialGoal] = useState(25); // Default daily dial goal
  const [loading, setLoading] = useState(true);

  // Load KPI data and targets from storage
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const savedKPI = await storage.get(KEYS.KPI_DATA, {});
        const savedTargets = await storage.get(KEYS.WEEKLY_TARGETS, { dials: 125 });
        const savedDailyGoal = await storage.get(KEYS.DAILY_DIAL_GOAL, 25);

        if (mounted) {
          setKpiData(savedKPI);
          setWeeklyTargets(savedTargets);
          setDailyDialGoal(savedDailyGoal);
        }
      } catch (error) {
        console.error('Error loading KPI data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for KPI updates from other component instances (real-time sync)
  useEffect(() => {
    const handleKPIUpdate = async (updatedKPI) => {
      // Only update if the data is different from current state
      // This prevents infinite loops since we emit events in saveKPI
      if (JSON.stringify(updatedKPI) !== JSON.stringify(kpiData)) {
        setKpiData(updatedKPI);
      }
    };

    const unsubscribe = eventBus.on(EVENTS.KPI_UPDATED, handleKPIUpdate);

    return () => {
      unsubscribe();
    };
  }, [kpiData]);

  // Save KPI data to storage
  const saveKPI = async (updatedKPI) => {
    setKpiData(updatedKPI);
    await storage.set(KEYS.KPI_DATA, updatedKPI);
    // Emit event to notify other components of KPI update
    eventBus.emit(EVENTS.KPI_UPDATED, updatedKPI);
  };

  // Save weekly targets
  const saveTargets = async (updatedTargets) => {
    setWeeklyTargets(updatedTargets);
    await storage.set(KEYS.WEEKLY_TARGETS, updatedTargets);
  };

  // Save daily dial goal
  const saveDailyDialGoal = async (goal) => {
    setDailyDialGoal(goal);
    await storage.set(KEYS.DAILY_DIAL_GOAL, goal);
  };

  // Get today's dials count
  const getTodayDials = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayKPI = getKPIForDate(today);
    return todayKPI.dials || 0;
  };

  // Get or create KPI entry for a specific date
  const getKPIForDate = (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return kpiData[dateStr] || {
      dials: 0,
      pickups: 0,
      conversations: 0,
      triage: 0,
      bookedMeetings: 0,
      meetingsRan: 0,
      objections: []
    };
  };

  // Update KPI for a specific date
  const updateKPIForDate = async (date, updates) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const currentKPI = getKPIForDate(dateStr);
    const updatedKPI = {
      ...kpiData,
      [dateStr]: {
        ...currentKPI,
        ...updates
      }
    };
    await saveKPI(updatedKPI);
  };

  // Increment a metric for a specific date
  const incrementMetric = async (date, metric, amount = 1) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const currentKPI = getKPIForDate(dateStr);
    await updateKPIForDate(dateStr, {
      [metric]: (currentKPI[metric] || 0) + amount
    });
  };

  // Add objection to a specific date
  const addObjection = async (date, objection) => {
    if (!objection || !objection.trim()) return;

    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const currentKPI = getKPIForDate(dateStr);
    const updatedObjections = [...(currentKPI.objections || []), objection.trim()];

    await updateKPIForDate(dateStr, {
      objections: updatedObjections
    });
  };

  // Get week data (Mon-Fri only)
  const getWeekData = (weekStart = getWeekStart()) => {
    const weekData = [];
    const startDate = new Date(weekStart);

    // Only return Mon-Fri (5 days, not 7)
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weekData.push({
        date: dateStr,
        dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i],
        ...getKPIForDate(dateStr)
      });
    }

    return weekData;
  };

  // Get weekly totals
  const getWeeklyTotals = (weekStart = getWeekStart()) => {
    const weekData = getWeekData(weekStart);

    const totals = {
      dials: 0,
      pickups: 0,
      conversations: 0,
      triage: 0,
      bookedMeetings: 0,
      meetingsRan: 0,
      objections: []
    };

    weekData.forEach(day => {
      totals.dials += day.dials || 0;
      totals.pickups += day.pickups || 0;
      totals.conversations += day.conversations || 0;
      totals.triage += day.triage || 0;
      totals.bookedMeetings += day.bookedMeetings || 0;
      totals.meetingsRan += day.meetingsRan || 0;
      totals.objections = [...totals.objections, ...(day.objections || [])];
    });

    return totals;
  };

  // Get daily averages based on days actually worked
  const getDailyAverages = (weekStart = getWeekStart()) => {
    const weekData = getWeekData(weekStart);
    const totals = getWeeklyTotals(weekStart);

    // Count days that have at least one dial (days actually worked)
    const daysWorked = weekData.filter(day => (day.dials || 0) > 0).length;

    // If no days worked, return zeros
    if (daysWorked === 0) {
      return {
        dials: 0,
        pickups: 0,
        conversations: 0,
        triage: 0,
        bookedMeetings: 0,
        meetingsRan: 0,
        daysWorked: 0
      };
    }

    // Calculate averages based on days worked
    return {
      dials: totals.dials / daysWorked,
      pickups: totals.pickups / daysWorked,
      conversations: totals.conversations / daysWorked,
      triage: totals.triage / daysWorked,
      bookedMeetings: totals.bookedMeetings / daysWorked,
      meetingsRan: totals.meetingsRan / daysWorked,
      daysWorked
    };
  };

  // Calculate performance ratios
  const getPerformanceRatios = (weekStart = getWeekStart()) => {
    const totals = getWeeklyTotals(weekStart);

    return {
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
  };

  // Get objection frequency
  const getObjectionFrequency = (weekStart = getWeekStart()) => {
    const totals = getWeeklyTotals(weekStart);
    const frequency = {};

    totals.objections.forEach(objection => {
      const key = objection.toLowerCase().trim();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    return Object.entries(frequency)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Update weekly targets
  const updateWeeklyTargets = async (targets) => {
    await saveTargets({ ...weeklyTargets, ...targets });
  };

  // Reset all KPI data
  const resetAllKPI = async () => {
    await saveKPI({});
  };

  // Rebuild KPI data from contact call history
  const rebuildFromCallHistory = async (contacts) => {
    const newKPIData = {};

    contacts.forEach(contact => {
      if (!contact.callHistory || contact.callHistory.length === 0) return;

      contact.callHistory.forEach(call => {
        const dateStr = new Date(call.date).toISOString().split('T')[0];

        if (!newKPIData[dateStr]) {
          newKPIData[dateStr] = {
            dials: 0,
            pickups: 0,
            conversations: 0,
            triage: 0,
            bookedMeetings: 0,
            meetingsRan: 0,
            objections: []
          };
        }

        // Count dials
        newKPIData[dateStr].dials += 1;

        // Count pickups (DM only)
        if (call.outcome === 'DM') {
          newKPIData[dateStr].pickups += 1;
        }

        // Count conversations
        if (call.hadConversation) {
          newKPIData[dateStr].conversations += 1;
        }

        // Count triage
        if (call.hadTriage) {
          newKPIData[dateStr].triage += 1;
        }

        // Count booked meetings (OK-10)
        if (call.okCode === 'OK-10') {
          newKPIData[dateStr].bookedMeetings += 1;
        }

        // Add objections
        if (call.objection && call.objection.trim()) {
          newKPIData[dateStr].objections.push(call.objection.trim());
        }
      });
    });

    await saveKPI(newKPIData);
    return newKPIData;
  };

  return {
    kpiData,
    weeklyTargets,
    dailyDialGoal,
    loading,
    getKPIForDate,
    updateKPIForDate,
    incrementMetric,
    addObjection,
    getWeekData,
    getWeeklyTotals,
    getDailyAverages,
    getPerformanceRatios,
    getObjectionFrequency,
    updateWeeklyTargets,
    saveDailyDialGoal,
    getTodayDials,
    resetAllKPI,
    rebuildFromCallHistory,
    getWeekStart
  };
}

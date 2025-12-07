import { NEPQ_PHASES, PROBLEM_LEVELS } from './constants';

export const nepqHelpers = {
  getPhaseIndex: (phaseId) => {
    return NEPQ_PHASES.findIndex(p => p.id === phaseId);
  },

  getNextPhase: (currentPhaseId) => {
    const index = nepqHelpers.getPhaseIndex(currentPhaseId);
    if (index === -1 || index === NEPQ_PHASES.length - 1) return null;
    return NEPQ_PHASES[index + 1];
  },

  isPhaseComplete: (contact, phaseId) => {
    const phaseIndex = nepqHelpers.getPhaseIndex(phaseId);
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    return currentIndex >= phaseIndex;
  },

  getProblemLevelColor: (level) => {
    const problemLevel = PROBLEM_LEVELS.find(pl => pl.level === level);
    return problemLevel?.color || 'gray';
  },

  getProgressPercentage: (contact) => {
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    return ((currentIndex + 1) / NEPQ_PHASES.length) * 100;
  },

  getPhasesByOrder: () => {
    return [...NEPQ_PHASES].sort((a, b) => a.order - b.order);
  },

  canProgressToPhase: (contact, targetPhaseId) => {
    const currentIndex = nepqHelpers.getPhaseIndex(contact.nepqPhase);
    const targetIndex = nepqHelpers.getPhaseIndex(targetPhaseId);
    return targetIndex <= currentIndex + 1;
  }
};

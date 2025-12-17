import { useState, useEffect } from 'react';

const ACHIEVEMENTS_KEY = 'r7_achievements';

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-blood',
    icon: '📞',
    title: 'First Blood',
    description: 'Make your first 100 calls',
    points: 50,
    condition: (stats) => stats.totalDials >= 100
  },
  {
    id: 'lion-heart',
    icon: '🦁',
    title: 'Lion Heart',
    description: 'Book 3 meetings in 1 day',
    points: 100,
    condition: (stats) => stats.dailyMeetingsMax >= 3
  },
  {
    id: 'diamond-hands',
    icon: '💎',
    title: 'Diamond Hands',
    description: 'Make 500 total calls',
    points: 200,
    condition: (stats) => stats.totalDials >= 500
  },
  {
    id: 'on-fire',
    icon: '🔥',
    title: 'On Fire',
    description: '10 Day calling streak',
    points: 150,
    condition: (stats) => stats.callingStreak >= 10
  },
  {
    id: 'closer',
    icon: '🎯',
    title: 'The Closer',
    description: 'Book 10 total meetings',
    points: 150,
    condition: (stats) => stats.totalMeetings >= 10
  },
  {
    id: 'marathon',
    icon: '🏃',
    title: 'Marathon Runner',
    description: 'Make 1000 total calls',
    points: 500,
    condition: (stats) => stats.totalDials >= 1000
  },
  {
    id: 'centurion',
    icon: '💯',
    title: 'Centurion',
    description: 'Make 100 calls in one day',
    points: 300,
    condition: (stats) => stats.dailyDialsMax >= 100
  },
  {
    id: 'connector',
    icon: '🤝',
    title: 'The Connector',
    description: 'Talk to 50 decision makers',
    points: 200,
    condition: (stats) => stats.dmContacts >= 50
  },
];

export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  const checkAndUnlockAchievements = (stats) => {
    const newlyUnlocked = [];

    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      // Check if already unlocked
      if (unlockedAchievements.includes(achievement.id)) {
        return;
      }

      // Check if condition is met
      if (achievement.condition(stats)) {
        newlyUnlocked.push(achievement.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      return newlyUnlocked.map(id =>
        ACHIEVEMENT_DEFINITIONS.find(a => a.id === id)
      );
    }

    return [];
  };

  const getAllAchievements = () => {
    return ACHIEVEMENT_DEFINITIONS.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id)
    }));
  };

  const getTotalPoints = () => {
    return ACHIEVEMENT_DEFINITIONS
      .filter(a => unlockedAchievements.includes(a.id))
      .reduce((sum, a) => sum + a.points, 0);
  };

  const getUnlockedCount = () => {
    return unlockedAchievements.length;
  };

  const getTotalCount = () => {
    return ACHIEVEMENT_DEFINITIONS.length;
  };

  return {
    getAllAchievements,
    checkAndUnlockAchievements,
    getTotalPoints,
    getUnlockedCount,
    getTotalCount,
    unlockedAchievements
  };
}

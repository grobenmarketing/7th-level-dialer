import { useState, useEffect } from 'react';
import { storage, KEYS } from '../lib/storage';

export function useAvatars() {
  const [avatars, setAvatars] = useState([]);

  // Load avatars from localStorage on mount
  useEffect(() => {
    const savedAvatars = storage.get(KEYS.AVATARS, []);
    setAvatars(savedAvatars);
  }, []);

  // Save avatars to localStorage whenever they change
  const saveAvatars = (updatedAvatars) => {
    setAvatars(updatedAvatars);
    storage.set(KEYS.AVATARS, updatedAvatars);
  };

  const addAvatar = (avatarData) => {
    const newAvatar = {
      id: Date.now().toString(),
      name: avatarData.name || '',
      position: avatarData.position || '',
      isDecisionMaker: avatarData.isDecisionMaker !== undefined ? avatarData.isDecisionMaker : true,
      personality: avatarData.personality || '',
      sophistication: avatarData.sophistication || 'medium',

      // Moments in Time
      momentsInTime: avatarData.momentsInTime || [],

      // Problems by level
      problems: {
        level1: avatarData.problems?.level1 || [],
        level2: avatarData.problems?.level2 || [],
        level3: avatarData.problems?.level3 || [],
        level4: avatarData.problems?.level4 || []
      },

      // Cold call hooks
      coldCallHooks: avatarData.coldCallHooks || [],

      // Objection handling
      objectionHandling: avatarData.objectionHandling || {},

      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAvatars = [...avatars, newAvatar];
    saveAvatars(updatedAvatars);
    return newAvatar;
  };

  const updateAvatar = (avatarId, updates) => {
    const updatedAvatars = avatars.map(avatar =>
      avatar.id === avatarId
        ? {
            ...avatar,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : avatar
    );
    saveAvatars(updatedAvatars);
  };

  const deleteAvatar = (avatarId) => {
    const updatedAvatars = avatars.filter(avatar => avatar.id !== avatarId);
    saveAvatars(updatedAvatars);
  };

  const getAvatarById = (avatarId) => {
    return avatars.find(avatar => avatar.id === avatarId);
  };

  const getAvatarsByPosition = (position) => {
    return avatars.filter(avatar =>
      avatar.position.toLowerCase().includes(position.toLowerCase())
    );
  };

  const getDecisionMakerAvatars = () => {
    return avatars.filter(avatar => avatar.isDecisionMaker === true);
  };

  return {
    avatars,
    addAvatar,
    updateAvatar,
    deleteAvatar,
    getAvatarById,
    getAvatarsByPosition,
    getDecisionMakerAvatars
  };
}

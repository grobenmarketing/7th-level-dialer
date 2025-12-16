import { useState, useEffect } from 'react';
import { storage, KEYS } from '../lib/cloudStorage';

export function useAvatars() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load avatars from storage on mount
  useEffect(() => {
    let mounted = true;

    const loadAvatars = async () => {
      try {
        setLoading(true);
        const savedAvatars = await storage.get(KEYS.AVATARS, []);

        if (mounted) {
          setAvatars(savedAvatars);
        }
      } catch (error) {
        console.error('Error loading avatars:', error);
        if (mounted) {
          setAvatars([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAvatars();

    return () => {
      mounted = false;
    };
  }, []);

  // Save avatars to storage whenever they change
  const saveAvatars = async (updatedAvatars) => {
    setAvatars(updatedAvatars);
    await storage.set(KEYS.AVATARS, updatedAvatars);
  };

  const addAvatar = async (avatarData) => {
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
    await saveAvatars(updatedAvatars);
    return newAvatar;
  };

  const updateAvatar = async (avatarId, updates) => {
    const updatedAvatars = avatars.map(avatar =>
      avatar.id === avatarId
        ? {
            ...avatar,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : avatar
    );
    await saveAvatars(updatedAvatars);
  };

  const deleteAvatar = async (avatarId) => {
    const updatedAvatars = avatars.filter(avatar => avatar.id !== avatarId);
    await saveAvatars(updatedAvatars);
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
    getDecisionMakerAvatars,
    loading
  };
}

import { useState, useEffect, useCallback } from 'react';
import { storage, KEYS, isCloudStorageAvailable, migrateToCloud } from '../lib/cloudStorage';

// Hook for cloud storage with automatic migration and sync
export function useCloudStorage(key, defaultValue = null) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [migrated, setMigrated] = useState(false);

  // Load data on mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Run migration once if in production
        if (isCloudStorageAvailable() && !migrated) {
          await migrateToCloud();
          setMigrated(true);
        }

        // Load the data
        const data = await storage.get(key, defaultValue);

        if (mounted) {
          setValue(data);
          setError(null);
        }
      } catch (err) {
        console.error(`Error loading ${key}:`, err);
        if (mounted) {
          setError(err);
          setValue(defaultValue);
        }
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
  }, [key]); // Only re-run if key changes

  // Save function
  const save = useCallback(async (newValue) => {
    try {
      setValue(newValue);
      await storage.set(key, newValue);
      return true;
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
      setError(err);
      return false;
    }
  }, [key]);

  // Update function (merge with existing value)
  const update = useCallback(async (updates) => {
    try {
      const newValue = { ...value, ...updates };
      setValue(newValue);
      await storage.set(key, newValue);
      return true;
    } catch (err) {
      console.error(`Error updating ${key}:`, err);
      setError(err);
      return false;
    }
  }, [key, value]);

  // Remove function
  const remove = useCallback(async () => {
    try {
      setValue(defaultValue);
      await storage.remove(key);
      return true;
    } catch (err) {
      console.error(`Error removing ${key}:`, err);
      setError(err);
      return false;
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: save,
    update,
    remove,
    loading,
    error,
    isCloudEnabled: isCloudStorageAvailable()
  };
}

// Export KEYS for convenience
export { KEYS };

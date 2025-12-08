// Cloud storage service with Netlify Blob integration and localStorage fallback
// Automatically detects environment and uses appropriate storage method

const KEYS = {
  CONTACTS: 'r7_contacts',
  AVATARS: 'r7_avatars',
  STATS: 'r7_stats',
  USER: 'r7_user',
  BADGES: 'r7_badges',
  KPI_DATA: 'r7_kpi_data',
  WEEKLY_TARGETS: 'r7_weekly_targets',
  DAILY_DIAL_GOAL: 'r7_daily_dial_goal',
  MIGRATION_STATUS: 'r7_migration_status'
};

// Detect if we're running in production (Netlify) or development
const isProduction = () => {
  return window.location.hostname !== 'localhost' &&
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('192.168');
};

// Check if cloud storage is available
const isCloudStorageAvailable = () => {
  return isProduction();
};

// LocalStorage implementation (fallback for development)
const localStorageImpl = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`LocalStorage read error (${key}):`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`LocalStorage write error (${key}):`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`LocalStorage remove error (${key}):`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }
};

// Cloud storage implementation (Netlify Blob via serverless functions)
const cloudStorageImpl = {
  get: async (key, defaultValue = null) => {
    try {
      const response = await fetch(`/api/get-data?key=${encodeURIComponent(key)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data !== null ? result.data : defaultValue;
    } catch (error) {
      console.error(`Cloud storage read error (${key}):`, error);
      // Fallback to localStorage if cloud fails
      return localStorageImpl.get(key, defaultValue);
    }
  },

  set: async (key, value) => {
    try {
      const response = await fetch('/api/set-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data: value })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Also save to localStorage as backup
      localStorageImpl.set(key, value);

      return true;
    } catch (error) {
      console.error(`Cloud storage write error (${key}):`, error);
      // Fallback to localStorage if cloud fails
      return localStorageImpl.set(key, value);
    }
  },

  remove: async (key) => {
    try {
      const response = await fetch('/api/set-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data: null })
      });

      localStorageImpl.remove(key);
      return true;
    } catch (error) {
      console.error(`Cloud storage remove error (${key}):`, error);
      return localStorageImpl.remove(key);
    }
  },

  clear: async () => {
    try {
      // Clear all known keys in cloud storage
      const allKeys = Object.values(KEYS);
      const promises = allKeys.map(key => cloudStorageImpl.remove(key));
      await Promise.all(promises);

      localStorageImpl.clear();
      return true;
    } catch (error) {
      console.error('Cloud storage clear error:', error);
      return localStorageImpl.clear();
    }
  }
};

// Migration utility to move data from localStorage to cloud storage
export const migrateToCloud = async () => {
  if (!isCloudStorageAvailable()) {
    console.log('Cloud storage not available, skipping migration');
    return { success: false, reason: 'not_in_production' };
  }

  // Check if migration already completed
  const migrationStatus = localStorageImpl.get(KEYS.MIGRATION_STATUS);
  if (migrationStatus?.completed) {
    console.log('Migration already completed');
    return { success: true, reason: 'already_migrated' };
  }

  try {
    console.log('Starting migration to cloud storage...');

    const allKeys = [
      KEYS.CONTACTS,
      KEYS.AVATARS,
      KEYS.STATS,
      KEYS.USER,
      KEYS.BADGES,
      KEYS.KPI_DATA,
      KEYS.WEEKLY_TARGETS,
      KEYS.DAILY_DIAL_GOAL
    ];

    const items = [];

    for (const key of allKeys) {
      const data = localStorageImpl.get(key);
      if (data !== null) {
        items.push({ key, data });
      }
    }

    if (items.length === 0) {
      console.log('No data to migrate');
      localStorageImpl.set(KEYS.MIGRATION_STATUS, {
        completed: true,
        timestamp: new Date().toISOString(),
        itemsCount: 0
      });
      return { success: true, reason: 'no_data' };
    }

    // Bulk upload to cloud storage
    const response = await fetch('/api/sync-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      throw new Error(`Migration failed: ${response.status}`);
    }

    // Mark migration as complete
    localStorageImpl.set(KEYS.MIGRATION_STATUS, {
      completed: true,
      timestamp: new Date().toISOString(),
      itemsCount: items.length
    });

    console.log(`Migration completed successfully! Migrated ${items.length} items.`);
    return { success: true, itemsCount: items.length };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
};

// Unified storage interface that automatically uses the right backend
export const storage = {
  get: async (key, defaultValue = null) => {
    if (isCloudStorageAvailable()) {
      return await cloudStorageImpl.get(key, defaultValue);
    } else {
      return localStorageImpl.get(key, defaultValue);
    }
  },

  set: async (key, value) => {
    if (isCloudStorageAvailable()) {
      return await cloudStorageImpl.set(key, value);
    } else {
      return localStorageImpl.set(key, value);
    }
  },

  remove: async (key) => {
    if (isCloudStorageAvailable()) {
      return await cloudStorageImpl.remove(key);
    } else {
      return localStorageImpl.remove(key);
    }
  },

  clear: async () => {
    if (isCloudStorageAvailable()) {
      return await cloudStorageImpl.clear();
    } else {
      return localStorageImpl.clear();
    }
  },

  // Synchronous versions for backward compatibility (use in development only)
  getSync: (key, defaultValue = null) => {
    return localStorageImpl.get(key, defaultValue);
  },

  setSync: (key, value) => {
    return localStorageImpl.set(key, value);
  }
};

export { KEYS, isCloudStorageAvailable };

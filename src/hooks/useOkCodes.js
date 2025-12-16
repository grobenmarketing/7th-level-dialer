import { useState, useEffect } from 'react';
import { storage } from '../lib/cloudStorage';

const OK_CODES_KEY = 'r7_ok_codes';

// Default OK codes (matching current implementation)
const DEFAULT_OK_CODES = [
  { id: '1', label: 'No Answer', color: '#FFA500', countsAsPickup: false },
  { id: '2', label: 'Busy', color: '#FF6347', countsAsPickup: false },
  { id: '3', label: 'Wrong Number', color: '#DC143C', countsAsPickup: false },
  { id: '4', label: 'Voicemail', color: '#FF8C00', countsAsPickup: false },
  { id: '5', label: 'Gatekeeper', color: '#4682B4', countsAsPickup: true },
  { id: '6', label: 'Not Interested', color: '#8B0000', countsAsPickup: true },
  { id: '7', label: 'Interested', color: '#32CD32', countsAsPickup: true },
  { id: '8', label: 'Meeting Booked', color: '#FFD700', countsAsPickup: true },
  { id: '9', label: 'Call Back', color: '#87CEEB', countsAsPickup: true },
];

export function useOkCodes() {
  const [okCodes, setOkCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load OK codes from storage on mount
  useEffect(() => {
    let mounted = true;

    const loadOkCodes = async () => {
      try {
        setLoading(true);
        const savedCodes = await storage.get(OK_CODES_KEY, DEFAULT_OK_CODES);

        if (mounted) {
          setOkCodes(savedCodes);
        }
      } catch (error) {
        console.error('Error loading OK codes:', error);
        if (mounted) {
          setOkCodes(DEFAULT_OK_CODES);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOkCodes();

    return () => {
      mounted = false;
    };
  }, []);

  // Save OK codes to storage
  const saveOkCodes = async (updatedCodes) => {
    setOkCodes(updatedCodes);
    await storage.set(OK_CODES_KEY, updatedCodes);
  };

  const addOkCode = async (okCode) => {
    const newOkCode = {
      id: Date.now().toString(),
      label: okCode.label,
      color: okCode.color || '#808080',
      countsAsPickup: okCode.countsAsPickup ?? true,
    };

    const updatedCodes = [...okCodes, newOkCode];
    await saveOkCodes(updatedCodes);
    return newOkCode;
  };

  const updateOkCode = async (id, updates) => {
    const updatedCodes = okCodes.map((code) =>
      code.id === id ? { ...code, ...updates } : code
    );
    await saveOkCodes(updatedCodes);
  };

  const deleteOkCode = async (id) => {
    const updatedCodes = okCodes.filter((code) => code.id !== id);
    await saveOkCodes(updatedCodes);
  };

  const reorderOkCodes = async (newOrder) => {
    await saveOkCodes(newOrder);
  };

  const resetToDefaults = async () => {
    await saveOkCodes(DEFAULT_OK_CODES);
  };

  return {
    okCodes,
    loading,
    addOkCode,
    updateOkCode,
    deleteOkCode,
    reorderOkCodes,
    resetToDefaults,
  };
}

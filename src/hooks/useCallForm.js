/**
 * Call Form State Management Hook
 *
 * Manages all form state for the calling interface including:
 * - Call outcomes and OK codes
 * - Notes and objections
 * - Quality tracking (conversation, triage)
 * - Email follow-up flags
 * - Call timer
 */

import { useState, useEffect } from 'react';

/**
 * Hook for managing call form state
 *
 * @param {number} contactIndex - Current contact index (resets form when changed)
 * @returns {Object} Form state and handlers
 */
export function useCallForm(contactIndex) {
  // Form state consolidated into single object
  const [formState, setFormState] = useState({
    outcome: '',
    okCode: '',
    notes: '',
    hadConversation: false,
    hadTriage: false,
    objection: '',
    needsEmail: false
  });

  // Call timer state
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when contact changes
  useEffect(() => {
    setFormState({
      outcome: '',
      okCode: '',
      notes: '',
      hadConversation: false,
      hadTriage: false,
      objection: '',
      needsEmail: false
    });
    setCallDuration(0);
    setTimerActive(false);
    setIsSaving(false);
  }, [contactIndex]);

  // Update individual form field
  const updateField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Update multiple fields at once
  const updateFields = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Reset entire form
  const resetForm = () => {
    setFormState({
      outcome: '',
      okCode: '',
      notes: '',
      hadConversation: false,
      hadTriage: false,
      objection: '',
      needsEmail: false
    });
    setCallDuration(0);
    setTimerActive(false);
    setIsSaving(false);
  };

  // Start call timer
  const startTimer = () => {
    setTimerActive(true);
  };

  // Stop call timer
  const stopTimer = () => {
    setTimerActive(false);
  };

  // Validate form before submission
  const validate = () => {
    const errors = [];

    if (!formState.outcome) {
      errors.push('Please select a call outcome');
    }

    if (!formState.okCode) {
      errors.push('Please select an OK code');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    // Form state
    ...formState,
    callDuration,
    timerActive,
    isSaving,

    // State setters
    setIsSaving,
    updateField,
    updateFields,
    resetForm,

    // Timer controls
    startTimer,
    stopTimer,
    setCallDuration,

    // Validation
    validate
  };
}

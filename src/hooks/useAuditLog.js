import { useState, useEffect } from 'react';
import { storage } from '../lib/cloudStorage';

const AUDIT_LOG_KEY = 'r7_audit_log';

/**
 * Audit Log Hook
 * Tracks all critical data operations for security and compliance
 */
export function useAuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);

  // Load audit logs on mount
  useEffect(() => {
    const loadAuditLogs = async () => {
      const logs = await storage.get(AUDIT_LOG_KEY, []);
      setAuditLogs(logs);
    };
    loadAuditLogs();
  }, []);

  /**
   * Log an audit event
   * @param {string} action - The action performed (e.g., 'DELETE_CONTACT', 'BULK_DELETE')
   * @param {Object} details - Details about the action
   */
  const logAudit = async (action, details = {}) => {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'authenticated_user', // In a real app, this would be the logged-in user
    };

    const updatedLogs = [auditEntry, ...auditLogs];

    // Keep only last 1000 audit entries to prevent unbounded growth
    const trimmedLogs = updatedLogs.slice(0, 1000);

    await storage.set(AUDIT_LOG_KEY, trimmedLogs);
    setAuditLogs(trimmedLogs);

    // Also log to console for immediate visibility
    console.log(`🔒 AUDIT: ${action}`, details);

    return auditEntry;
  };

  /**
   * Get recent audit logs
   * @param {number} limit - Number of logs to return
   * @returns {Array} Recent audit logs
   */
  const getRecentLogs = (limit = 50) => {
    return auditLogs.slice(0, limit);
  };

  /**
   * Get audit logs by action type
   * @param {string} action - Action type to filter by
   * @returns {Array} Filtered audit logs
   */
  const getLogsByAction = (action) => {
    return auditLogs.filter(log => log.action === action);
  };

  /**
   * Clear old audit logs (older than specified days)
   * @param {number} daysToKeep - Number of days of logs to retain
   */
  const clearOldLogs = async (daysToKeep = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredLogs = auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= cutoffDate;
    });

    await storage.set(AUDIT_LOG_KEY, filteredLogs);
    setAuditLogs(filteredLogs);

    return {
      removed: auditLogs.length - filteredLogs.length,
      remaining: filteredLogs.length
    };
  };

  return {
    auditLogs,
    logAudit,
    getRecentLogs,
    getLogsByAction,
    clearOldLogs
  };
}

import { useState, useEffect } from 'react';
import { storage } from '../lib/cloudStorage';

const DELETED_CONTACTS_KEY = 'r7_deleted_contacts';
const RETENTION_DAYS = 30; // Keep deleted contacts for 30 days

/**
 * Deleted Contacts Hook
 * Manages soft-deleted contacts with recovery capability
 */
export function useDeletedContacts() {
  const [deletedContacts, setDeletedContacts] = useState([]);

  // Load deleted contacts on mount
  useEffect(() => {
    const loadDeletedContacts = async () => {
      const deleted = await storage.get(DELETED_CONTACTS_KEY, []);

      // Auto-cleanup: Remove items older than retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

      const validDeleted = deleted.filter(item => {
        const deletedDate = new Date(item.deletedAt);
        return deletedDate >= cutoffDate;
      });

      // Save back if we cleaned anything up
      if (validDeleted.length !== deleted.length) {
        await storage.set(DELETED_CONTACTS_KEY, validDeleted);
      }

      setDeletedContacts(validDeleted);
    };
    loadDeletedContacts();
  }, []);

  /**
   * Move contact to deleted (soft delete)
   * @param {Object} contact - Contact to soft delete
   * @returns {Promise<Object>} Deleted contact record
   */
  const softDeleteContact = async (contact) => {
    const deletedRecord = {
      ...contact,
      deletedAt: new Date().toISOString(),
      deletedId: `deleted_${Date.now()}_${contact.id}`,
    };

    const updated = [deletedRecord, ...deletedContacts];
    await storage.set(DELETED_CONTACTS_KEY, updated);
    setDeletedContacts(updated);

    return deletedRecord;
  };

  /**
   * Bulk soft delete multiple contacts
   * @param {Array} contacts - Contacts to soft delete
   * @returns {Promise<Array>} Array of deleted contact records
   */
  const softDeleteBulk = async (contacts) => {
    const deletedRecords = contacts.map(contact => ({
      ...contact,
      deletedAt: new Date().toISOString(),
      deletedId: `deleted_${Date.now()}_${contact.id}`,
    }));

    const updated = [...deletedRecords, ...deletedContacts];
    await storage.set(DELETED_CONTACTS_KEY, updated);
    setDeletedContacts(updated);

    return deletedRecords;
  };

  /**
   * Recover a deleted contact
   * @param {string} deletedId - ID of deleted contact to recover
   * @returns {Promise<Object>} Recovered contact (without deletion metadata)
   */
  const recoverContact = async (deletedId) => {
    const contactToRecover = deletedContacts.find(c => c.deletedId === deletedId);

    if (!contactToRecover) {
      throw new Error('Contact not found in deleted items');
    }

    // Remove deletion metadata
    const { deletedAt, deletedId: _, ...recoveredContact } = contactToRecover;

    // Remove from deleted list
    const updated = deletedContacts.filter(c => c.deletedId !== deletedId);
    await storage.set(DELETED_CONTACTS_KEY, updated);
    setDeletedContacts(updated);

    return recoveredContact;
  };

  /**
   * Permanently delete a contact (hard delete)
   * @param {string} deletedId - ID of deleted contact to permanently remove
   */
  const permanentlyDelete = async (deletedId) => {
    const updated = deletedContacts.filter(c => c.deletedId !== deletedId);
    await storage.set(DELETED_CONTACTS_KEY, updated);
    setDeletedContacts(updated);
  };

  /**
   * Get days until a deleted contact is permanently removed
   * @param {string} deletedId - ID of deleted contact
   * @returns {number} Days remaining until permanent deletion
   */
  const getDaysUntilPermanentDeletion = (deletedId) => {
    const contact = deletedContacts.find(c => c.deletedId === deletedId);
    if (!contact) return 0;

    const deletedDate = new Date(contact.deletedAt);
    const expiryDate = new Date(deletedDate);
    expiryDate.setDate(expiryDate.getDate() + RETENTION_DAYS);

    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
  };

  /**
   * Empty all deleted contacts (permanent)
   */
  const emptyTrash = async () => {
    await storage.set(DELETED_CONTACTS_KEY, []);
    setDeletedContacts([]);
  };

  return {
    deletedContacts,
    softDeleteContact,
    softDeleteBulk,
    recoverContact,
    permanentlyDelete,
    getDaysUntilPermanentDeletion,
    emptyTrash,
    retentionDays: RETENTION_DAYS
  };
}

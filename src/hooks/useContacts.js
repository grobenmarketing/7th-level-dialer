import { useState, useEffect, useCallback } from 'react';
import { storage, KEYS, migrateToCloud, isCloudStorageAvailable } from '../lib/cloudStorage';
import { createContact, migrateContact, createContactFromCSV } from '../lib/contactSchema';
import { useAuditLog } from './useAuditLog';
import { useDeletedContacts } from './useDeletedContacts';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SECURITY: Audit logging and soft-delete
  const { logAudit } = useAuditLog();
  const { softDeleteContact, softDeleteBulk } = useDeletedContacts();

  // Extracted load function that can be called manually (useCallback to stabilize reference)
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);

      // Run migration once if in production
      if (isCloudStorageAvailable()) {
        await migrateToCloud();
      }

      // Load contacts
      let savedContacts = await storage.get(KEYS.CONTACTS, []);

      // MIGRATION: Add sequence fields to existing contacts that don't have them
      const needsMigration = savedContacts.some(c => !c.hasOwnProperty('sequence_status'));
      if (needsMigration) {
        savedContacts = savedContacts.map(migrateContact);
      }

      // Save migrated contacts back to storage
      if (needsMigration) {
        await storage.set(KEYS.CONTACTS, savedContacts);
        console.log('✅ Migrated contacts to include sequence fields');
      }

      setContacts(savedContacts);
      console.log('📋 Loaded', savedContacts.length, 'contacts from storage');
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - this function doesn't depend on any external values

  // Load contacts from storage on mount (with automatic migration to cloud)
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Save contacts to storage whenever they change
  // Accepts either an array or a function that receives previous contacts
  const saveContacts = async (updaterOrArray) => {
    return new Promise((resolve) => {
      setContacts(prevContacts => {
        const updatedContacts = typeof updaterOrArray === 'function'
          ? updaterOrArray(prevContacts)
          : updaterOrArray;
        storage.set(KEYS.CONTACTS, updatedContacts).then(resolve);
        return updatedContacts;
      });
    });
  };

  const addContact = async (contact) => {
    const newContact = createContact(contact);
    await saveContacts(prevContacts => [...prevContacts, newContact]);
    return newContact;
  };

  const updateContact = async (contactId, updates) => {
    await saveContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, ...updates }
          : contact
      )
    );
  };

  const deleteContact = async (contactId) => {
    // SECURITY: Find contact before deleting for audit log
    const contactToDelete = contacts.find(c => c.id === contactId);

    if (!contactToDelete) {
      console.warn('Contact not found for deletion:', contactId);
      return;
    }

    // SECURITY: Soft delete - move to trash instead of permanent deletion
    await softDeleteContact(contactToDelete);

    // SECURITY: Log the deletion for audit trail
    await logAudit('DELETE_CONTACT', {
      contactId: contactToDelete.id,
      companyName: contactToDelete.companyName,
      phone: contactToDelete.phone,
      timestamp: new Date().toISOString()
    });

    // Remove from active contacts
    await saveContacts(prevContacts =>
      prevContacts.filter(contact => contact.id !== contactId)
    );
  };

  /**
   * SECURITY: Bulk delete with audit logging and soft-delete
   * @param {Array<string>} contactIds - Array of contact IDs to delete
   */
  const deleteBulkContacts = async (contactIds) => {
    // Find all contacts to delete
    const contactsToDelete = contacts.filter(c => contactIds.includes(c.id));

    if (contactsToDelete.length === 0) {
      console.warn('No contacts found for bulk deletion');
      return;
    }

    // SECURITY: Soft delete all contacts
    await softDeleteBulk(contactsToDelete);

    // SECURITY: Log bulk deletion for audit trail
    await logAudit('BULK_DELETE_CONTACTS', {
      count: contactsToDelete.length,
      contactIds: contactIds,
      contacts: contactsToDelete.map(c => ({
        id: c.id,
        companyName: c.companyName,
        phone: c.phone
      })),
      timestamp: new Date().toISOString()
    });

    // Remove from active contacts
    await saveContacts(prevContacts =>
      prevContacts.filter(contact => !contactIds.includes(contact.id))
    );
  };

  const deleteAllContacts = async () => {
    // SECURITY: Log deletion of all contacts
    await logAudit('DELETE_ALL_CONTACTS', {
      count: contacts.length,
      timestamp: new Date().toISOString()
    });

    // SECURITY: Soft delete all contacts
    if (contacts.length > 0) {
      await softDeleteBulk(contacts);
    }

    await saveContacts([]);
  };

  const addCallToHistory = async (contactId, callData) => {
    const callRecord = {
      date: new Date().toISOString(),
      outcome: callData.outcome || 'NA',
      okCode: callData.okCode || null,
      notes: callData.notes || '',
      duration: callData.duration || 0,
      hadConversation: callData.hadConversation || false,
      hadTriage: callData.hadTriage || false,
      objection: callData.objection || ''
    };

    await saveContacts(prevContacts =>
      prevContacts.map(contact => {
        if (contact.id !== contactId) return contact;

        return {
          ...contact,
          callHistory: [...contact.callHistory, callRecord],
          totalDials: contact.totalDials + 1,
          lastCall: callRecord.date,
          currentOkCode: callData.okCode || contact.currentOkCode
        };
      })
    );
  };

  const importFromCSV = async (csvText) => {
    try {
      // Handle different line endings (Windows \r\n, Unix \n, old Mac \r)
      const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        return { success: false, error: 'CSV file must have at least a header and one data row' };
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const newContactsData = [];

      // Parse all contacts first
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        if (values.length < 2 || !values[0]) {
          continue; // Skip invalid rows
        }

        newContactsData.push(createContactFromCSV(values, i));
      }

      // Batch add all contacts at once to avoid race conditions
      await saveContacts(prevContacts => [...prevContacts, ...newContactsData]);

      return { success: true, count: newContactsData.length };
    } catch (error) {
      console.error('CSV import error:', error);
      return { success: false, error: error.message };
    }
  };

  const exportToCSV = () => {
    if (contacts.length === 0) {
      return 'No contacts to export';
    }

    const headers = ['Company Name', 'Phone', 'Website', 'Address', 'LinkedIn', 'Industry', 'Total Dials', 'Last Call', 'OK Code', 'Needs Email', 'Status'];
    const rows = contacts.map(contact => [
      contact.companyName || '',
      contact.phone || '',
      contact.website || '',
      contact.address || '',
      contact.linkedin || '',
      contact.industry || '',
      contact.totalDials || 0,
      contact.lastCall ? new Date(contact.lastCall).toLocaleDateString() : '',
      contact.currentOkCode || '',
      contact.needsEmail ? 'Yes' : 'No',
      contact.status || 'active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const getActiveContacts = () => {
    return contacts.filter(c => c.status === 'active');
  };

  const getStats = () => {
    const activeContacts = getActiveContacts();
    const totalDials = contacts.reduce((sum, c) => sum + (c.totalDials || 0), 0);
    const totalCalls = contacts.reduce((sum, c) => sum + (c.callHistory?.length || 0), 0);

    const meetingsBooked = contacts.filter(c =>
      c.currentOkCode === 'OK-10'
    ).length;

    return {
      totalContacts: contacts.length,
      activeContacts: activeContacts.length,
      totalDials,
      totalCalls,
      meetingsBooked
    };
  };

  const resetAllStats = async () => {
    await saveContacts(prevContacts =>
      prevContacts.map(contact => ({
        ...contact,
        callHistory: [],
        totalDials: 0,
        lastCall: null,
        nextFollowUp: null,
        currentOkCode: null
      }))
    );
  };

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    deleteBulkContacts, // SECURITY: Bulk delete with audit logging
    deleteAllContacts,
    addCallToHistory,
    importFromCSV,
    exportToCSV,
    getActiveContacts,
    getStats,
    resetAllStats,
    reloadContacts: loadContacts,
    loading
  };
}

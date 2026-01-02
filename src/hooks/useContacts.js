import { useState, useEffect, useCallback } from 'react';
import { storage, KEYS, migrateToCloud, isCloudStorageAvailable } from '../lib/cloudStorage';
import { createContact, migrateContact, createContactFromCSV } from '../lib/contactSchema';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    await saveContacts(prevContacts =>
      prevContacts.filter(contact => contact.id !== contactId)
    );
  };

  const deleteBulkContacts = async (contactIds) => {
    const idsToDelete = new Set(contactIds);
    await saveContacts(prevContacts =>
      prevContacts.filter(contact => !idsToDelete.has(contact.id))
    );
  };

  const deleteAllContacts = async () => {
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

  // Parse a CSV row handling quoted fields properly (RFC 4180 compliant)
  const parseCSVRow = (row) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (two quotes in a row = one quote character)
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    values.push(current.trim());

    return values;
  };

  const importFromCSV = async (csvText) => {
    try {
      // Handle different line endings (Windows \r\n, Unix \n, old Mac \r)
      const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        return { success: false, error: 'CSV file must have at least a header and one data row' };
      }

      const headers = parseCSVRow(lines[0]);
      const newContactsData = [];

      // Parse all contacts first
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVRow(lines[i]);

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

  // Escape and quote a CSV field if it contains special characters (RFC 4180 compliant)
  const escapeCSVField = (field) => {
    const stringField = String(field);

    // Check if field needs quoting (contains comma, quote, or newline)
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      // Escape quotes by doubling them, then wrap in quotes
      return `"${stringField.replace(/"/g, '""')}"`;
    }

    return stringField;
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
      headers.map(escapeCSVField).join(','),
      ...rows.map(row => row.map(escapeCSVField).join(','))
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
    deleteBulkContacts,
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

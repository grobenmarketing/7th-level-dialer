import { useState, useEffect } from 'react';
import { storage, KEYS, migrateToCloud, isCloudStorageAvailable } from '../lib/cloudStorage';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load contacts from storage on mount (with automatic migration to cloud)
  useEffect(() => {
    let mounted = true;

    const loadContacts = async () => {
      try {
        setLoading(true);

        // Run migration once if in production
        if (isCloudStorageAvailable()) {
          await migrateToCloud();
        }

        // Load contacts
        const savedContacts = await storage.get(KEYS.CONTACTS, []);

        if (mounted) {
          setContacts(savedContacts);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        if (mounted) {
          setContacts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContacts();

    return () => {
      mounted = false;
    };
  }, []);

  // Save contacts to storage whenever they change
  const saveContacts = async (updatedContacts) => {
    setContacts(updatedContacts);
    await storage.set(KEYS.CONTACTS, updatedContacts);
  };

  const addContact = async (contact) => {
    const newContact = {
      id: Date.now().toString(),
      companyName: contact.companyName || '',
      phone: contact.phone || '',
      website: contact.website || '',
      address: contact.address || '',
      linkedin: contact.linkedin || '',
      industry: contact.industry || '',

      // Call History
      callHistory: [],

      // Metadata
      totalDials: 0,
      lastCall: null,
      nextFollowUp: null,
      currentOkCode: null,
      needsEmail: false,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const updatedContacts = [...contacts, newContact];
    await saveContacts(updatedContacts);
    return newContact;
  };

  const updateContact = async (contactId, updates) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, ...updates }
        : contact
    );
    await saveContacts(updatedContacts);
  };

  const deleteContact = async (contactId) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    await saveContacts(updatedContacts);
  };

  const deleteAllContacts = async () => {
    await saveContacts([]);
  };

  const addCallToHistory = async (contactId, callData) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

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

    const updates = {
      callHistory: [...contact.callHistory, callRecord],
      totalDials: contact.totalDials + 1,
      lastCall: callRecord.date,
      currentOkCode: callData.okCode || contact.currentOkCode
    };

    await updateContact(contactId, updates);
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
          // Skip invalid rows (empty or missing company name)
          continue;
        }

        const contactData = {
          id: Date.now().toString() + '-' + i,
          companyName: values[0] || '',
          phone: values[1] || '',
          website: values[2] || '',
          address: values[3] || '',
          linkedin: values[4] || '',
          industry: values[5] || '',

          // Call History
          callHistory: [],

          // Metadata
          totalDials: 0,
          lastCall: null,
          nextFollowUp: null,
          currentOkCode: null,
          needsEmail: false,
          status: 'active',
          createdAt: new Date().toISOString()
        };

        newContactsData.push(contactData);
      }

      // Batch add all contacts at once to avoid race conditions
      const updatedContacts = [...contacts, ...newContactsData];
      await saveContacts(updatedContacts);

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
      c.currentOkCode === 'OK-08'
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
    const resetContacts = contacts.map(contact => ({
      ...contact,
      callHistory: [],
      totalDials: 0,
      lastCall: null,
      nextFollowUp: null,
      currentOkCode: null
    }));
    await saveContacts(resetContacts);
  };

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    deleteAllContacts,
    addCallToHistory,
    importFromCSV,
    exportToCSV,
    getActiveContacts,
    getStats,
    resetAllStats,
    loading
  };
}

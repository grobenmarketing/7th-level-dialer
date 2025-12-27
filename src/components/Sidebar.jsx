import { useState } from 'react';
import { motion } from 'framer-motion';
import { useContacts } from '../hooks/useContacts';

function Sidebar({ currentView, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { importFromCSV } = useContacts();

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'database', icon: '📊', label: 'Database' },
    { id: 'contacts', icon: '📇', label: 'Contacts' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'howto', icon: '❓', label: 'How To Use' },
  ];

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const result = await importFromCSV(csvText);

      if (result.success) {
        alert(`Successfully imported ${result.count} contacts!`);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    e.target.value = '';
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '240px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-r7-navy text-white h-screen sticky top-0 flex flex-col shadow-lg"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg"
            >
              R7 Dialer
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 transition-colors ${
              currentView === item.id
                ? 'bg-r7-teal text-white'
                : 'hover:bg-white/10'
            }`}
            title={item.label}
          >
            <span className="text-2xl">{item.icon}</span>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      {/* Import CSV Button */}
      <div className="px-4 pb-4">
        <label className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors shadow-md`}>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <span className="text-2xl">📥</span>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-medium"
            >
              Import CSV
            </motion.span>
          )}
        </label>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-white/60 text-center"
          >
            R7 Creative Dialer v2.0
          </motion.div>
        ) : (
          <div className="text-center text-2xl">🚀</div>
        )}
      </div>
    </motion.aside>
  );
}

export default Sidebar;

import { useState } from 'react';
import { motion } from 'framer-motion';

function Sidebar({ currentView, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'contacts', icon: '📇', label: 'Contacts' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'sequenceTasks', icon: '🔄', label: 'Sequences' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'howto', icon: '❓', label: 'How To Use' },
  ];

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

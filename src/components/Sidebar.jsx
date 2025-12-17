import { useTheme } from '../hooks/useTheme';

function Sidebar({ currentView, onNavigate }) {
  const { toggleTheme, isDark } = useTheme();

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'calling', icon: '📞', label: 'Calling' },
    { id: 'contacts', icon: '📇', label: 'Contacts' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'filteredSession', icon: '🎯', label: 'Filtered' },
    { id: 'howto', icon: '📖', label: 'Guide' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <nav className="w-20 bg-black/20 dark:bg-black/40 border-r border-white/10 dark:border-white/5 backdrop-blur-xl flex flex-col items-center py-8 relative">
      {/* Logo */}
      <div className="mb-8 text-2xl font-bold text-r7-blue dark:text-r7-neon">
        R7
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              transition-all duration-200 relative group
              ${currentView === item.id
                ? 'bg-white/10 text-r7-blue dark:text-r7-neon shadow-lg shadow-r7-blue/20 dark:shadow-r7-neon/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-r7-blue dark:hover:text-r7-neon'
              }
            `}
            title={item.label}
          >
            {item.icon}
            {currentView === item.id && (
              <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-r7-blue dark:bg-r7-neon rounded-r shadow-lg shadow-r7-blue/50 dark:shadow-r7-neon/50" />
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* Theme Toggle at Bottom */}
      <button
        onClick={toggleTheme}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
          bg-white/5 hover:bg-white/10 text-gray-400 hover:text-r7-blue dark:hover:text-r7-neon
          transition-all duration-200"
        title="Toggle Theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}

export default Sidebar;

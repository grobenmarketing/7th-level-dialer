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
    <nav className="w-20 border-r backdrop-blur-xl flex flex-col items-center py-8 relative" style={{
      background: 'var(--bg-surface)',
      borderColor: 'var(--border-subtle)'
    }}>
      {/* Logo */}
      <div className="mb-8 text-2xl font-bold text-neon">
        🐺
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
            `}
            style={currentView === item.id ? {
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--neon-blue)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
            } : {
              color: 'var(--text-secondary)'
            }}
            title={item.label}
          >
            {item.icon}
            {currentView === item.id && (
              <div className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r" style={{
                background: 'var(--neon-blue)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }} />
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap" style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)'
            }}>
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* Theme Toggle at Bottom */}
      <button
        onClick={toggleTheme}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-secondary)'
        }}
        title="Toggle Theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}

export default Sidebar;

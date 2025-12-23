import Sidebar from './Sidebar';

function DashboardLayout({ children, currentView, onNavigate }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar currentView={currentView} onNavigate={onNavigate} />

      {/* Main content on the right */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;

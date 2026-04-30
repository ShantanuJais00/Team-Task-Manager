import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, CheckSquare, FolderGit2, Moon, Sun, ShieldAlert } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
  ];

  return (
    <div className="flex h-screen bg-surface transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col shadow-sm relative z-10 transition-colors duration-300">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-primary to-primary-dark p-2 rounded-xl text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
              TaskMgr
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                    : 'text-text hover:bg-surface hover:translate-x-1'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          {/* User Profile Card */}
          <div className="mb-4 p-3 rounded-xl bg-surface border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-text truncate pr-2">{user.name}</p>
              {user.role === 'Admin' && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                  <ShieldAlert className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted truncate mb-3">{user.email}</p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-background rounded-lg border border-border transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Theme
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

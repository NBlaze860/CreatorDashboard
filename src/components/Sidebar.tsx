import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bed as Feed, User, Bookmark, Settings, LogOut, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setExpanded(!expanded);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      activeColor: 'text-blue-600',
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: <Feed className="h-5 w-5" />,
      activeColor: 'text-blue-600',
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
      activeColor: 'text-blue-600',
    },
    {
      name: 'Saved Content',
      path: '/saved',
      icon: <Bookmark className="h-5 w-5" />,
      activeColor: 'text-blue-600',
    }
  ];
  
  const adminItems = [
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: <Users className="h-5 w-5" />,
      activeColor: 'text-purple-600',
    },
    {
      name: 'Reported Content',
      path: '/admin/reported',
      icon: <AlertTriangle className="h-5 w-5" />,
      activeColor: 'text-purple-600',
    }
  ];
  
  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col 
        ${expanded ? 'w-64' : 'w-16'} h-screen fixed md:relative z-20`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center text-white font-bold">
            CD
          </div>
          {expanded && <span className="text-xl font-semibold">Creator Hub</span>}
        </Link>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hidden md:block"
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center rounded-md px-3 py-2 transition-colors
                  ${isActive(item.path) 
                    ? `${item.activeColor} bg-blue-50` 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {expanded && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
          
          {/* Admin Section */}
          {isAdmin && (
            <>
              <li className="pt-4">
                {expanded && (
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </p>
                )}
              </li>
              
              {adminItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-md px-3 py-2 transition-colors
                      ${isActive(item.path) 
                        ? `${item.activeColor} bg-purple-50` 
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {expanded && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
      
      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {expanded ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={logout}
            className="w-full flex justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
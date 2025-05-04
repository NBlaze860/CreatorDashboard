import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">
              {title || 'Creator Dashboard'}
            </h1>
          </div>
          
          {/* Right side - Credits, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Credits Badge */}
            <div className="hidden md:flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <span className="mr-1">🪙</span>
              {user?.credits || 0} credits
            </div>
            
            {/* Notification Bell */}
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-sm rounded-full hover:bg-gray-100 p-1"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span className="hidden md:block font-medium">{user?.username || 'User'}</span>
              </button>
              
              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/saved"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Saved Content
                  </Link>
                  <div className="md:hidden px-4 py-2 text-sm text-gray-700">
                    <span className="font-semibold">Credits:</span> {user?.credits || 0}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const getProfileInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <nav className="site-header shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold site-logo text-gray-800">
            <span className="logo-bounce">🏠</span>
            <span style={{fontFamily: 'Poppins, Inter, sans-serif'}}>Apna PG</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 text-gray-700">
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Browse PGs
            </button>

            {isAuthenticated() ? (
              <>
                {user?.role === 'Owner' && (
                  <button
                    onClick={() => navigate('/owner-dashboard')}
                    className="px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  >
                    📊 Dashboard
                  </button>
                )}
                {user?.role === 'User' && (
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  >
                    My Bookings
                  </button>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="relative w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors font-semibold text-sm"
                    title={user?.fullName}
                  >
                    {getProfileInitials()}
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {getProfileInitials()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user?.fullName}</p>
                            <p className="text-sm text-gray-600">{user?.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="px-4 py-3 space-y-2 text-sm border-b border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-gray-800 font-medium text-xs break-all">{user?.email}</span>
                        </div>
                        {user?.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-800 font-medium">{user?.phone}</span>
                          </div>
                        )}
                        {user?.gender && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="text-gray-800 font-medium">{user?.gender}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 space-y-2">
                        <button
                          onClick={() => navigate('/profile')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
                        >
                          ⚙️ Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium transition"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  🔑 Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  ✍️ Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                navigate('/browse');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Browse PGs
            </button>
            {isAuthenticated() ? (
              <>
                {user?.role === 'Owner' && (
                  <button
                    onClick={() => {
                      navigate('/owner-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  >
                    Owner Dashboard
                  </button>
                )}
                {user?.role === 'User' && (
                  <button
                    onClick={() => {
                      navigate('/my-bookings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                  >
                    My Bookings
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  🔑 Login
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  ✍️ Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

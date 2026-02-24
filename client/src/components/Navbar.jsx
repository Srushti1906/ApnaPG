import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
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
                    Owner Dashboard
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-800 px-3 py-2">{user?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                  >
                    🚪 Logout
                  </button>
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

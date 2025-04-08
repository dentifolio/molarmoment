import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">FindOpenDentist</Link>
        <div className="space-x-4">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <button onClick={handleLogout} className="flex items-center">
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">Login</Link>
              <Link to="/signup" className="hover:text-blue-600">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
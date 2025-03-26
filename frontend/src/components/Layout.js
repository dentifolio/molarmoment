import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">FindOpenDentist</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:underline">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:underline">
                  Find a Dentist
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-grow px-4 py-8">{children}</main>
      <footer className="bg-gray-200 text-center text-sm py-4">
        © 2025 FindOpenDentist. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
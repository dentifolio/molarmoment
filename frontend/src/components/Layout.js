import React from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }) => {
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/signup', label: 'Sign Up' },
    { path: '/login', label: 'Login' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/search', label: 'Find a Dentist' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">FindOpenDentist</h1>
          <nav>
            <ul className="flex space-x-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink to={link.path} className="hover:underline" activeClassName="font-bold">
                    {link.label}
                  </NavLink>
                </li>
              ))}
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
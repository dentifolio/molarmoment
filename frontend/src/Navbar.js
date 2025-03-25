import React from 'react';
import { Link } from 'react-router-dom';
import AuthButtons from './AuthButtons';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <AuthButtons />
    </nav>
  );
};

export default Navbar;

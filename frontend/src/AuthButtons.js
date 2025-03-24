import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons = () => {
  return (
    <div>
      <Link to="/login">Login</Link>
      <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default AuthButtons;
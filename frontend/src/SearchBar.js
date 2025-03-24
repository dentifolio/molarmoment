import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ setResults }) => {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`https://findopendentist.onrender.com/search?zipCode=${zipCode}&radius=${radius}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to fetch search results.');
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <label>ZIP Code</label>
      <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
      <label>Radius (miles)</label>
      <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} required />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
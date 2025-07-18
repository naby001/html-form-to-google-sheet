import React, { useEffect, useState } from 'react';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzqUn-Y0ktte3Py_gB9XyP9mqsoTq-6j9rdkQd_KjOi7IHM2CQpUWzwYshwPQwU9IrY1Q/exec';

const HomePage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        const customerNames = data
          .map((entry) => entry['Customer Name'])
          .filter(Boolean);
        setCustomers(customerNames);
        setFilteredCustomers(customerNames);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch customer names.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = customers.filter((name) =>
      name.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Customer List</h1>
      <input
        type="text"
        placeholder="Search Customer"
        value={search}
        onChange={handleSearch}
        style={styles.searchBar}
      />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={styles.list}>
        {filteredCustomers.map((name, index) => (
          <li key={index} style={styles.listItem}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  searchBar: {
    width: '100%',
    padding: '10px',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px',
    marginBottom: '8px',
    backgroundColor: '#f2f2f2',
    borderRadius: '5px',
    textAlign: 'center',
    fontSize: '1.1rem',
  },
};

export default HomePage;

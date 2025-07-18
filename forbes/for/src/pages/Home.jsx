import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzwwDeQEjy9xVt5AjphNA7AMGNUnVfLxo0pmQj6WGLiGWOJAoG_lsnHwXgfHD8K7QMaVg/exec";

const Home = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        const customerList = data
          .map((entry) => entry["CUSTOMER NAME"])
          .filter(Boolean);
        setCustomers(customerList);
      } catch (err) {
        console.error("Error fetching customer names:", err);
        setError("Failed to fetch customer names.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleClick = (name) => {
    const encodedName = encodeURIComponent(name);
    navigate(`/form/${encodedName}`);
  };

  const filteredCustomers = customers.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Customer List</h1>
      <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={styles.list}>
        {filteredCustomers.map((name, index) => (
          <li
            key={index}
            style={styles.listItem}
            onClick={() => handleClick(name)}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  search: {
    padding: "10px",
    marginBottom: "1rem",
    width: "100%",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#f2f2f2",
    borderRadius: "5px",
    textAlign: "center",
    fontSize: "1.1rem",
    cursor: "pointer",
  },
};

export default Home;

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRFUIyK3DXM0SNx55-IV_S_GCvGfSdvVP8fkYexwQb_ItosfgRT9pBscN3i2RF0Gn2Sw/exec";

const Home = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Memoized fetch function
  const fetchCustomers = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      const customerList = data.filter(entry => entry["CUSTOMER NAME"] && entry["OA NUMBER"]);
      
      // Cache the data in localStorage
      localStorage.setItem('cachedCustomers', JSON.stringify(customerList));
      localStorage.setItem('lastFetchTime', Date.now());
      
      setCustomers(customerList);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      
      // Try to use cached data if available
      const cachedData = localStorage.getItem('cachedCustomers');
      if (cachedData) {
        setCustomers(JSON.parse(cachedData));
        setError("Using cached data. " + (err.message || "Network error"));
      } else {
        setError("Failed to fetch customer data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if we have recent cached data (less than 5 minutes old)
    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const cachedData = localStorage.getItem('cachedCustomers');
    
    if (cachedData && lastFetchTime && (Date.now() - lastFetchTime < 300000)) {
      setCustomers(JSON.parse(cachedData));
      setLoading(false);
    }
    
    // Always try to fetch fresh data in background
    fetchCustomers();
  }, [fetchCustomers]);

  const handleClick = useCallback((oaNumber) => {
    navigate(`/form/${encodeURIComponent(oaNumber)}`);
  }, [navigate]);

  const filteredCustomers = React.useMemo(() => {
    return customers.filter(entry => 
      entry["CUSTOMER NAME"].toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Customer List</h1>
      <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
        disabled={loading}
      />

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading customer data...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <ul style={styles.list}>
          {filteredCustomers.map((entry, index) => (
            <li
              key={`${entry["OA NUMBER"]}-${index}`}
              style={styles.listItem}
              onClick={() => handleClick(entry["OA NUMBER"])}
            >
              <strong>OA No: {entry["OA NUMBER"]}</strong> <br />
              <span style={styles.customerName}>{entry["CUSTOMER NAME"]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ... (keep your existing styles and animation code)

const styles = {
  container: {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#333",
    fontSize: "1.8rem",
    fontWeight: "600",
  },
  search: {
    padding: "12px 15px",
    marginBottom: "1.5rem",
    width: "100%",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    transition: "border 0.3s ease",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderLeft: "4px solid #4a6baf",
    ':hover': {
      backgroundColor: "#e9ecef",
      transform: "translateX(5px)",
    },
  },
  customerName: {
    fontSize: "0.95rem",
    color: "#555",
    display: "block",
    marginTop: "5px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #4a6baf",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: {
    color: "#666",
    fontSize: "1.1rem",
    textAlign: "center",
  },
  errorContainer: {
    padding: "2rem",
    backgroundColor: "#fff8f8",
    borderRadius: "6px",
    border: "1px solid #ffdddd",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  errorText: {
    color: "#d9534f",
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
    ':hover': {
      backgroundColor: "#c9302c",
    },
  },
};

// Add the spin animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Home;
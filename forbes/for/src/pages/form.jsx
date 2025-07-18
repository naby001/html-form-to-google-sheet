import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FETCH_URL = "https://script.google.com/macros/s/AKfycbxOD0gHGLoM1ttYf2T8rHAJX3bhVogQ7WzIKNkl5f8cM7gI9zQlnETFEjmcg8UQ1DRawA/exec";
const POST_URL = "https://script.google.com/macros/s/AKfycbwKBco8_xDcQRXn_8Q6avWTSHHRieqstsRirWW0TK6B_q-Q4kbhakeqb3iRE7PqIqyxZQ/exec";

// Utility function to format dates for input fields
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // Handle Excel serial dates (numbers)
  if (typeof dateString === 'number') {
    const date = new Date((dateString - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  // Handle string dates
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Return original if not a recognizable date
  return dateString;
};

const Form = () => {
  const { oaNumber } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const readOnlyFields = [
    "OA NUMBER", "BRANCH", "CUSTOMER NAME", "TPH", "QTY", "PRES", "BURNER", "BLR NO"
  ];

  const fieldGroups = [
    { plan: "HYDRO PLAN", actual: "HYDRO ACTUAL" },
    { plan: "CASING PLAN", actual: "CASING ACTUAL" },
    { plan: "WELDING PLAN", actual: "WELDING ACTUAL" },
    { plan: "SHEETING/INSULATION PLAN", actual: "SHEETING/INSULATION ACTUAL" },
    { plan: "REFRACTORY PLAN", actual: "REFRACTORY ACTUAL" },
    { plan: "MOUNTING PLAN", actual: "MOUNTING ACTUAL" },
    { plan: "FINAL PAINTING PLAN", actual: "FINAL PAINTING ACTUAL" },
    { plan: "READINESS PLAN", actual: "READINESS ACTUAL" }
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${FETCH_URL}?oaNumber=${encodeURIComponent(oaNumber)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      
      localStorage.setItem(`formData_${oaNumber}`, JSON.stringify(data));
      localStorage.setItem(`lastFetch_${oaNumber}`, Date.now());
      
      setFormData(data);
    } catch (err) {
      console.error("Error fetching form data:", err);
      
      const cachedData = localStorage.getItem(`formData_${oaNumber}`);
      const lastFetch = localStorage.getItem(`lastFetch_${oaNumber}`);
      
      if (cachedData && lastFetch && (Date.now() - lastFetch < 600000)) {
        setFormData(JSON.parse(cachedData));
        setError("Using cached data. " + (err.message || "Network error"));
      } else {
        setError("Failed to load form data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [oaNumber]);

  useEffect(() => {
    const cachedData = localStorage.getItem(`formData_${oaNumber}`);
    const lastFetch = localStorage.getItem(`lastFetch_${oaNumber}`);
    
    if (cachedData && lastFetch && (Date.now() - lastFetch < 600000)) {
      setFormData(JSON.parse(cachedData));
      setLoading(false);
    }
    
    fetchData();
  }, [fetchData, oaNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formBody = new URLSearchParams(formData).toString();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const text = await res.text();
      setMsg({ text: "Success: " + text, type: "success" });
      setShowToast(true);
      
      localStorage.setItem(`formData_${oaNumber}`, JSON.stringify(formData));
      localStorage.setItem(`lastFetch_${oaNumber}`, Date.now());
      
      setTimeout(() => {
        setShowToast(false);
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setMsg({ text: "Error: Failed to update. Please try again.", type: "error" });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.keys(formData).length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading customer data...</p>
      </div>
    );
  }

  if (error && Object.keys(formData).length === 0) {
    return (
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
    );
  }

  return (
    <div style={styles.pageContainer}>
      {showToast && (
        <div style={{
          ...styles.toast,
          backgroundColor: msg.type === "success" ? "#4CAF50" : "#F44336"
        }}>
          {msg.text}
        </div>
      )}
      
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            &#8592; Back to List
          </button>
          <h2 style={styles.title}>Edit Details for OA: {formData["OA NUMBER"]}</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.readOnlyGrid}>
            {readOnlyFields.map((key) => (
              formData[key] && (
                <div key={key} style={styles.formGroup}>
                  <label style={styles.label}>{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key] || ""}
                    style={styles.readOnlyInput}
                    readOnly
                  />
                </div>
              )
            ))}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Progress Tracking</h3>
            <div style={styles.fieldPairsContainer}>
              {fieldGroups.map((group) => {
                const planDate = Date.parse(formData[group.plan]);
                const actualDate = Date.parse(formData[group.actual]);
                let textColor = "#333";
                if (formData[group.plan] && formData[group.actual]) {
                  if (!isNaN(planDate) && !isNaN(actualDate)) {
                    textColor = actualDate > planDate ? "#d32f2f" : "#388e3c";
                  }
                }
                return (
                  <div key={group.plan} style={styles.fieldPair}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{group.plan}</label>
                      <input
                        type={group.plan.includes("DATE") || group.plan.includes("PLAN") ? "date" : "text"}
                        name={group.plan}
                        value={formatDateForInput(formData[group.plan])}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{group.actual}</label>
                      <input
                        type={group.actual.includes("DATE") || group.actual.includes("ACTUAL") ? "date" : "text"}
                        name={group.actual}
                        value={formatDateForInput(formData[group.actual])}
                        onChange={handleChange}
                        style={{ ...styles.input, color: textColor, fontWeight: "bold" }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {Object.keys(formData).filter(
            key => !readOnlyFields.includes(key) &&
                  !fieldGroups.some(group => group.plan === key || group.actual === key)
          ).length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Additional Information</h3>
              <div style={styles.otherFieldsGrid}>
                {Object.keys(formData)
                  .filter(key => !readOnlyFields.includes(key) &&
                                !fieldGroups.some(group => group.plan === key || group.actual === key))
                  .map((key) => (
                    <div key={key} style={styles.formGroup}>
                      <label style={styles.label}>{key}</label>
                      <input
                        type={key.includes("DATE") ? "date" : "text"}
                        name={key}
                        value={formatDateForInput(formData[key])}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={styles.spinnerSmall}></span> Updating...
                </>
              ) : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px"
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    borderBottom: "1px solid #e1e1e1",
    paddingBottom: "1rem",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  title: {
    color: "#333",
    fontSize: "1.8rem",
    margin: 0,
    flex: 1
  },
  backButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
    ':hover': {
      backgroundColor: "#e0e0e0"
    }
  },
  section: {
    marginBottom: "2rem",
    padding: "1.5rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px"
  },
  sectionTitle: {
    color: "#444",
    marginTop: "0",
    marginBottom: "1.5rem",
    fontSize: "1.3rem",
    fontWeight: "600"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  readOnlyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem"
  },
  fieldPairsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem"
  },
  otherFieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem"
  },
  fieldPair: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start"
  },
  formGroup: {
    flex: 1,
    minWidth: "0"
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#555",
    marginBottom: "0.5rem"
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    transition: "border 0.3s",
    backgroundColor: "#fff",
    boxSizing: "border-box"
  },
  readOnlyInput: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #eee",
    borderRadius: "4px",
    fontSize: "1rem",
    backgroundColor: "#f5f5f5",
    color: "#666",
    cursor: "not-allowed",
    boxSizing: "border-box"
  },
  buttonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "2rem"
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4a6baf",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
    minWidth: "150px",
    ':disabled': {
      backgroundColor: "#cccccc",
      cursor: "not-allowed"
    }
  },
  message: {
    color: "#4a6baf",
    fontSize: "0.9rem",
    margin: 0
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5"
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #4a6baf",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem"
  },
  loadingText: {
    color: "#666",
    fontSize: "1.1rem"
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    padding: "2rem",
    backgroundColor: "#f0f2f5",
    textAlign: "center"
  },
  errorIcon: {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#d32f2f"
  },
  errorText: {
    color: "#d32f2f",
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
    maxWidth: "500px"
  },
  retryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "15px 25px",
    color: "white",
    borderRadius: "4px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    animation: "fadeIn 0.3s, fadeOut 0.3s 2.7s",
  },
  spinnerSmall: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
    verticalAlign: "middle"
  }
};

// Add the spin animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
`, styleSheet.cssRules.length);

export default Form;
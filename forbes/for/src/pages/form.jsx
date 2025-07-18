import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FETCH_URL = "https://script.google.com/macros/s/AKfycbyFlXybCSp6YVOrIclUiLnsxwcwi3OGyiEVBN2RbWw4NAUcQks3OLIrNvjZ8ttXBzWUgQ/exec";
const POST_URL = "https://script.google.com/macros/s/AKfycbyrG8MEXOIOpIMMtcvnnfsWgsJvLPHP8fQ031OFfoboCBICxTjbKId6a-u6pEQsQ4EKuA/exec";

const Form = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${FETCH_URL}?name=${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [name]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formBody = new URLSearchParams(formData).toString();
      const res = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });
      const text = await res.text();
      setMsg(text);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Error submitting form:", err);
      setMsg("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading customer data...</p>
      </div>
    );
  }

  if (error) {
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
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate(-1)}
          >
            &#8592; Back to List
          </button>
          <h2 style={styles.title}>Edit Details for: {formData["CUSTOMER NAME"]}</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Read-only fields */}
          <div style={styles.readOnlyGrid}>
            {readOnlyFields.map((key) => (
              formData[key] && (
                <div key={key} style={styles.formGroup}>
                  <label style={styles.label}>{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    style={styles.readOnlyInput}
                    readOnly
                  />
                </div>
              )
            ))}
          </div>

          {/* Plan/Actual pairs with color coding */}
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
                        type="text"
                        name={group.plan}
                        value={formData[group.plan] || ""}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{group.actual}</label>
                      <input
                        type="text"
                        name={group.actual}
                        value={formData[group.actual] || ""}
                        onChange={handleChange}
                        style={{ ...styles.input, color: textColor, fontWeight: "bold" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other fields */}
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
                        type="text"
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleChange}
                        style={styles.input}
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
              {loading ? "Updating..." : "Update"}
            </button>
            {msg && <p style={styles.message}>{msg}</p>}
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

export default Form;
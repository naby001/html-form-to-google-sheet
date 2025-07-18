import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://script.google.com/macros/s/AKfycbzqUn-Y0ktte3Py_gB9XyP9mqsoTq-6j9rdkQd_KjOi7IHM2CQpUWzwYshwPQwU9IrY1Q/exec';

const defaultFormData = {
  "CUSTOMER NAME": '',
  "OA NUMBER": '',
  "BRANCH": '',
  "TPH": '',
  "QTY": '',
  "PRES": '',
  "BURNER": '',
  "BLR NO": '',
  "HYDRO PLAN": '',
  "HYDRO ACTUAL": '',
  "CASING PLAN": '',
  "CASING ACTUAL": '',
  "WELDING PLAN": '',
  "WELDING ACTUAL": '',
  "SHEETING PLAN": '',
  "SHEETING ACTUAL": '',
  "REFRACTORY PLAN": '',
  "REFRACTORY ACTUAL": '',
  "MOUNTING PLAN": '',
  "MOUNTING ACTUAL": '',
  "FINAL PAINTING PLAN": '',
  "FINAL PAINTING ACTUAL": '',
  "READINESS PLAN": '',
  "READINESS ACTUAL": '',
  "DISP.DT": '',
  "REMARK": '',
};

const Form = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (name !== 'new') {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          const match = data.find(entry => entry["CUSTOMER NAME"] === decodeURIComponent(name));
          if (match) setFormData(match);
        });
    }
  }, [name]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setStatus('✅ Data submitted successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to submit.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {name === 'new' ? 'Add New Customer' : `Edit: ${decodeURIComponent(name)}`}
      </h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={styles.inputGroup}>
            <label style={styles.label}>{key}</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        ))}
        <button type="submit" style={styles.button}>
          💾 Save Changes
        </button>
        {status && <p style={{ marginTop: '1rem', color: 'green' }}>{status}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: 'auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    marginTop: '1.5rem',
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Form;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyncgAR6ZbmlK9pE4LURb2gob0K44ahFPf7Ch0AZwH53E2QkFOTMw9TX2QyIdwFVqn6Gg/exec';

const Form = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [name]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      const text = await res.text();
      setMsg(text);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
      setMsg("Failed to update");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h2>Edit Details for: {formData["CUSTOMER NAME"]}</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>{key}</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        ))}
        <button type="submit" style={{ padding: '10px 20px' }}>Update</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default Form;

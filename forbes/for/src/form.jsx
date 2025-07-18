import React, { useState } from 'react';
import Swal from 'sweetalert2';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwSQ83GyyB8MrZ8CJLZBbVLBOlKfZqBMUo8P--8-qEZYUylk-9rredAD8Q2tm68J6KMWQ/exec';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    gender: '',
    message: '',
    age: false,
    ex: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value);
    });

    // Show success immediately
    Swal.fire('Success!', 'Form submitted successfully!', 'success');

    // Reset form immediately
    setFormData({
      name: '',
      email: '',
      contact_number: '',
      gender: '',
      message: '',
      age: false,
      ex: false,
    });

    // Submit to Google Sheets in the background
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: data }).catch(() => {
      // Optional: notify if the fetch fails
      Swal.fire('Error!', 'Data might not be recorded in the sheet.', 'error');
    });
  };

  return (
    <div className="container">
      <div className="form-container bg-white p-4 mt-5 shadow rounded mx-auto" style={{ maxWidth: '500px' }}>
        <h4 className="text-center mb-4">Form Submission to Google Sheet</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              className="form-control"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <input
              className="form-control"
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Contact Number"
              required
            />
          </div>
          <div className="form-group">
            <label>Gender:</label>
            <select
              className="form-control"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Choose...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea
              className="form-control"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              required
            />
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="age"
              name="age"
              checked={formData.age}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="age">
              Check if you are over 18 years old
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="ex"
              name="ex"
              checked={formData.ex}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="ex">
              I agree with the data terms and policies.
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FormComponent;

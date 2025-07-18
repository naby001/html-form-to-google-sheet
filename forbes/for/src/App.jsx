import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormComponent from './form';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forms" element={<FormComponent />} />
      </Routes>
    </Router>
  );
}

export default App;

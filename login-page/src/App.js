import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import WelcomePage from './components/WelcomePage'; // Import the new WelcomePage component
import FlowchartPage from './components/FlowchartPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<WelcomePage />} /> {/* Add route for WelcomePage */}
        <Route path="/flowchart" element={<FlowchartPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;

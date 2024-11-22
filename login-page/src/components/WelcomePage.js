// src/components/WelcomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
    const navigate = useNavigate();
    const handleGetStarted = () => {
        navigate('/flowchart'); // Navigate to the FlowchartPage
      };
      return (
        <div>
          <h1>WELCOME TO COST OPTIMIZATION APP</h1>
          <button onClick={handleGetStarted}>Get Started</button>
        </div>
      );
    };
export default WelcomePage;

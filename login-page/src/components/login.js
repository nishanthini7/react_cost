import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitted Username:', username);
    console.log('Submitted Password:', password);

    try {
        const response = await axios.post('http://localhost:5000/login', {
            username,
            password,
        });

        if (response.status === 200) {
            alert('Login successful');
            navigate('/welcome'); 
        }
    } catch (err) {
        console.error(err);
        if (err.response) {
            setError(err.response.data || 'Login failed');
        } else {
            setError('Network Error');
        }
    }
};

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        if (onRegister) onRegister();
      } else {
        setError(data.msg || 'Registration failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop:'2rem'}}>
      <h2 style={{marginBottom:'1rem'}}>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={{marginRight:8}}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{marginRight:8}}
      />
      <button type="submit">Register</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
    </form>
  );
}

export default RegisterForm;

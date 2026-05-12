import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="card card-centered">
      <div style={{ marginBottom: '1.4rem' }}>
        <Logo centered />
      </div>
      <h2 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>Welcome Back</h2>
      <form onSubmit={handleSubmit} className="form">
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
      </p>
    </div>
  );
};

export default Login;

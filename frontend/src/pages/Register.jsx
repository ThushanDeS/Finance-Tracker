import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card glass">
      <div style={{ marginBottom: '1.4rem' }}>
        <Logo centered />
      </div>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
      <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
        <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Register</button>
      </form>
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;

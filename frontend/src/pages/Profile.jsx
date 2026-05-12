import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '2rem' }}>User Profile</h1>
      
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          background: 'var(--primary)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'white'
        }}>
          <User size={48} />
        </div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>{user.email.split('@')[0]}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Personal Finance User</p>
        
        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <div className="flex align-center gap-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--primary)' }}><Mail size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: '500' }}>{user.email}</div>
            </div>
          </div>
          
          <div className="flex align-center gap-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--primary)' }}><ShieldCheck size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Status</div>
              <div style={{ fontWeight: '500', color: 'var(--success)' }}>Verified & Secure</div>
            </div>
          </div>

          <div className="flex align-center gap-4">
            <div style={{ color: 'var(--primary)' }}><Calendar size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Member Since</div>
              <div style={{ fontWeight: '500' }}>May 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

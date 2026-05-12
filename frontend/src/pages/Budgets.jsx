import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, AlertTriangle } from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryId: '', amount: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories')
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data.filter(c => c.type === 'Expense'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', formData);
      setFormData({ categoryId: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container">Loading Budgets...</div>;

  return (
    <div className="container">
      <h1>Budget Management</h1>

      <div className="card" style={{ marginBottom: '2rem', marginTop: '1rem', maxWidth: '500px' }}>
        <h3>Set Category Budget</h3>
        <form onSubmit={handleSubmit} className="flex gap-4" style={{ marginTop: '1rem' }}>
          <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required style={{ flex: 1 }}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input type="number" placeholder="Budget Amount (Rs.)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="0" step="0.01" style={{ width: '180px' }} />
          <button type="submit" className="btn-primary flex align-center gap-2"><Plus size={20} /> Set</button>
        </form>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {budgets.map(b => (
          <div key={b._id} className="card">
            <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{b.categoryId?.name}</h3>
              <div style={{ fontWeight: 'bold' }}>Rs. {Number(b.spentAmount).toLocaleString()} / Rs. {Number(b.amount).toLocaleString()}</div>
            </div>
            
            <div style={{ width: '100%', height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ 
                width: `${Math.min(b.progress, 100)}%`, 
                height: '100%', 
                background: b.progress > 100 ? 'var(--danger)' : 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {b.progress > 100 && (
              <div className="flex align-center gap-2" style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: '600' }}>
                <AlertTriangle size={18} /> Budget Exceeded!
              </div>
            )}
            {b.progress > 80 && b.progress <= 100 && (
              <div className="flex align-center gap-2" style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600' }}>
                <AlertTriangle size={18} /> Approaching Limit
              </div>
            )}
          </div>
        ))}
        {budgets.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No budgets set yet.</p>}
      </div>
    </div>
  );
};

export default Budgets;

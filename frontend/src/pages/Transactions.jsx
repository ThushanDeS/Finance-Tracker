import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Filter, Download } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State 
  const [formData, setFormData] = useState({
    title: '', amount: '', categoryId: '', type: 'Expense', date: new Date().toISOString().split('T')[0], note: ''
  });

  // Filter State
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '', type: '' });

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const [transRes, catRes] = await Promise.all([
        api.get(`/transactions?${queryParams}`),
        api.get('/categories')
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setFormData({ title: '', amount: '', categoryId: '', type: 'Expense', date: new Date().toISOString().split('T')[0], note: '' });
      window.dispatchEvent(new Event('budget-alerts-refresh'));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        window.dispatchEvent(new Event('budget-alerts-refresh'));
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handleExport = async () => {
    const [year, month] = reportDate.split('-');
    
    try {
      const response = await api.get(`/reports/export?month=${month}&year=${year}`, {
        responseType: 'blob',
      });
      
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const result = JSON.parse(text);
        alert(result.message || 'Export failed');
        return;
      }

      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      link.setAttribute('download', `Financial_Report_${monthName}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Export failed:', err);
      if (err.response && err.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            alert(`Export failed: ${errorData.message}`);
          } catch (e) { alert('Failed to export report'); }
        };
        reader.readAsText(err.response.data);
      } else { alert('Failed to export report'); }
    }
  };

  if (loading) return <div className="container">Loading Transactions...</div>;

  return (
    <div className="container">
      <div className="flex justify-between align-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Transactions</h1>
        <div className="card flex align-center gap-4" style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Report Month:</div>
          <input 
            type="month" 
            value={reportDate} 
            onChange={(e) => setReportDate(e.target.value)} 
            style={{ width: 'auto', padding: '0.4rem' }} 
          />
          <button onClick={handleExport} className="btn-primary flex align-center gap-2" style={{ padding: '0.5rem 1.25rem' }}>
            <Download size={18} /> Download PDF Report
          </button>
        </div>
      </div>

      <div className="flex gap-4" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Add Transaction Form */}
        <div className="card" style={{ flex: 1, minWidth: '350px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add Transaction</h3>
          <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
            <div className="flex gap-2">
              <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ flex: 1 }} />
              <input type="number" placeholder="Amount (Rs.)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required min="0" step="0.01" style={{ width: '120px' }} />
            </div>
            <div className="flex gap-2">
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ flex: 1 }}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required style={{ flex: 1 }}>
                <option value="">Select Category</option>
                {categories.filter(c => c.type === formData.type).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <textarea placeholder="Optional note" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} style={{ minHeight: '80px' }} />
            <button type="submit" className="btn-primary flex align-center justify-center gap-2" style={{ padding: '0.8rem' }}><Plus size={18} /> Add Transaction</button>
          </form>
        </div>

        {/* Filters */}
        <div className="card" style={{ flex: 1, minWidth: '350px' }}>
          <h3 className="flex align-center gap-2" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}><Filter size={18} /> Filters</h3>
          <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
            <div className="flex gap-2">
              <input type="date" placeholder="Start Date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} style={{ flex: 1 }} />
              <input type="date" placeholder="End Date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} style={{ flex: 1 }} />
            </div>
            <div className="flex gap-2">
              <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} style={{ flex: 1 }}>
                <option value="">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})} style={{ flex: 1 }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setFilters({ startDate: '', endDate: '', categoryId: '', type: '' })} style={{ background: '#f1f5f9', color: 'var(--text-muted)', padding: '0.6rem', border: '1px solid var(--border)' }}>Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...transactions]
              .sort((a, b) => {
                const dateDiff = new Date(b.date) - new Date(a.date);
                if (dateDiff !== 0) return dateDiff;
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
              })
              .map(t => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td style={{ fontWeight: '500' }}>{t.title}</td>
                <td><span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>{t.categoryId?.name}</span></td>
                <td>
                  <span className="badge" style={{ 
                    background: t.type === 'Income' ? '#dcfce7' : '#fee2e2', 
                    color: t.type === 'Income' ? 'var(--income)' : 'var(--expense)' 
                  }}>
                    {t.type}
                  </span>
                </td>
                <td style={{ fontWeight: '700' }}>Rs. {Number(t.amount).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(t._id)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No transactions found</p>}
      </div>
    </div>
  );
};

export default Transactions;

import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('Expense');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: name.trim(), type };

      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, payload);
        setMessage('Category updated successfully.');
      } else {
        await api.post('/categories', payload);
        setMessage('Category created successfully.');
      }

      setName('');
      fetchCategories();
      setEditingCategoryId(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to save category.');
    }
  };

  const startEdit = (category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setType(category.type);
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setName('');
    setType('Expense');
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete the category.')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="container">Loading Categories...</div>;

  return (
    <div className="container">
      <div className="flex justify-between align-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your income and expense classifications</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '3rem', border: '1px solid var(--primary)', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          {editingCategoryId ? 'Edit Category' : 'Create New Category'}
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="e.g. Monthly Salary, Groceries, Rent" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Expense">Expense Category</option>
              <option value="Income">Income Category</option>
            </select>
          </div>
          <button type="submit" className="btn-primary flex align-center justify-center gap-2" style={{ padding: '0.8rem 2rem' }}>
            <Plus size={18} /> {editingCategoryId ? 'Update Category' : 'Create Category'}
          </button>
          {editingCategoryId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit} style={{ padding: '0.8rem 1.5rem' }}>
              Cancel
            </button>
          )}
        </form>
        {message && <p style={{ marginTop: '1rem', color: editingCategoryId ? 'var(--primary)' : 'var(--text-muted)' }}>{message}</p>}
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Income Categories */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#f0fdf4', borderRadius: '12px 12px 0 0' }}>
            <h3 style={{ color: 'var(--income)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--income)', borderRadius: '50%' }}></span>
              Income Sources
            </h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {categories.filter(c => c.type === 'Income').length > 0 ? (
              categories.filter(c => c.type === 'Income').map(c => (
                <div key={c._id} className="flex justify-between align-center" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <span style={{ fontWeight: '500' }}>{c.name}</span>
                  <div className="flex align-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      style={{ background: 'transparent', color: '#94a3b8', padding: '0.4rem' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      style={{ background: 'transparent', color: '#cbd5e1', padding: '0.4rem' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No income categories yet</p>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#fef2f2', borderRadius: '12px 12px 0 0' }}>
            <h3 style={{ color: 'var(--expense)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--expense)', borderRadius: '50%' }}></span>
              Expense Types
            </h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {categories.filter(c => c.type === 'Expense').length > 0 ? (
              categories.filter(c => c.type === 'Expense').map(c => (
                <div key={c._id} className="flex justify-between align-center" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: '500' }}>{c.name}</span>
                  <div className="flex align-center gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      style={{ background: 'transparent', color: '#94a3b8', padding: '0.4rem' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      style={{ background: 'transparent', color: '#cbd5e1', padding: '0.4rem' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expense categories yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;


import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { Plus, Pencil, Trash2, Repeat } from 'lucide-react';

const initialFormState = {
  title: '',
  amount: '',
  categoryId: '',
  type: 'Expense',
  frequency: 'Monthly',
  startDate: new Date().toISOString().split('T')[0],
  note: '',
  isActive: true,
};

const RecurringTransactions = () => {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getRequestErrorMessage = (error, fallbackMessage) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.code === 'ERR_NETWORK') {
      return 'Cannot reach backend server. Start backend and try again.';
    }

    return fallbackMessage;
  };

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === formData.type),
    [categories, formData.type]
  );

  const fetchData = async () => {
    const [rulesResult, categoriesResult] = await Promise.allSettled([
      api.get('/recurring-transactions'),
      api.get('/categories'),
    ]);

    if (rulesResult.status === 'fulfilled') {
      setRules(rulesResult.value.data);
    } else {
      setMessage(getRequestErrorMessage(rulesResult.reason, 'Failed to load recurring rules.'));
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value.data);
    } else {
      setMessage((prev) => prev || getRequestErrorMessage(categoriesResult.reason, 'Failed to load categories.'));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!filteredCategories.some((category) => category._id === formData.categoryId)) {
      setFormData((prev) => ({
        ...prev,
        categoryId: '',
      }));
    }
  }, [filteredCategories, formData.categoryId]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingRuleId(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');

    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    try {
      if (editingRuleId) {
        await api.put(`/recurring-transactions/${editingRuleId}`, payload);
        setMessage('Recurring rule updated.');
      } else {
        await api.post('/recurring-transactions', payload);
        setMessage('Recurring rule created.');
      }

      resetForm();
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save recurring rule.');
    }
  };

  const startEdit = (rule) => {
    setEditingRuleId(rule._id);
    setFormData({
      title: rule.title,
      amount: String(rule.amount),
      categoryId: rule.categoryId?._id || '',
      type: rule.type,
      frequency: rule.frequency,
      startDate: new Date(rule.startDate).toISOString().split('T')[0],
      note: rule.note || '',
      isActive: rule.isActive,
    });
    setMessage('');
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Delete this recurring rule?')) {
      return;
    }

    try {
      await api.delete(`/recurring-transactions/${ruleId}`);
      if (editingRuleId === ruleId) {
        resetForm();
      }
      setMessage('Recurring rule deleted.');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete recurring rule.');
    }
  };

  const handleActiveToggle = async (rule) => {
    try {
      await api.put(`/recurring-transactions/${rule._id}`, { isActive: !rule.isActive });
      setMessage(`Recurring rule ${rule.isActive ? 'paused' : 'activated'}.`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update recurring rule status.');
    }
  };

  if (loading) return <div className="container">Loading recurring transactions...</div>;

  return (
    <div className="container">
      <div className="flex justify-between align-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="flex align-center gap-2"><Repeat size={22} />Recurring Transactions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Auto-create transactions on your schedule.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editingRuleId ? 'Edit recurring rule' : 'Create recurring rule'}</h3>
        <form onSubmit={handleSave} className="flex" style={{ flexDirection: 'column', gap: '0.9rem' }}>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              required
              style={{ flex: 2, minWidth: '220px' }}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
              required
              style={{ flex: 1, minWidth: '140px' }}
            />
          </div>

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <select
              value={formData.type}
              onChange={(event) => setFormData({ ...formData, type: event.target.value })}
              style={{ flex: 1, minWidth: '140px' }}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>

            <select
              value={formData.categoryId}
              onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
              required
              style={{ flex: 2, minWidth: '220px' }}
            >
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>

            <select
              value={formData.frequency}
              onChange={(event) => setFormData({ ...formData, frequency: event.target.value })}
              style={{ flex: 1, minWidth: '140px' }}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <input
              type="date"
              value={formData.startDate}
              onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
              required
              style={{ flex: 1, minWidth: '160px' }}
            />
            <label className="flex align-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minWidth: '140px' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
              />
              Active rule
            </label>
          </div>

          <textarea
            placeholder="Optional note"
            value={formData.note}
            onChange={(event) => setFormData({ ...formData, note: event.target.value })}
            style={{ minHeight: '70px' }}
          />

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <button type="submit" className="btn-primary flex align-center justify-center gap-2" style={{ minWidth: '180px' }}>
              <Plus size={18} />{editingRuleId ? 'Update Rule' : 'Create Rule'}
            </button>
            {editingRuleId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {message && (
          <div className="flex justify-between align-center" style={{ marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <p style={{ color: 'var(--danger)' }}>{message}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchData}
              style={{ padding: '0.45rem 0.9rem' }}
            >
              Retry Load
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Frequency</th>
              <th>Next Run</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule._id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{rule.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rule.categoryId?.name || 'No category'}</div>
                </td>
                <td>{rule.type}</td>
                <td>Rs. {Number(rule.amount).toLocaleString()}</td>
                <td>{rule.frequency}</td>
                <td>{new Date(rule.nextRunDate).toLocaleDateString()}</td>
                <td>
                  <span className="badge" style={{ background: rule.isActive ? '#dcfce7' : '#f1f5f9', color: rule.isActive ? 'var(--income)' : 'var(--text-muted)' }}>
                    {rule.isActive ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <button type="button" onClick={() => startEdit(rule)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleActiveToggle(rule)} style={{ background: 'transparent', color: rule.isActive ? 'var(--danger)' : 'var(--income)', fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}>
                      {rule.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button type="button" onClick={() => handleDelete(rule._id)} style={{ background: 'transparent', color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rules.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No recurring rules yet. Create one to automate repeated transactions.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;

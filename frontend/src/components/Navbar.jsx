import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ReceiptText, Wallet, Settings, LogOut, User as UserIcon, Bell, AlertTriangle, Repeat } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/api';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/budgets');
        setBudgets(res.data);
      } catch (err) {
        console.error('Failed to fetch budgets:', err);
      }
    };

    let refreshTimeoutId;
    const handleBudgetAlertsRefresh = () => {
      // Debounce rapid events during batch updates.
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = setTimeout(fetchBudgets, 150);
    };

    if (user) {
      fetchBudgets();
      // Polling fallback in case external actions update spending.
      const interval = setInterval(fetchBudgets, 10000);
      window.addEventListener('budget-alerts-refresh', handleBudgetAlertsRefresh);
      return () => {
        clearInterval(interval);
        clearTimeout(refreshTimeoutId);
        window.removeEventListener('budget-alerts-refresh', handleBudgetAlertsRefresh);
      };
    }
  }, [user]);

  const handleNotificationClick = async () => {
    // Fetch fresh budgets when opening notifications
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
    setShowNotifications((visible) => !visible);
  };

  const budgetAlerts = budgets
    .filter((budget) => Number(budget.spentAmount) > Number(budget.amount))
    .map((budget) => ({
      id: budget._id,
      categoryName: budget.categoryId?.name || 'Uncategorized',
      spentAmount: Number(budget.spentAmount || 0),
      budgetAmount: Number(budget.amount || 0),
      excessAmount: Number(budget.spentAmount || 0) - Number(budget.amount || 0),
    }));

  if (!user) return null;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Logo />

      <div className="nav-links">
        <Link to="/" className="nav-link"><LayoutDashboard size={18} /><span className="link-text">Dashboard</span></Link>
        <Link to="/transactions" className="nav-link"><ReceiptText size={18} /><span className="link-text">Transactions</span></Link>
        <Link to="/recurring-transactions" className="nav-link"><Repeat size={18} /><span className="link-text">Recurring</span></Link>
        <Link to="/budgets" className="nav-link"><Wallet size={18} /><span className="link-text">Budgets</span></Link>
        <Link to="/categories" className="nav-link"><Settings size={18} /><span className="link-text">Categories</span></Link>

        <div className="nav-divider" />

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`notif-btn${budgetAlerts.length > 0 ? ' notif-btn-alert' : ''}`}
            onClick={handleNotificationClick}
            aria-label="Budget notifications"
          >
            <Bell size={20} />
            {budgetAlerts.length > 0 && (
              <span
                className="notif-count"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                }}
              >
                {budgetAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '300px',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>Alerts</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{budgetAlerts.length} budget{budgetAlerts.length === 1 ? '' : 's'}</span>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {budgetAlerts.length > 0 ? (
                  budgetAlerts.map((alert) => (
                    <div key={alert.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.6rem', background: '#fafbfc' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef2f2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertTriangle size={14} />
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '700', marginBottom: '0.3rem', color: '#1e293b' }}>{alert.categoryName}</div>
                        <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>
                          Over by Rs. {alert.excessAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                    All budgets on track
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="profile-badge" title="Profile">
          <UserIcon size={16} /> <span className="link-text">{user.email.split('@')[0]}</span>
        </Link>

        <button onClick={logout} className="logout-btn" aria-label="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

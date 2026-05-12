import { useState, useEffect } from 'react';
import api from '../api/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transRes] = await Promise.all([
          api.get('/stats'),
          api.get('/transactions')
        ]);
        setStats(statsRes.data);
        setTransactions(transRes.data.slice(0, 5)); // Recent 5
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const chartData = [
    { name: 'Income', value: stats.totalIncome },
    { name: 'Expenses', value: stats.totalExpenses },
  ];

  const COLORS = ['#22c55e', '#f43f5e'];

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Financial Overview</h1>

      <div className="flex gap-4" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ minWidth: '250px', flex: '1' }}>
          <div className="stat-title"><ArrowUpRight size={16} color="var(--income)" /> TOTAL INCOME</div>
          <div className="stat-number" style={{ color: 'var(--income)' }}>Rs. {Number(stats.totalIncome).toLocaleString()}</div>
        </div>
        <div className="card" style={{ minWidth: '250px', flex: '1' }}>
          <div className="stat-title"><ArrowDownRight size={16} color="var(--expense)" /> TOTAL EXPENSES</div>
          <div className="stat-number" style={{ color: 'var(--expense)' }}>Rs. {Number(stats.totalExpenses).toLocaleString()}</div>
        </div>
        <div className="card" style={{ minWidth: '250px', flex: '1' }}>
          <div className="stat-title"><Wallet size={16} color="var(--primary)" /> CURRENT BALANCE</div>
          <div className="stat-number">Rs. {Number(stats.balance).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-4" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="card chart-card" style={{ flex: '2' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card transactions-card" style={{ flex: '1' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Recent Transactions</h3>
          <div>
            {transactions.map(t => (
              <div key={t._id} className="tx-row">
                <div>
                  <div className="tx-title">{t.title}</div>
                  <div className="tx-date">{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div className="tx-amount" style={{ color: t.type === 'Income' ? 'var(--income)' : 'var(--expense)' }}>
                  {t.type === 'Income' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem' }}>No recent transactions</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


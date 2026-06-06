import React, { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { reportService } from '../services/reportService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const sortMonthLabels = (labels) => {
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return [...labels].sort((a, b) => {
    const [ma, ya] = a.split(' ');
    const [mb, yb] = b.split(' ');
    const yearDiff = parseInt(ya, 10) - parseInt(yb, 10);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder.indexOf(ma) - monthOrder.indexOf(mb);
  });
};

const Reports = () => {
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState({ spendByMonth: {}, avgDays: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [summaryResponse, trendResponse] = await Promise.all([
          reportService.getSpendingSummary({}),
          reportService.getProcurementTrends(12)
        ]);

        if (summaryResponse?.success) {
          setSummary(summaryResponse.data);
        }
        if (trendResponse?.success) {
          setTrends({
            spendByMonth: trendResponse.data?.spendByMonth || {},
            avgDays: trendResponse.data?.averageRfqToPoDays || 0
          });
        }
      } catch (err) {
        console.error('Unable to load report data:', err);
        setError('Unable to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const spendByCategory = summary?.spendByCategory || {};
  const categoryLabels = Object.keys(spendByCategory);
  const categoryValues = categoryLabels.map((label) => parseFloat(spendByCategory[label] || 0));
  const spendByMonth = trends.spendByMonth || {};
  const monthLabels = sortMonthLabels(Object.keys(spendByMonth));
  const monthValues = monthLabels.map((label) => parseFloat(spendByMonth[label] || 0));

  const barChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['IT', 'Furniture', 'Logistics', 'Construction', 'Stationery'],
    datasets: [
      {
        label: 'Spend by Category (₹)',
        data: categoryValues.length > 0 ? categoryValues : [4.5, 2.1, 1.8, 3.2, 0.8],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const categoryEntries = Object.entries(spendByCategory).sort((a, b) => parseFloat(b[1] || 0) - parseFloat(a[1] || 0));
  const doughnutLabels = categoryEntries.slice(0, 5).map(([label]) => label);
  const doughnutValues = categoryEntries.slice(0, 5).map(([_, value]) => parseFloat(value || 0));

  const doughnutData = {
    labels: doughnutLabels.length > 0 ? doughnutLabels : ['IT', 'Furniture', 'Logistics'],
    datasets: [
      {
        data: doughnutValues.length > 0 ? doughnutValues : [65, 25, 10],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f8fafc' }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f8fafc' }
      },
    },
    cutout: '70%'
  };

  return (
    <div className="reports-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Procurement Insights</p>
          <h1>Reports</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button className="btn btn-secondary">
            <Filter size={18} /> Filters
          </button>
          <button className="btn btn-primary">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel py-16 text-center">
          <span className="spinner"></span>
        </div>
      ) : (
        <>
          {error && <div className="alert alert-danger mb-6">{error}</div>}

          <div className="grid grid-cols-4 mb-6 gap-4">
            <div className="glass-panel p-6 text-center">
              <h2 className="text-3xl text-primary mb-2">₹ {summary?.totalSpend ? parseFloat(summary.totalSpend).toLocaleString() : '0'}</h2>
              <p className="text-muted mb-0">Total Spend</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <h2 className="text-3xl text-secondary mb-2">{Object.keys(spendByCategory).length}</h2>
              <p className="text-muted mb-0">Spend Categories</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <h2 className="text-3xl text-success mb-2">{Object.keys(summary?.spendByVendor || {}).length}</h2>
              <p className="text-muted mb-0">Active Vendors</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <h2 className="text-3xl text-danger mb-2">{monthValues.length || 0}</h2>
              <p className="text-muted mb-0">Months Captured</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 glass-panel p-6">
              <div className="flex justify-between items-center mb-4">
                <h3>Spend by Category</h3>
                <span className="text-muted">Last 12 months</span>
              </div>
              <div style={{ height: '320px' }}>
                <Bar options={chartOptions} data={barChartData} />
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="mb-4">Invoice Status Breakdown</h3>
              <div style={{ height: '320px' }}>
                <Doughnut options={doughnutOptions} data={doughnutData} />
              </div>
              <div className="mt-6 text-sm text-muted">
                <p>Average RFQ to PO cycle: <strong>{parseFloat(trends.avgDays || 0).toFixed(0)} days</strong></p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 mt-6">
            <h3 className="mb-4">Spend Trend</h3>
            <div style={{ height: '260px' }}>
              <Bar options={chartOptions} data={{ labels: monthLabels.length > 0 ? monthLabels : ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Monthly Spend', data: monthValues.length > 0 ? monthValues : [1.1, 2.4, 3.0], backgroundColor: 'rgba(96, 165, 250, 0.85)' }] }} />
            </div>
          </div>
        </>
      )}

      <style>{`
        .w-auto { width: auto; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .p-6 { padding: 1.5rem; }
        .text-3xl { font-size: 1.875rem; font-weight: 700; }
        .gap-6 { gap: 1.5rem; }
        .col-span-2 { grid-column: span 2 / span 2; }
      `}</style>
    </div>
  );
};

export default Reports;

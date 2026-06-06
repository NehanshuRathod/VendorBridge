import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage, getList, getPayload } from '../services/api';
import { dashboardService } from '../services/dashboardService';
import { poService } from '../services/poService';
import { AuthContext } from '../context/AuthContext';
import { 
  FileText, 
  CheckCircle, 
  ShoppingCart, 
  AlertCircle 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeRfqs: 0,
    pendingApprovals: 0,
    posThisMonth: 0,
    overdueInvoices: 0,
    totalVendors: 0,
    unreadNotifications: 0,
    poSummary: {},
    invoiceSummary: {}
  });

  const [trendData, setTrendData] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [recentPos, setRecentPos] = useState([]);
  const { hasRole } = React.useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, trendDataResponse, poData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getSpendingTrends(6),
          poService.getAllPOs({ size: 3, sort: 'createdAt,desc' })
        ]);

        setStats(getPayload(statsData) || statsData?.data || statsData || {});

        const spendByMonth = getPayload(trendDataResponse)?.spendByMonth || trendDataResponse?.data?.spendByMonth || {};
        const labels = Object.keys(spendByMonth);
        const values = labels.map((label) => parseFloat(spendByMonth[label] || 0));
        setTrendData({ labels, values });

        setRecentPos(getList(poData));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalSpend = parseFloat(stats.poSummary?.totalValue || stats.invoiceSummary?.totalValue || 0);
  const overdueInvoices = stats.invoiceSummary?.overdueCount ?? stats.overdueInvoices;
  const chartData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Spend Trend',
        data: trendData.values.length > 0 ? trendData.values : [2.1, 1.8, 3.2, 2.5, 4.1, 2.3],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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

  return (
    <div className="dashboard animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3>Today's Overview</h3>
          <p className="mb-0">Here's what's happening in your procurement process</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {hasRole(['ADMIN', 'PROCUREMENT_OFFICER']) && (
            <>
              <Link to="/rfqs" className="btn btn-primary">
                + New RFQ
              </Link>
              <Link to="/vendors" className="btn btn-secondary">
                Add Vendor
              </Link>
            </>
          )}
          {hasRole('MANAGER') && (
            <Link to="/approvals" className="btn btn-primary">
              Review Approvals
            </Link>
          )}
          {hasRole('VENDOR_USER') && (
            <>
              <Link to="/quotations" className="btn btn-primary">
                Submit Quotation
              </Link>
              <Link to="/purchase-orders" className="btn btn-secondary">
                View Orders
              </Link>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-4 mb-8">
            <div className="glass-panel stat-card">
              <div className="stat-icon bg-primary-light text-primary">
                <FileText size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Active RFQ's</p>
                <h2 className="stat-value">{stats.activeRfqs}</h2>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-icon bg-warning-light text-warning">
                <CheckCircle size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Pending Approvals</p>
                <h2 className="stat-value">{stats.pendingApprovals}</h2>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-icon bg-success-light text-success">
                <ShoppingCart size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">PO's this month</p>
                <h2 className="stat-value">₹ {(stats.posThisMonth / 100000).toFixed(1)}L</h2>
              </div>
            </div>
            
            <div className="glass-panel stat-card">
              <div className="stat-icon bg-danger-light text-danger">
                <AlertCircle size={24} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Overdue Invoices</p>
                <h2 className="stat-value">{stats.overdueInvoices}</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="col-span-2 glass-panel">
              <h3 className="mb-4">Spending Trends (Last 6 Months)</h3>
              <div style={{ height: '300px' }}>
                <Line options={chartOptions} data={chartData} />
              </div>
            </div>

            <div className="glass-panel">
              <h3 className="mb-4">Recent Purchase Orders</h3>
              <div className="recent-pos">
                {recentPos.length > 0 ? recentPos.map(po => (
                  <div className="po-item" key={po.id}>
                    <div className="po-info">
                      <h4>{po.poNumber || `PO-${po.id.substring(0,8)}`}</h4>
                      <p>{po.vendorName || po.vendor?.name || 'Unknown Vendor'}</p>
                    </div>
                    <div className="po-status text-right">
                      <h4>₹ {po.totalAmount ? po.totalAmount.toLocaleString() : '0'}</h4>
                      <span className={`badge badge-${po.status === 'APPROVED' ? 'success' : po.status === 'PENDING' ? 'warning' : 'primary'}`}>
                        {po.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted text-center py-4">No recent purchase orders.</p>
                )}
              </div>
              <Link to="/purchase-orders" className="btn btn-outline w-full mt-4">
                View All PO's
              </Link>
            </div>
          </div>
        </>
      )}

      <style>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-primary-light { background: var(--primary-light); }
        .text-primary { color: var(--primary); }
        .bg-warning-light { background: var(--warning-light); }
        .text-warning { color: var(--warning); }
        .bg-success-light { background: var(--success-light); }
        .text-success { color: var(--success); }
        .bg-danger-light { background: var(--danger-light); }
        .text-danger { color: var(--danger); }

        .stat-details h2 {
          margin: 0;
          font-size: 2rem;
        }

        .stat-label {
          margin: 0;
          font-size: 0.875rem;
        }

        .col-span-2 {
          grid-column: span 2 / span 2;
        }

        .po-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .po-item:last-child {
          border-bottom: none;
        }

        .po-info h4, .po-status h4 {
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .po-info p {
          margin-bottom: 0;
          font-size: 0.875rem;
        }

        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

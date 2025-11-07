import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color, bg, to }) => (
  <div className="col-md-6 col-xl-3 mb-4">
    <Link to={to} className="text-decoration-none">
      <div className={`card stat-card shadow-sm h-100`}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className="stat-icon" style={{ background: bg }}>
            <i className={`bi ${icon}`} style={{ color }}></i>
          </div>
          <div>
            <div className="fw-bold fs-4">{value ?? '—'}</div>
            <div className="text-muted small">{label}</div>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

const statusBadge = (status) => {
  const map = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };
  return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
      <p className="text-muted mt-2">Loading dashboard...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-muted small">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="row">
        <StatCard icon="bi-box-seam" label="Total Products" value={data?.totalProducts}
          color="#0d6efd" bg="#e7f1ff" to="/products" />
        <StatCard icon="bi-tag" label="Categories" value={data?.totalCategories}
          color="#6f42c1" bg="#f0ebff" to="/products" />
        <StatCard icon="bi-receipt" label="Total Orders" value={data?.totalOrders}
          color="#198754" bg="#d1f2e4" to="/orders" />
        <StatCard icon="bi-clock-history" label="Pending Orders" value={data?.pendingOrders}
          color="#fd7e14" bg="#fff3e0" to="/orders" />
      </div>

      {data?.lowStockCount > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>
            <strong>{data.lowStockCount} product{data.lowStockCount > 1 ? 's' : ''}</strong> running low on stock.{' '}
            <Link to="/stock-alerts" className="alert-link">View all alerts →</Link>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-exclamation-circle text-warning me-2"></i>
                Low Stock Products
              </h6>
              <Link to="/stock-alerts" className="btn btn-sm btn-outline-warning">View All</Link>
            </div>
            <div className="card-body p-0">
              {data?.lowStockProducts?.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check-circle fs-3 text-success"></i>
                  <p className="mb-0 mt-2">All products are well-stocked</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.lowStockProducts?.slice(0, 6).map(p => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.name}</td>
                          <td><code className="small">{p.sku}</code></td>
                          <td>
                            <span className="badge bg-danger low-stock-badge">{p.quantity}</span>
                          </td>
                          <td className="text-muted">{p.lowStockThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between py-3">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-receipt text-primary me-2"></i>
                Recent Orders
              </h6>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {data?.recentOrders?.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3"></i>
                  <p className="mb-0 mt-2">No orders yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentOrders?.map(o => (
                        <tr key={o.id}>
                          <td><code className="small">{o.orderNumber}</code></td>
                          <td className="fw-semibold">{o.customerName}</td>
                          <td>${o.totalAmount?.toFixed(2)}</td>
                          <td>{statusBadge(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

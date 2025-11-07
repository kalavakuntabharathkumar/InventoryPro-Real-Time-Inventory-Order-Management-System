import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StockAlerts = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    api.get('/products/low-stock')
      .then(res => setProducts(res.data))
      .catch(() => setError('Failed to load stock alerts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const startEdit = (p) => {
    setEditId(p.id);
    setEditQty(String(p.quantity));
  };

  const saveQty = async (product) => {
    setSaving(true);
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        quantity: parseInt(editQty),
        lowStockThreshold: product.lowStockThreshold,
        categoryId: product.categoryId || null,
      });
      setEditId(null);
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  const urgencyLevel = (qty, threshold) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'danger', icon: 'bi-x-circle-fill' };
    const ratio = qty / threshold;
    if (ratio <= 0.3) return { label: 'Critical', color: 'danger', icon: 'bi-exclamation-circle-fill' };
    if (ratio <= 0.6) return { label: 'Warning', color: 'warning', icon: 'bi-exclamation-triangle-fill' };
    return { label: 'Low', color: 'info', icon: 'bi-info-circle-fill' };
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="page-title">Stock Alerts</h1>
          <p className="text-muted mb-0">Products at or below their reorder threshold</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={fetchAlerts}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && products.length === 0 && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-check-circle fs-1 text-success d-block mb-3"></i>
            <h5 className="fw-bold text-success">All Clear!</h5>
            <p className="text-muted mb-0">All products are adequately stocked. No alerts at this time.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : products.length > 0 && (
        <>
          <div className="alert alert-warning d-flex align-items-start mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2 mt-1 fs-5"></i>
            <div>
              <strong>{products.length} product{products.length > 1 ? 's' : ''}</strong> require attention.
              {isAdmin() && ' Update stock quantities by clicking the edit button.'}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Threshold</th>
                      <th>Urgency</th>
                      {isAdmin() && <th>Update Stock</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const urgency = urgencyLevel(p.quantity, p.lowStockThreshold);
                      return (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.name}</td>
                          <td><code className="small">{p.sku}</code></td>
                          <td>{p.categoryName
                            ? <span className="badge bg-secondary bg-opacity-10 text-dark">{p.categoryName}</span>
                            : '—'}</td>
                          <td>
                            <span className={`badge bg-${urgency.color} low-stock-badge fs-6`}>{p.quantity}</span>
                          </td>
                          <td className="text-muted">{p.lowStockThreshold}</td>
                          <td>
                            <span className={`badge bg-${urgency.color}`}>
                              <i className={`bi ${urgency.icon} me-1`}></i>
                              {urgency.label}
                            </span>
                          </td>
                          {isAdmin() && (
                            <td>
                              {editId === p.id ? (
                                <div className="d-flex gap-2 align-items-center">
                                  <input
                                    type="number" className="form-control form-control-sm" style={{ width: 80 }}
                                    min="0" value={editQty} onChange={e => setEditQty(e.target.value)}
                                  />
                                  <button className="btn btn-sm btn-success" onClick={() => saveQty(p)} disabled={saving}>
                                    {saving ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check"></i>}
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditId(null)}>
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(p)}>
                                  <i className="bi bi-pencil me-1"></i>Restock
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer text-muted small bg-white">
              {products.length} alert{products.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StockAlerts;

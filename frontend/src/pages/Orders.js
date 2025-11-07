import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS = {
  PENDING: 'warning', PROCESSING: 'primary', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger'
};

const emptyForm = { customerName: '', customerEmail: '', notes: '', items: [] };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const url = filterStatus ? `/orders?status=${filterStatus}` : '/orders';
    api.get(url)
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, items: [{ productId: '', quantity: 1 }] });
    setFormError('');
    setShowModal(true);
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', quantity: 1 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.items.length === 0 || form.items.some(it => !it.productId)) {
      setFormError('All order items must have a product selected.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.post('/orders', {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        notes: form.notes,
        items: form.items.map(it => ({ productId: parseInt(it.productId), quantity: parseInt(it.quantity) })),
      });
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      fetchOrders();
      setShowDetailModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getProduct = (id) => products.find(p => String(p.id) === String(id));

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1"></i> New Order
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="d-flex gap-2 flex-wrap">
            <button className={`btn btn-sm ${filterStatus === '' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus('')}>All</button>
            {STATUS_OPTIONS.map(s => (
              <button key={s}
                className={`btn btn-sm btn-${filterStatus === s ? STATUS_COLORS[s] : `outline-${STATUS_COLORS[s]}`}`}
                onClick={() => setFilterStatus(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-receipt fs-1 d-block mb-2"></i>No orders found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(o)}>
                      <td><code className="small">{o.orderNumber}</code></td>
                      <td>
                        <div className="fw-semibold">{o.customerName}</div>
                        {o.customerEmail && <div className="text-muted small">{o.customerEmail}</div>}
                      </td>
                      <td>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                      <td className="fw-semibold">${parseFloat(o.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="text-muted small">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="text-end" onClick={e => e.stopPropagation()}>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 140 }}
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value)}
                          disabled={o.status === 'CANCELLED' || o.status === 'DELIVERED'}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer text-muted small bg-white">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">New Order</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger small py-2">{formError}</div>}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Customer Name *</label>
                      <input type="text" className="form-control" required
                        value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Customer Email</label>
                      <input type="email" className="form-control"
                        value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea className="form-control" rows={2}
                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 fw-bold">Order Items</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
                      <i className="bi bi-plus"></i> Add Item
                    </button>
                  </div>

                  {form.items.map((item, i) => {
                    const prod = getProduct(item.productId);
                    return (
                      <div key={i} className="row g-2 mb-2 align-items-center">
                        <div className="col-6">
                          <select className="form-select form-select-sm" required
                            value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                            <option value="">Select product</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} (stock: {p.quantity})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-2">
                          <input type="number" className="form-control form-control-sm" min="1"
                            max={prod?.quantity || 9999} value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', e.target.value)} />
                        </div>
                        <div className="col-3 text-muted small">
                          {prod ? `$${(prod.price * item.quantity).toFixed(2)}` : ''}
                        </div>
                        <div className="col-1">
                          <button type="button" className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Creating...</> : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Order — <code>{selectedOrder.orderNumber}</code>
                </h5>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Customer:</strong> {selectedOrder.customerName}</p>
                    {selectedOrder.customerEmail && <p className="mb-1"><strong>Email:</strong> {selectedOrder.customerEmail}</p>}
                    {selectedOrder.notes && <p className="mb-1"><strong>Notes:</strong> {selectedOrder.notes}</p>}
                  </div>
                  <div className="col-md-6 text-md-end">
                    <span className={`badge bg-${STATUS_COLORS[selectedOrder.status]} fs-6`}>{selectedOrder.status}</span>
                    <p className="text-muted small mt-1">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th className="text-end">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td><code className="small">{item.productSku}</code></td>
                        <td>{item.quantity}</td>
                        <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td className="text-end fw-semibold">${parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">Total:</td>
                      <td className="text-end fw-bold fs-5">${parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="modal-footer">
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <button className="btn btn-outline-danger" onClick={() => handleCancel(selectedOrder.id)}>
                    <i className="bi bi-x-circle me-1"></i>Cancel Order
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;

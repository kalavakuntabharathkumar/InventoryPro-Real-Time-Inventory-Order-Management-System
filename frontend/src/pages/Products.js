import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', sku: '', description: '', price: '', quantity: '', lowStockThreshold: 10, categoryId: '' };

const Products = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      filterCategory ? api.get(`/products?categoryId=${filterCategory}`)
        : search ? api.get(`/products?search=${encodeURIComponent(search)}`)
        : api.get('/products'),
      api.get('/categories'),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data);
      setCategories(cRes.data);
    }).catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, [search, filterCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku || '', description: p.description || '',
      price: p.price, quantity: p.quantity, lowStockThreshold: p.lowStockThreshold,
      categoryId: p.categoryId || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        lowStockThreshold: parseInt(form.lowStockThreshold),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="page-title">Products</h1>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text" className="form-control" placeholder="Search products..."
                  value={search} onChange={e => { setSearch(e.target.value); setFilterCategory(''); }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setSearch(''); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setFilterCategory(''); }}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
              No products found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    {isAdmin() && <th className="text-end">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        {p.description && <div className="text-muted small" style={{ maxWidth: 200 }}>{p.description.substring(0, 60)}{p.description.length > 60 ? '...' : ''}</div>}
                      </td>
                      <td><code className="small">{p.sku}</code></td>
                      <td>{p.categoryName ? <span className="badge bg-secondary bg-opacity-10 text-dark">{p.categoryName}</span> : '—'}</td>
                      <td className="fw-semibold">${parseFloat(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'bg-danger' : p.lowStock ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td>
                        {p.lowStock
                          ? <span className="badge bg-danger low-stock-badge">Low Stock</span>
                          : <span className="badge bg-success-subtle text-success">In Stock</span>}
                      </td>
                      {isAdmin() && (
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary btn-action me-1" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(p.id, p.name)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer text-muted small bg-white">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editProduct ? 'Edit Product' : 'Add Product'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger small py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Product Name *</label>
                      <input type="text" className="form-control" required
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">SKU</label>
                      <input type="text" className="form-control" placeholder="Auto-generated if empty"
                        value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea className="form-control" rows={2}
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Price ($) *</label>
                      <input type="number" className="form-control" step="0.01" min="0.01" required
                        value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Quantity *</label>
                      <input type="number" className="form-control" min="0" required
                        value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Low Stock Threshold</label>
                      <input type="number" className="form-control" min="0"
                        value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select className="form-select"
                        value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;

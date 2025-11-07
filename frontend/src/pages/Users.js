import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const emptyForm = { username: '', password: '', email: '', fullName: '', role: 'STAFF' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => {
    setEditUser(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', email: u.email || '', fullName: u.fullName, role: u.role });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser && !form.password) {
      setFormError('Password is required for new users.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      fetchUsers();
    } catch {
      alert('Failed to update user status.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-person-plus me-1"></i> Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                               style={{ width: 36, height: 36, minWidth: 36 }}>
                            <i className="bi bi-person text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{u.fullName}</div>
                            <div className="text-muted small">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{u.email || '—'}</td>
                      <td>
                        <span className={`badge badge-role-${u.role?.toLowerCase()}`}>{u.role}</span>
                      </td>
                      <td>
                        {u.active
                          ? <span className="badge bg-success">Active</span>
                          : <span className="badge bg-secondary">Inactive</span>}
                      </td>
                      <td className="text-muted small">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary btn-action me-1" onClick={() => openEdit(u)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className={`btn btn-sm btn-action me-1 ${u.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggle(u.id)}
                          title={u.active ? 'Deactivate' : 'Activate'}>
                          <i className={`bi ${u.active ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(u.id, u.fullName)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer text-muted small bg-white">{users.length} user{users.length !== 1 ? 's' : ''}</div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editUser ? 'Edit User' : 'Add User'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger small py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input type="text" className="form-control" required
                        value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Username *</label>
                      <input type="text" className="form-control" required disabled={!!editUser}
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Password {editUser && <span className="text-muted fw-normal">(leave blank to keep)</span>}
                      </label>
                      <input type="password" className="form-control"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        required={!editUser} />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Email</label>
                      <input type="email" className="form-control"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Role *</label>
                      <select className="form-select"
                        value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : 'Save User'}
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

export default Users;

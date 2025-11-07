import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar d-flex flex-column">
      <div className="sidebar-brand">
        <h5>
          <i className="bi bi-boxes me-2"></i>
          InventoryPro
        </h5>
        <small>Inventory Management</small>
      </div>

      <nav className="flex-grow-1 py-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-box-seam"></i>
              Products
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-receipt"></i>
              Orders
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/stock-alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-exclamation-triangle"></i>
              Stock Alerts
            </NavLink>
          </li>
          {isAdmin() && (
            <li className="nav-item">
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-people"></i>
                Users
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <div className="d-flex align-items-center mb-2">
          <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-2"
               style={{ width: 36, height: 36 }}>
            <i className="bi bi-person text-white"></i>
          </div>
          <div>
            <div className="text-white fw-semibold" style={{ fontSize: '0.85rem' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-sm btn-outline-light w-100" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;

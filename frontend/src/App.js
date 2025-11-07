import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import StockAlerts from './pages/StockAlerts';
import Users from './pages/Users';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <div className="main-content">
      {children}
    </div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <Layout><Products /></Layout>
            </PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute>
              <Layout><Orders /></Layout>
            </PrivateRoute>
          } />
          <Route path="/stock-alerts" element={
            <PrivateRoute>
              <Layout><StockAlerts /></Layout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <Layout><Users /></Layout>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

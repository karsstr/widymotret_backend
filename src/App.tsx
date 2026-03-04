import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import AdminLogin from './pages/admin/AdminLogin';
import AdminHome from './pages/admin/AdminHome';
import AdminPricelist from './pages/admin/AdminPricelist';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminGuard from './components/AdminGuard';

const App: Component = () => {
  return (
    <Router>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/pricelist/:slug" component={ServiceDetail} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/about" component={About} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/home" component={() => (
        <AdminGuard>
          <AdminHome />
        </AdminGuard>
      )} />
      <Route path="/admin/pricelist" component={() => (
        <AdminGuard>
          <AdminPricelist />
        </AdminGuard>
      )} />
      <Route path="/admin/portfolio" component={() => (
        <AdminGuard>
          <AdminPortfolio />
        </AdminGuard>
      )} />
    </Router>
  );
};

export default App;

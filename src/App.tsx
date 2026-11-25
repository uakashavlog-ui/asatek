/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { HomePage } from './components/public/HomePage';
import { ProductsPage } from './components/public/ProductsPage';
import { ProductDetailPage } from './components/public/ProductDetailPage';
import { OrderFormPage } from './components/public/OrderFormPage';
import { OrderConfirmationPage } from './components/public/OrderConfirmationPage';
import { OrderTrackingPage } from './components/public/OrderTrackingPage';
import { ServiceCentersPage } from './components/public/ServiceCentersPage';
import { ReviewsPage } from './components/public/ReviewsPage';
import { FaqPage } from './components/public/FaqPage';
import { AboutContactPage } from './components/public/AboutContactPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { AdminOrdersPage } from './components/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './components/admin/AdminOrderDetailPage';
import { AdminProductsPage } from './components/admin/AdminProductsPage';
import { AdminProductFormPage } from './components/admin/AdminProductFormPage';
import { AdminReviewsPage } from './components/admin/AdminReviewsPage';
import { AdminServiceCentersPage } from './components/admin/AdminServiceCentersPage';
import { AdminFaqPage } from './components/admin/AdminFaqPage';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';

const AppRouter: React.FC = () => {
  const { route, isAdminAuthenticated, authLoading } = useStore();

  if (route.startsWith('admin-')) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4" dir="ltr">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
              progress_activity
            </span>
            <span>Verifying administrator session...</span>
          </div>
        </div>
      );
    }

    if (route === 'admin-login' || !isAdminAuthenticated) {
      return <AdminLoginPage />;
    }

    return (
      <AdminLayout>
        {route === 'admin-dashboard' && <AdminDashboardPage />}
        {route === 'admin-orders' && <AdminOrdersPage />}
        {route === 'admin-order-detail' && <AdminOrderDetailPage />}
        {route === 'admin-products' && <AdminProductsPage />}
        {route === 'admin-product-form' && <AdminProductFormPage />}
        {route === 'admin-reviews' && <AdminReviewsPage />}
        {route === 'admin-service-centers' && <AdminServiceCentersPage />}
        {route === 'admin-faq' && <AdminFaqPage />}
        {route === 'admin-settings' && <AdminSettingsPage />}
      </AdminLayout>
    );
  }

  return (
    <PublicLayout>
      {route === 'home' && <HomePage />}
      {route === 'products' && <ProductsPage />}
      {route === 'product-detail' && <ProductDetailPage />}
      {route === 'order-form' && <OrderFormPage />}
      {route === 'order-confirmation' && <OrderConfirmationPage />}
      {route === 'track-order' && <OrderTrackingPage />}
      {route === 'service-centers' && <ServiceCentersPage />}
      {route === 'reviews' && <ReviewsPage />}
      {route === 'faq' && <FaqPage />}
      {route === 'contact' && <AboutContactPage />}
    </PublicLayout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}

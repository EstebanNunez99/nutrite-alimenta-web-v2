//verificado
//frontend/src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Importaciones de Páginas ---
const AuthPage = React.lazy(() => import('../pages/AuthPage'));
const HomePage = React.lazy(() => import('../pages/HomePage'));
const ProductsPage = React.lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('../pages/ProductDetailPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('../pages/AdminProductsPage'));
const AdminSalesHistoryPage = React.lazy(() => import('../pages/AdminSalesHistoryPage'));
const AdminShippingConfigPage = React.lazy(() => import('../pages/AdminShippingConfigPage'));
const AdminCreateManualOrderPage = React.lazy(() => import('../pages/AdminCreateManualOrderPage'));
// --- CAMBIO ---
// const AdminUsersPage = React.lazy(() => import('../pages/AdminUsersPage')); // <-- Eliminado
const CreateProductPage = React.lazy(() => import('../pages/CreateProductPage'));
const EditProductPage = React.lazy(() => import('../pages/EditProductPage'));
// --- CAMBIO ---
const ProfilePage = React.lazy(() => import('../pages/ProfilePage')); // <-- Reactivado
const CartPage = React.lazy(() => import('../pages/CartPage'));
const OrderDetailPage = React.lazy(() => import('../pages/OrderDetailPage'));
const CheckoutPage = React.lazy(() => import('../pages/CheckoutPage'));
// const MyOrdersPage = React.lazy(() => import('../pages/MyOrdersPage')); // <-- Eliminado
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const OrderTrackingPage = React.lazy(() => import('../pages/OrderTrackingPage'));
// --- FIN CAMBIO ---

// Componentes de ruteo (Guardianes)
import GuestRoute from '../components/routing/GuestRoute';
import PrivateRoute from '../components/routing/PrivateRoute';
import AdminRoute from '../components/routing/AdminRoute';

const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas (accesibles por todos) --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orden/:id" element={<OrderDetailPage />} />
            <Route path="/seguimiento" element={<OrderTrackingPage />} /> 
            
            {/* --- Rutas solo para Invitados (no logueados) --- */}
            <Route element={<GuestRoute />}>
                {/* Esta es ahora la página de LOGIN DE ADMIN */}
                <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* --- Rutas Privadas (solo para usuarios logueados) --- */}
            <Route element={<PrivateRoute />}>
                
                {/* --- CAMBIO: Reactivamos el perfil del Admin --- */}
                <Route path="/perfil" element={<ProfilePage />} />
                {/* --- FIN CAMBIO --- */}
                
                {/* Rutas de Admin (Se mantienen sin cambios) */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    {/* --- CAMBIO --- */}
                    {/* <Route path="users" element={<AdminUsersPage />} /> */} {/* <-- Eliminado */}
                    {/* --- FIN CAMBIO --- */}
                    <Route path="products/create" element={<CreateProductPage />} />
                    <Route path="products/edit/:id" element={<EditProductPage />} />
                    <Route path="sales-history" element={<AdminSalesHistoryPage />} />
                    <Route path="shipping-config" element={<AdminShippingConfigPage />} />
                    <Route path="orders/manual" element={<AdminCreateManualOrderPage />} />
                </Route>
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;
//frontend/src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Importaciones de Páginas ---
// ... (Omitidas por brevedad, asumimos que están las de antes)
const AuthPage = React.lazy(() => import('../pages/AuthPage'));
const HomePage = React.lazy(() => import('../pages/HomePage'));
const ProductsPage = React.lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('../pages/ProductDetailPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('../pages/AdminProductsPage'));
const AdminSalesHistoryPage = React.lazy(() => import('../pages/AdminSalesHistoryPage'));
const AdminShippingConfigPage = React.lazy(() => import('../pages/AdminShippingConfigPage'));
const AdminCreateManualOrderPage = React.lazy(() => import('../pages/AdminCreateManualOrderPage'));
const AdminUsersPage = React.lazy(() => import('../pages/AdminUsersPage'));
const CreateProductPage = React.lazy(() => import('../pages/CreateProductPage'));
const EditProductPage = React.lazy(() => import('../pages/EditProductPage'));
// --- CAMBIO ---
// const ProfilePage = React.lazy(() => import('../pages/ProfilePage')); // <-- Eliminada
const CartPage = React.lazy(() => import('../pages/CartPage'));
const OrderDetailPage = React.lazy(() => import('../pages/OrderDetailPage'));
const CheckoutPage = React.lazy(() => import('../pages/CheckoutPage'));
// const MyOrdersPage = React.lazy(() => import('../pages/MyOrdersPage')); // <-- Eliminada
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// --- CAMBIO ---
// Nueva página para el seguimiento de órdenes de invitados
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
            
            {/* --- CAMBIO: Rutas de compra ahora son públicas --- */}
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orden/:id" element={<OrderDetailPage />} />
            <Route path="/seguimiento" element={<OrderTrackingPage />} /> 
            {/* --- FIN CAMBIO --- */}


            {/* --- Rutas solo para Invitados (no logueados) --- */}
            <Route element={<GuestRoute />}>
                {/* Esta es ahora la página de LOGIN DE ADMIN */}
                <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* --- Rutas Privadas (solo para usuarios logueados) --- */}
            <Route element={<PrivateRoute />}>
                
                {/* --- CAMBIO: Rutas de cliente eliminadas --- */}
                {/* <Route path="/perfil" element={<ProfilePage />} /> */}
                {/* <Route path="/mis-pedidos" element={<MyOrdersPage />} /> */}
                {/* Las rutas /carrito, /checkout, /orden/:id se movieron a públicas */}
                
                {/* Rutas de Admin (Se mantienen sin cambios) */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
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
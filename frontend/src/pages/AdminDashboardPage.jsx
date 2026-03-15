//revisado
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './styles/AdminDashboardPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getAllOrders } from '../services/orderService';
import { getAllProducts } from '../services/productService';
import { FaBoxOpen, FaClipboardList, FaShippingFast, FaCog, FaHistory, FaUserCircle } from 'react-icons/fa';

const AdminDashboardPage = () => {
    useDocumentTitle('Admin - Dashboard');
    const { usuario } = useAuth();

    // Estados para las métricas
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        ventasHoy: 0,
        pedidosPendientes: 0,
        productosBajoStock: 0,
        totalVentasMes: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

                // 1. Pedidos Pendientes
                const pendingOrdersData = await getAllOrders({ status: 'pendiente' });

                // 2. Ventas de Hoy
                const todayOrdersData = await getAllOrders({ startDate: today, endDate: today });
                const ventasHoyTotal = todayOrdersData.orders.reduce((acc, order) => acc + order.totalPrice, 0);

                // 3. Productos Bajo Stock (Analizamos la primera página por ahora como heurística rápida)
                const productsData = await getAllProducts(1);
                // Asumimos bajo stock si es menor a 5
                const lowStockCount = productsData.products.filter(p => p.stock < 5).length;

                setStats({
                    pedidosPendientes: pendingOrdersData.total || 0,
                    ventasHoy: ventasHoyTotal,
                    productosBajoStock: lowStockCount,
                    totalProductos: productsData.total // Ejemplo
                });

            } catch (error) {
                console.error("Error al cargar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcomeSection}>
                <h2>Hola, {usuario.nombre} 👋</h2>
                <p>Aquí tienes el resumen de tu tienda hoy.</p>
            </div>

            {/* SECCIÓN DE MÉTRICAS */}
            {loading ? <div className={styles.loading}>Cargando métricas...</div> : (
                <div className={styles.statsGrid}>
                    <Link to="/admin/sales-history" className={styles.statCard} style={{ borderLeftColor: '#4CAF50' }}>
                        <h3>Ventas de Hoy</h3>
                        <div className={styles.statValue}>{formatCurrency(stats.ventasHoy)}</div>
                        <div className={styles.statSubtext}>Ingresos registrados hoy</div>
                    </Link>

                    <Link to="/admin/sales-history" className={styles.statCard} style={{ borderLeftColor: '#FF9800' }}>
                        <h3>Pedidos Pendientes</h3>
                        <div className={styles.statValue}>{stats.pedidosPendientes}</div>
                        <div className={styles.statSubtext}>Requieren tu atención</div>
                    </Link>

                    <Link to="/admin/products" className={styles.statCard} style={{ borderLeftColor: '#F44336' }}>
                        <h3>Alerta Stock</h3>
                        <div className={styles.statValue}>{stats.productosBajoStock}</div>
                        <div className={styles.statSubtext}>Productos con &lt; 5 unidades (Pág 1)</div>
                    </Link>

                    {/* Placeholder para futura métrica */}
                    <Link to="/admin/products" className={styles.statCard} style={{ borderLeftColor: '#2196F3' }}>
                        <h3>Total Productos</h3>
                        <div className={styles.statValue}>{stats.totalProductos || '-'}</div>
                        <div className={styles.statSubtext}>Activos en catálogo</div>
                    </Link>
                </div>
            )}

            {/* SECCIÓN DE NAVEGACIÓN RÁPIDA */}
            <h3 className={styles.navSectionTitle}>Acciones Rápidas</h3>
            <div className={styles.navGrid}>
                <Link to="/admin/products" className={styles.navCard}>
                    <FaBoxOpen className={styles.navIcon} />
                    <span>Gestionar Productos</span>
                </Link>

                <Link to="/admin/sales-history" className={styles.navCard}>
                    <FaClipboardList className={styles.navIcon} />
                    <span>Historial Ventas</span>
                </Link>

                <Link to="/admin/orders/manual" className={styles.navCard}>
                    <FaHistory className={styles.navIcon} />
                    <span>Nueva Venta Manual</span>
                </Link>

                <Link to="/admin/shipping-config" className={styles.navCard}>
                    <FaShippingFast className={styles.navIcon} />
                    <span>Configurar Envíos</span>
                </Link>

                <Link to="/admin/settings" className={styles.navCard}>
                    <FaCog className={styles.navIcon} />
                    <span>Configuración General</span>
                </Link>

                <Link to="/perfil" className={styles.navCard}>
                    <FaUserCircle className={styles.navIcon} />
                    <span>Mi Perfil</span>
                </Link>

                <Link to="/" className={styles.navCard} style={{ backgroundColor: 'var(--color-principal)', color: 'white' }}>
                    <FaBoxOpen className={styles.navIcon} />
                    <span>Ver Tienda (Editar Inicio)</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
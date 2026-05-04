//revisado
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, deleteProduct, updateProduct } from '../services/productService'; // Import updateProduct
import Paginate from '../components/ui/Paginate';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import styles from './styles/AdminShared.module.css'
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Input from '../components/ui/Input'; // Reutilizamos el Input UI si es posible, o un input simple

const AdminProductsPage = () => {
    useDocumentTitle('Admin - Gestión de Productoos')
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para edición rápida de stock
    const [editingStock, setEditingStock] = useState({}); // { [productId]: newValue }

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllProducts(page);
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('No se pudieron cargar los productos.');
            console.log(err.status)
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                toast.success('Producto eliminado con éxito');
                fetchProducts();
            } catch (err) {
                toast.error('Error al eliminar el producto.');
                console.log(err.status)

            }
        }
    };

    // --- LÓGICA DE EDICIÓN RÁPIDA DE STOCK ---
    const handleStockChange = (id, newValue) => {
        setEditingStock(prev => ({ ...prev, [id]: newValue }));
    };

    const saveStock = async (id) => {
        const newStock = editingStock[id];
        if (newStock === undefined || newStock === '') return;

        try {
            await updateProduct(id, { stock: parseInt(newStock) });
            toast.success('Stock actualizado');

            // Actualizamos localmente para evitar recarga completa
            setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: parseInt(newStock) } : p));

            // Limpiamos el estado de edición para este ID
            setEditingStock(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar stock');
        }
    };

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') {
            saveStock(id);
        }
    };
    // -----------------------------------------

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    if (loading) return <Spinner />;
    if (error) return <div><p>{error}</p></div>;

    return (
        <div className={styles.container}>
            {/* <p className={styles.aviso}>Pronto mas acciones disponibles</p> */}
            <h2>Gestión de Productos</h2>

            <div className={styles.controlsContainer}>
                <Link to="/admin/products/create">
                    <Button variant='primary'>Crear Nuevo Producto</Button>
                </Link>
            </div>

            {/* --- 2. APLICAMOS LA ESTRUCTURA RESPONSIVA Y LAS CLASES UNIFICADAS --- */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th style={{ minWidth: '120px' }}>Stock</th>
                            <th>Vencimiento</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isLowStock = product.stock < 5;
                            const currentStockValue = editingStock[product._id] !== undefined ? editingStock[product._id] : product.stock;

                            // Lógica de Vencimiento
                            let expirationBadge = null;
                            if (product.fechaVencimiento) {
                                const today = new Date();
                                const expDate = new Date(product.fechaVencimiento);
                                const diffTime = expDate - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                if (diffDays < 0) {
                                    expirationBadge = <span className={styles.badgeDanger}>Vencido</span>;
                                } else if (diffDays <= 7) {
                                    expirationBadge = <span className={styles.badgeWarning} title={`${diffDays} días`}>Vence Pronto</span>;
                                } else {
                                    expirationBadge = <span style={{ color: '#28a745', fontSize: '0.9rem' }}>OK ({diffDays}d)</span>;
                                }
                            }

                            return (
                                <tr key={product._id} className={`${styles.tableRow} ${isLowStock ? styles.lowStockRow : ''}`}>
                                    <td className={styles.tableCell}>{product._id}</td>
                                    <td className={styles.tableCell}>{product.nombre}</td>
                                    <td className={styles.tableCell}>${product.precio}</td>
                                    <td className={styles.tableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="number"
                                                className={styles.searchInput} // Reusamos estilo
                                                style={{ width: '70px', padding: '4px', fontSize: '0.9rem' }}
                                                value={currentStockValue}
                                                onChange={(e) => handleStockChange(product._id, e.target.value)}
                                                onBlur={() => saveStock(product._id)}
                                                onKeyDown={(e) => handleKeyDown(e, product._id)}
                                            />
                                            {isLowStock && <span title="Bajo Stock" style={{ color: '#dc3545', cursor: 'help' }}>⚠️</span>}
                                        </div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        {product.fechaVencimiento ? new Date(product.fechaVencimiento).toLocaleDateString() : '-'}
                                        <div style={{ marginTop: '4px' }}>{expirationBadge}</div>
                                    </td>
                                    <td className={styles.tableCell}>
                                        {Array.isArray(product.categoria)
                                            ? product.categoria.join(', ')
                                            : product.categoria}
                                    </td>
                                    <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                                        <Link to={`/admin/products/edit/${product._id}`}>
                                            <Button variant='secondary' size="small">Editar</Button>
                                        </Link>
                                        <Button onClick={() => handleDelete(product._id)} variant='danger' size="small">
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationContainer}>
                <Paginate pages={totalPages} page={page} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default AdminProductsPage;
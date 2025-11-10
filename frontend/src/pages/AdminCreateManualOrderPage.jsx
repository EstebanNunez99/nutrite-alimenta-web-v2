// frontend/src/pages/AdminCreateManualOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllProducts } from '../services/productService';
import { createManualOrder } from '../services/orderService';
import { calculateShippingCost } from '../services/shippingService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import styles from './styles/AdminCreateManualOrderPage.module.css';

const AdminCreateManualOrderPage = () => {
    useDocumentTitle('Admin - Crear Venta Manual');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchProduct, setSearchProduct] = useState('');

    const [orderData, setOrderData] = useState({
        customerInfo: {
            nombre: '',
            email: '',
            telefono: ''
        },
        items: [],
        // --- INICIO CAMBIO ---
        // Simplificamos el objeto de dirección
        shippingAddress: {
            address: '',
            city: '',
        },
        // --- FIN CAMBIO ---
        paymentMethod: 'Efectivo',
        shippingCost: 0,
        status: 'completada',
        deliveryStatus: 'no_enviado'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const productsData = await getAllProducts(1, '', '', '');
            setProducts(productsData.products || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCustomerChange = (field, value) => {
        setOrderData(prev => ({
            ...prev,
            customerInfo: {
                ...prev.customerInfo,
                [field]: value
            }
        }));
    };

    const handleAddProduct = (product) => {
        // ... (Tu lógica para añadir productos está bien) ...
        const existingItem = orderData.items.find(item => item.producto === product._id);
        if (existingItem) {
            setOrderData(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.producto === product._id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            }));
        } else {
            setOrderData(prev => ({
                ...prev,
                items: [
                    ...prev.items,
                    {
                        producto: product._id,
                        nombre: product.nombre,
                        cantidad: 1,
                        precio: product.precio,
                        imagen: product.imagen
                    }
                ]
            }));
        }
        setSearchProduct('');
    };

    const handleRemoveItem = (productId) => {
        // ... (Tu lógica está bien) ...
        setOrderData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.producto !== productId)
        }));
    };

    const handleUpdateQuantity = (productId, quantity) => {
        // ... (Tu lógica está bien) ...
        if (quantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.producto === productId
                    ? { ...item, cantidad: quantity }
                    : item
            )
        }));
    };

    // --- INICIO CAMBIO ---
    // Actualizamos la lógica de cambio y cálculo
    const handleAddressChange = async (field, value) => {
        const newAddress = { ...orderData.shippingAddress, [field]: value };
        setOrderData(prev => ({ ...prev, shippingAddress: newAddress }));

        // Calcular envío solo con dirección y ciudad
        if (newAddress.address && newAddress.city) {
            try {
                const subtotal = orderData.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
                // El backend ya sabe que solo recibirá address y city
                const result = await calculateShippingCost(newAddress, subtotal);
                setOrderData(prev => ({
                    ...prev,
                    shippingCost: result.freeShipping ? 0 : (result.cost || 0)
                }));
            } catch (error) {
                console.error('Error al calcular envío:', error);
            }
        }
    };
    // --- FIN CAMBIO ---

    const calculateSubtotal = () => {
        return orderData.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + (orderData.shippingCost || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- INICIO CAMBIO ---
        // Añadimos validación para el teléfono
        if (!orderData.customerInfo.nombre || !orderData.customerInfo.email || !orderData.customerInfo.telefono) {
            toast.error('Debe completar el nombre, email y teléfono del cliente');
            return;
        }
        // --- FIN CAMBIO ---
        
        if (orderData.items.length === 0) {
            toast.error('Debe agregar al menos un producto');
            return;
        }

        setSaving(true);
        try {
            const createdOrder = await createManualOrder(orderData);
            toast.success('Venta creada exitosamente');
            navigate(`/orden/${createdOrder._id}`);
        } catch (error) {
            console.error('Error al crear venta:', error);
            toast.error(error.response?.data?.msg || 'Error al crear la venta');
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(searchProduct.toLowerCase())
    );

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className={styles.container}>
            <h2> + Nueva Venta</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                
                <div className={styles.section}>
                    <h3>Datos del Cliente</h3>
                    <Input
                        label="Nombre Completo"
                        type="text"
                        value={orderData.customerInfo.nombre}
                        onChange={(e) => handleCustomerChange('nombre', e.target.value)}
                        placeholder="Nombre y Apellido"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={orderData.customerInfo.email}
                        onChange={(e) => handleCustomerChange('email', e.target.value)}
                        placeholder="email@cliente.com"
                        required
                    />
                    {/* --- INICIO CAMBIO --- */}
                    <Input
                        label="Teléfono"
                        type="tel"
                        value={orderData.customerInfo.telefono}
                        onChange={(e) => handleCustomerChange('telefono', e.target.value)}
                        required // <-- AHORA ES OBLIGATORIO
                    />
                    {/* --- FIN CAMBIO --- */}
                </div>

                {/* ... (Sección de Productos - sin cambios) ... */}
                <div className={styles.section}>
                    <h3>Productos</h3>
                    <Input
                        label="Buscar Producto"
                        type="text"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Buscar producto..."
                    />
                    {searchProduct && (
                        <div className={styles.dropdown}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className={styles.dropdownItem}
                                        onClick={() => handleAddProduct(product)}
                                    >
                                        {product.nombre} - ${product.precio} (Stock: {product.stock})
                                    </div>
                                ))
                            ) : (
                                <div className={styles.dropdownItem}>No se encontraron productos</div>
                            )}
                        </div>
                    )}
                    {orderData.items.length > 0 && (
                        <div className={styles.itemsList}>
                            <h4>Productos en la orden:</h4>
                            {orderData.items.map(item => (
                                <div key={item.producto} className={styles.itemRow}>
                                    <div className={styles.itemInfo}>
                                        <span>{item.nombre}</span>
                                        <span>${item.precio} c/u</span>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => handleUpdateQuantity(item.producto, parseInt(e.target.value) || 1)}
                                            style={{ width: '80px' }}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => handleRemoveItem(item.producto)}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        ${(item.precio * item.cantidad).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- INICIO CAMBIO --- */}
                {/* Sección de Dirección de Envío Simplificada */}
                <div className={styles.section}>
                    <h3>Dirección de Envío</h3>
                    <Input
                        label="Dirección"
                        type="text"
                        value={orderData.shippingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        required
                    />
                    <Input
                        label="Ciudad"
                        type="text"
                        value={orderData.shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        required
                    />
                    {/* Campos de Código Postal y País eliminados */}
                </div>
                {/* --- FIN CAMBIO --- */}

                {/* ... (Sección de Configuración - sin cambios) ... */}
                <div className={styles.section}>
                    <h3>Configuración</h3>
                    <div>
                        <label>Método de Pago</label>
                        <select
                            value={orderData.paymentMethod}
                            onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia Bancaria</option>
                            <option value="MercadoPago">MercadoPago</option>
                        </select>
                    </div>
                    <div>
                        <label>Estado de Pago</label>
                        <select
                            value={orderData.status}
                            onChange={(e) => setOrderData(prev => ({ ...prev, status: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label>Estado de Entrega</label>
                        <select
                            value={orderData.deliveryStatus}
                            onChange={(e) => setOrderData(prev => ({ ...prev, deliveryStatus: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="no_enviado">No Enviado</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    </div>
                </div>

                {/* ... (Sección de Resumen - sin cambios) ... */}
                <div className={styles.section}>
                    <h3>Resumen</h3>
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Envío:</span>
                            <span>${orderData.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <strong>Total:</strong>
                            <strong>${calculateTotal().toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                {/* ... (Acciones - sin cambios) ... */}
                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/sales-history')}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Creando...' : 'Crear Venta'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminCreateManualOrderPage;
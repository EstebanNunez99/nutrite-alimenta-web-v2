// frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import styles from './styles/CheckoutPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { calculateShippingCost } from '../services/shippingService.js';
import { getSettings } from '../services/settingsService.js';

const CheckoutPage = () => {
    useDocumentTitle('Checkout');
    const { cart, itemCount, checkout, loading } = useCart();
    const navigate = useNavigate();

    // Estado del formulario de cliente y envío
    const [customerInfo, setCustomerInfo] = useState({ nombre: '', email: '', telefono: '' });
    const [shippingAddress, setShippingAddress] = useState({ address: '', city: '' });
    const [paymentMethod, setPaymentMethod] = useState('MercadoPago');

    // Configuración y Lógica de Negocio (RF-001/006)
    const [settings, setSettings] = useState(null);
    const [stockItems, setStockItems] = useState([]);
    const [demandItems, setDemandItems] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    // Selecciones del Usuario
    const [deliveryMethod, setDeliveryMethod] = useState('envio'); // 'envio', 'retiro_domicilio', 'retiro_gimnasio'
    const [shippingType, setShippingType] = useState('unificado'); // 'unificado', 'desglosado'
    const [selectedDate, setSelectedDate] = useState('');

    // Estados de UI/Carga
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingMessage, setShippingMessage] = useState('');
    const [loadingSettings, setLoadingSettings] = useState(true);

    // 1. Cargar Configuración y Clasificar Info
    useEffect(() => {
        const init = async () => {
            try {
                // Obtener reglas del backend
                const settingsData = await getSettings();
                setSettings(settingsData);

                // Clasificar ítems del carrito
                if (cart && cart.items) {
                    const stock = cart.items.filter(i => i.tipo === 'stock' || !i.tipo); // Default stock
                    const demand = cart.items.filter(i => i.tipo === 'bajo_demanda');
                    setStockItems(stock);
                    setDemandItems(demand);

                    // Si NO hay items bajo demanda, shippingType es siempre unificado (o n/a)
                    if (demand.length === 0) {
                        setShippingType('unificado');
                    }
                }
            } catch (error) {
                console.error("Error cargando settings", error);
                toast.error("Error conectando con el servidor");
            } finally {
                setLoadingSettings(false);
            }
        };
        init();
    }, [cart]);

    // 2. Calcular Fechas Disponibles (RF-001)
    useEffect(() => {
        if (!settings || !settings.demandRules || demandItems.length === 0) return;

        const rules = settings.demandRules.days || [];
        if (rules.length === 0) return;

        const dates = [];
        const today = new Date();
        // Buscamos fechas en los próximos 14 días
        for (let i = 0; i < 14; i++) {
            const potentialDate = new Date(today);
            potentialDate.setDate(today.getDate() + i);

            const dayOfWeek = potentialDate.getDay(); // 0-6

            // Verificamos si este día de la semana coincide con alguna regla habilitada
            const rule = rules.find(r => r.dayOfWeek === dayOfWeek && r.enabled);

            if (rule) {
                // Verificar Cutoff (Cierre de pedidos)
                // Fecha límite = Día de Entrega - cutoffDay
                // Ejemplo: Entrega Miércoles (3). CutoffDay=2 (Martes). 
                // Fecha Cutoff = Miércoles - 1 día = Martes.
                // Corrección: El modelo dice 'cutoffDay' como número relativo? 
                // Plan decía: Wed(3) cutoff Tue(2).
                // Vamos a asumir cutoffDay es EL DIA DE LA SEMANA del cierre.

                // Calculamos la FECHA exacta del cutoff para este potentialDate
                const deliveryZeroTime = new Date(potentialDate);
                deliveryZeroTime.setHours(0, 0, 0, 0);

                // Cuántos días antes es el cutoff?
                // Si dia entrega es 3 (Mie) y cutoff es 2 (Mar), diff es 1 dia.
                // Si dia entrega es 6 (Sab) y cutoff es 5 (Vie), diff es 1 dia.
                let daysBefore = rule.dayOfWeek - rule.cutoffDay;
                if (daysBefore < 0) daysBefore += 7; // Ajuste si cruza semana (ej entrega Lun(1) cierre Dom(0))

                const cutoffDate = new Date(potentialDate);
                cutoffDate.setDate(potentialDate.getDate() - daysBefore);

                // Parsear hora (ej "14:00")
                const [hours, minutes] = rule.cutoffTime.split(':').map(Number);
                cutoffDate.setHours(hours, minutes, 0, 0);

                // Si AHORA es antes del cutoff, esta fecha es válida
                if (today < cutoffDate) {
                    dates.push({
                        dateObj: potentialDate,
                        label: `${rule.dayName} ${potentialDate.toLocaleDateString('es-AR')}`,
                        value: potentialDate.toISOString()
                    });
                }
            }
        }
        setAvailableDates(dates);
        // Pre-seleccionar la primera fecha
        if (dates.length > 0) setSelectedDate(dates[0].value);

    }, [settings, demandItems]);


    // Handlers de Formulario
    const onCustomerChange = (e) => setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    const onAddressChange = (e) => setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });

    // Cálculo de Envío (SIMPLIFICADO RF-006: No calculamos, solo avisamos)
    const calculateShipping = useCallback(async (address) => {
        // Ya no llamamos a la API ni calculamos distancia/costo
        setShippingCost(0);
        setIsCalculatingShipping(false);
    }, []);

    // Debounce innecesario pero mantenemos la estructura simple
    useEffect(() => {
        /* No op */
    }, [shippingAddress, calculateShipping, deliveryMethod]);


    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Validaciones Finales
        if (demandItems.length > 0 && !selectedDate) {
            toast.error("Por favor selecciona una fecha de entrega.");
            setIsProcessing(false);
            return;
        }

        try {
            const orderData = {
                customerInfo,
                shippingAddress: deliveryMethod === 'envio' ? shippingAddress : { address: 'Retiro en local', city: 'Sarmiento' },
                paymentMethod,
                shippingCost,
                // Nuevos campos
                shippingType: deliveryMethod === 'envio' ? shippingType : 'retiro', // 'unificado', 'desglosado', 'retiro'
                fechaEntregaBajoDemanda: demandItems.length > 0 ? selectedDate : null,
                fechaEntregaInmediato: (stockItems.length > 0 && (shippingType === 'desglosado' || demandItems.length === 0)) ? new Date().toISOString() : selectedDate // Si es unificado, viaja con la fecha de demanda
            };

            const createdOrder = await checkout(orderData);
            toast.success('¡Orden creada con éxito!');
            navigate(`/orden/${createdOrder._id}`);
        } catch (error) {
            console.error('Error al crear la orden:', error);
            toast.error(error.response?.data?.msg || 'Error al procesar la orden.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || loadingSettings) return <Spinner />;
    if (!cart || itemCount === 0) return <div className={styles.pageContainer}><h2>Carrito Vacío</h2></div>;

    // Totales
    const cartSubtotal = cart.items.reduce((total, item) => total + item.cantidad * item.precio, 0);
    const total = cartSubtotal + shippingCost;

    return (
        <div className={styles.pageContainer}>
            <h2>Finalizar Compra</h2>
            <div className={styles.checkoutGrid}>
                <div className={styles.shippingForm}>
                    <form onSubmit={handlePlaceOrder} className={styles.form}>

                        <h3>1. Datos Personales</h3>
                        <Input label="Nombre" name="nombre" value={customerInfo.nombre} onChange={onCustomerChange} required />
                        <Input label="Email" type="email" name="email" value={customerInfo.email} onChange={onCustomerChange} required />
                        <Input label="Teléfono" type="tel" name="telefono" value={customerInfo.telefono} onChange={onCustomerChange} required placeholder="Obligatorio para coordinar" />

                        {/* Selección de Método de Entrega (RF-007) */}
                        <h3 className="mt-4">2. Método de Entrega</h3>
                        <div className={styles.radioGroup}>
                            <label>
                                <input type="radio" name="deliveryMethod" value="envio" checked={deliveryMethod === 'envio'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                                Envío a Domicilio (Uber Motos)
                            </label>
                            <label>
                                <input type="radio" name="deliveryMethod" value="retiro_domicilio" checked={deliveryMethod === 'retiro_domicilio'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                                Retiro en Domicilio
                            </label>
                            <label>
                                <input type="radio" name="deliveryMethod" value="retiro_gimnasio" checked={deliveryMethod === 'retiro_gimnasio'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                                Retiro en Gimnasio
                            </label>
                        </div>

                        {deliveryMethod === 'envio' && (
                            <div className={styles.addressSection}>
                                <Input label="Dirección de Envío" name="address" value={shippingAddress.address} onChange={onAddressChange} required />
                                <Input label="Ciudad" name="city" value={shippingAddress.city} onChange={onAddressChange} required />

                                <div className={styles.aviso} style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginTop: '10px', fontSize: '0.9rem' }}>
                                    <strong>Nota sobre el envío:</strong> Los envíos se realizan con Uber Motos.
                                    No contamos con cotización en tiempo real, por lo que el costo del envío corre por
                                    cuenta del cliente al momento de recibir el pedido. ¡No hay límite de distancia!
                                </div>
                            </div>
                        )}

                        {(deliveryMethod === 'retiro_domicilio' || deliveryMethod === 'retiro_gimnasio') && (
                            <div className={styles.aviso} style={{ backgroundColor: '#d1ecf1', color: '#0c5460', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                <strong>¡Genial!</strong> Nos vamos a contactar con vos para coordinar la entrega.
                            </div>
                        )}

                        {/* Lógica de Fechas e Items Mixtos (RF-001/006) */}
                        {demandItems.length > 0 && (
                            <div className={styles.demandSection}>
                                <h3 className="mt-4">3. Fecha de Entrega (Productos Bajo Demanda)</h3>
                                <p className={styles.alertInfo}>Tienes productos que se elaboran bajo demanda ({demandItems.map(i => i.nombre).join(', ')}).</p>

                                <label className={styles.selectLabel}>Selecciona cuándo quieres recibir/retirar:</label>
                                {availableDates.length > 0 ? (
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={styles.selectInput}
                                        required
                                    >
                                        {availableDates.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className={styles.errorText}>No hay fechas disponibles próximas (Cierres de pedido pasados).</p>
                                )}
                            </div>
                        )}

                        {/* Opciones de Envío Dividido (RF-006) si hay mix */}
                        {stockItems.length > 0 && demandItems.length > 0 && deliveryMethod === 'envio' && (
                            <div className={styles.splitShipping}>
                                <h4 className="mt-2">Opciones de Envío Mixto:</h4>
                                <label className={styles.radioOption}>
                                    <input type="radio" name="shippingType" value="unificado" checked={shippingType === 'unificado'} onChange={(e) => setShippingType(e.target.value)} />
                                    <strong>Unificado:</strong> Recibir todo junto el {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'día seleccionado'} (1 Envío a pagar).
                                </label>
                                <label className={styles.radioOption}>
                                    <input type="radio" name="shippingType" value="desglosado" checked={shippingType === 'desglosado'} onChange={(e) => setShippingType(e.target.value)} />
                                    <strong>Desglosado:</strong> Recibir productos en stock YA, y bajo demanda después. (⚠ Se abonarán 2 envíos).
                                </label>
                            </div>
                        )}

                        {/* Pago */}
                        <h3 className="mt-4">4. Pago</h3>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.selectInput}>
                            <option value="MercadoPago">MercadoPago</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia Bancaria</option>
                        </select>

                        <div className={styles.totalSection}>
                            <p>Subtotal: ${cartSubtotal}</p>
                            <p>Envío: {deliveryMethod === 'envio' ? <span style={{ fontSize: '0.9em', color: '#666' }}>(A cargo del cliente)</span> : '$0'}</p>
                            <h3>Total Productos: ${total} <small style={{ fontSize: '0.6em', fontWeight: 'normal' }}>+ Envío</small></h3>
                        </div>

                        <Button type="submit" variant='primary' disabled={isProcessing} className={styles.confirmBtn}>
                            {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
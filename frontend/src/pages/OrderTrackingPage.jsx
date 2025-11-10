//revisado
// frontend/src/pages/OrderTrackingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { trackOrder } from '../services/orderService'; // La función que acabamos de agregar
import useDocumentTitle from '../hooks/useDocumentTitle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
// Usaremos un estilo similar al de Checkout o Auth
import styles from './styles/CheckoutPage.module.css'; 

const OrderTrackingPage = () => {
    useDocumentTitle('Seguimiento de Orden');
    const [formData, setFormData] = useState({
        orderId: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { orderId, email } = formData;

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Llamamos a la nueva API
            const order = await trackOrder(orderId, email);
            
            // Si tiene éxito, redirigimos a la página de detalle de la orden
            toast.success('¡Orden encontrada!');
            navigate(`/orden/${order._id}`);

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'No se pudo encontrar la orden con esos datos.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Reutilizamos el 'authContainer' para un look consistente
        <div className={styles.pageContainer}>
            <div className={styles.form}>
                <h2 className={styles.formTitle}>Seguí el estado de tu pedido</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
                    Ingresa el ID de tu orden y tu email para ver el estado.
                </p>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="ID de la Orden"
                        type="text"
                        name="orderId"
                        value={orderId}
                        onChange={onChange}
                        required
                        placeholder="Ej: 60c72b... "
                    />
                    <Input
                        label="Email de Compra"
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        placeholder="tu@email.com"
                    />

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading} 
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? <Spinner size="sm" /> : 'Ver estado de Pedido'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
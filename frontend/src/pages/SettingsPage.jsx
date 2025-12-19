import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import styles from './styles/SettingsPage.module.css';

const SettingsPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStore = async () => {
        try {
            const updated = await updateSettings({ storeOpen: !settings.storeOpen });
            setSettings(updated);
            toast.success(updated.storeOpen ? 'Tienda Abierta' : 'Tienda Cerrada');
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className={styles.container}>
            <h2>Configuración del Sistema</h2>

            <div className={styles.card}>
                <h3>Estado de la Tienda</h3>
                <p>Actualmente la tienda está: <strong>{settings.storeOpen ? 'ABIERTA' : 'CERRADA'}</strong></p>
                <Button onClick={handleToggleStore} variant={settings.storeOpen ? 'danger' : 'primary'}>
                    {settings.storeOpen ? 'Cerrar Tienda' : 'Abrir Tienda'}
                </Button>
            </div>

            {/* Aquí agregaremos la configuración de días de entrega más adelante */}
        </div>
    );
};

export default SettingsPage;

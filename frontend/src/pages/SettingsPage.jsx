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

    // Función para manejar cambios en los inputs de texto
    const handleInputChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    // Guardar cambios generales (dirección, horarios, etc)
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        try {
            await updateSettings(settings); // 'settings' ya tiene los valores actualizados por el onChange
            toast.success('Información actualizada correctamente');
        } catch (error) {
            toast.error('Error al guardar información');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Configuración del Sistema</h2>

            {/* TARJETA 2: INFORMACIÓN DE CONTACTO Y HORARIOS */}
            <div className={styles.card}>
                <h3>Información del Negocio</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>Esta información se mostrará en el pie de página (Footer) de la web.</p>

                <form onSubmit={handleSaveInfo} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Dirección:</label>
                        <input
                            type="text"
                            name="address"
                            value={settings.address || ''}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Ej: Av. Costanera 1234"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Horarios de Atención:</label>
                        <input
                            type="text"
                            name="openingHours"
                            value={settings.openingHours || ''}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Ej: Lun a Vie 08:00 - 20:00"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Teléfono / WhatsApp:</label>
                        <input
                            type="text"
                            name="contactPhone"
                            value={settings.contactPhone || ''}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Ej: +54 9 379 4123456"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email de Contacto:</label>
                        <input
                            type="text"
                            name="contactEmail"
                            value={settings.contactEmail || ''}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Ej: info@tutienda.com"
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Button type="submit" variant="primary">Guardar Información</Button>
                    </div>
                </form>
            </div>

            {/* Espacio para futuras configs */}
        </div>
    );
};

export default SettingsPage;

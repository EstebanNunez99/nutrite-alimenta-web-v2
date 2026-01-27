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

    // Manejar cambios en redes sociales (url y enabled)
    const handleSocialChange = (network, field, value) => {
        setSettings(prev => ({
            ...prev,
            socialNetworks: {
                ...prev.socialNetworks,
                [network]: {
                    ...prev.socialNetworks?.[network],
                    [field]: value
                }
            }
        }));
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
            <h2 className={styles.pageTitle}> | Configuración del Sistema</h2>

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
                        <label>Teléfono (General):</label>
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

                    {/* SECCIÓN REDES SOCIALES */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: '#555' }}>Redes Sociales y Enlaces</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['facebook', 'instagram', 'twitter', 'whatsapp', 'telegram'].map(network => (
                                <div key={network} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
                                    <div style={{ width: '100px', textTransform: 'capitalize', fontWeight: 'bold' }}>{network}</div>
                                    <input
                                        type="text"
                                        value={settings.socialNetworks?.[network]?.url || ''}
                                        onChange={(e) => handleSocialChange(network, 'url', e.target.value)}
                                        className={styles.input}
                                        placeholder={`URL de ${network}`}
                                        style={{ flex: 1 }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={settings.socialNetworks?.[network]?.enabled || false}
                                            onChange={(e) => handleSocialChange(network, 'enabled', e.target.checked)}
                                        />
                                        Mostrar
                                    </label>
                                </div>
                            ))}
                        </div>
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

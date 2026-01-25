import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getHomeConfig, updateHomeConfig } from '../services/configService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './styles/EditProductPage.module.css'; // Reutilizamos estilos funcionales
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminHomeConfigPage = () => {
    useDocumentTitle('Admin - Configurar Inicio');
    const [formData, setFormData] = useState({
        heroTitle: '',
        heroSubtitle: '',
        bannerImage: '',
        promoMessage: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config = await getHomeConfig();
                setFormData({
                    heroTitle: config.heroTitle || '',
                    heroSubtitle: config.heroSubtitle || '',
                    bannerImage: config.bannerImage || '',
                    promoMessage: config.promoMessage || ''
                });
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar configuración");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateHomeConfig(formData);
            toast.success("¡Configuración de Inicio actualizada!");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Configurar Página de Inicio (CMS)</h2>
            <form onSubmit={handleSubmit} className={styles.form}>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Título Principal (Hero)</label>
                    <Input
                        name="heroTitle"
                        value={formData.heroTitle}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                    <small style={{ color: '#666' }}>El texto grande que aparece sobre la imagen principal.</small>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subtítulo</label>
                    <Input
                        name="heroSubtitle"
                        value={formData.heroSubtitle}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>URL de Imagen (Banner)</label>
                    <Input
                        name="bannerImage"
                        value={formData.bannerImage}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                    <small style={{ color: '#666' }}>Copia y pega el enlace de una imagen (ej. Unsplash).</small>
                    {formData.bannerImage && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={formData.bannerImage} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mensaje Promocional (Opcional)</label>
                    <Input
                        name="promoMessage"
                        value={formData.promoMessage}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Ej: ¡Envío gratis en compras mayores a $50.000!"
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminHomeConfigPage;

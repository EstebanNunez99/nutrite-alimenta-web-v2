//verificado
// ProductForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { uploadImage } from '../../services/uploadService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from '../../pages/styles/EditProductPage.module.css';

const ProductForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: ''
    });
    const [uploading, setUploading] = useState(false);

    const { nombre, descripcion, precio, stock, categoria, imagen } = initialData || {};

    useEffect(() => {
        setFormData({
            nombre: nombre || '', descripcion: descripcion || '', precio: precio || '', stock: stock || '', categoria: categoria || '', imagen: imagen || ''
        });
    }, [nombre, descripcion, precio, stock, categoria, imagen]);

    const textareaRef = useRef(null);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [formData.descripcion]);

    const fileInputRef = useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecciona una imagen válida.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB.');
            return;
        }

        try {
            setUploading(true);
            const url = await uploadImage(file);
            setFormData({ ...formData, imagen: url });
            toast.success('Imagen subida correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="nombre" className={styles.formLabel}>Nombre del Producto</label>
                <Input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
                <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={onChange} required className={styles.formInput} ref={textareaRef} rows={1} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="precio" className={styles.formLabel}>Precio</label>
                <Input id="precio" type="number" name="precio" value={formData.precio} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="stock" className={styles.formLabel}>Stock</label>
                <Input id="stock" type="number" name="stock" value={formData.stock} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <p>*Recordatorio de mejora: Poder seleccionar la categoria desde una lista desplegable, sin necesidad de escribir (añadir categorías a la lista manualmente con un boton de +)</p>
                <label htmlFor="categoria" className={styles.formLabel}>Categoría</label>
                <Input id="categoria" type="text" name="categoria" value={formData.categoria} onChange={onChange} className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Imagen del Producto</label>

                {formData.imagen && (
                    <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                        <img
                            src={formData.imagen}
                            alt="Vista previa"
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                <Button type="button" variant="secondary" onClick={handleUploadClick} className={styles.fullWidth} disabled={uploading}>
                    {uploading ? 'Subiendo...' : (formData.imagen ? 'Cambiar Imagen' : 'Subir Imagen')}
                </Button>
            </div>

            <div className={styles.formActions}>
                <Button type="submit" variant='primary' disabled={uploading}>
                    {initialData._id ? 'Guardar Cambios' : 'Crear Producto'}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
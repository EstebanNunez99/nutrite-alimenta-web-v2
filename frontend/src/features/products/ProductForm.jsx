//verificado
// ProductForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { uploadImage } from '../../services/uploadService';
import { getAllCategories } from '../../services/productService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from '../../pages/styles/EditProductPage.module.css';

const ProductForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '', tipo: 'stock'
    });
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { nombre, descripcion, precio, stock, categoria, imagen, tipo } = initialData || {};

    useEffect(() => {
        // Cargar datos iniciales
        setFormData({
            nombre: nombre || '',
            descripcion: descripcion || '',
            precio: precio || '',
            stock: stock || '',
            categoria: categoria || '',
            imagen: imagen || '',
            tipo: tipo || 'stock'
        });

        // Si hay una categoría inicial, verificar si está en la lista (se hará después de cargar categorías)
        if (categoria) {
            // Lógica simple: si viene data, asumimos que no es "nueva" en modo UI hasta que el usuario toque
        }
    }, [nombre, descripcion, precio, stock, categoria, imagen, tipo]);

    // Cargar categorías al montar
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getAllCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Error al cargar categorías", error);
            }
        };
        fetchCategories();
    }, []);

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
        // ... (mismo código de imagen)
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

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'new_category_option') {
            setIsNewCategory(true);
            setFormData({ ...formData, categoria: '' });
        } else {
            setIsNewCategory(false);
            setFormData({ ...formData, categoria: value });
        }
    };

    const handleNewCategoryChange = (e) => {
        setNewCategoryName(e.target.value);
        setFormData({ ...formData, categoria: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de limpieza antes de enviar
        const finalData = { ...formData };

        // Si es bajo demanda, stock es 0 (o lo que defina el backend por defecto, pero enviamos 0 explícito para limpiar)
        if (finalData.tipo === 'bajo_demanda') {
            finalData.stock = 0;
        }

        onSubmit(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="nombre" className={styles.formLabel}>Nombre del Producto</label>
                <Input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={onChange}
                    required
                    className={styles.formInput}
                    ref={textareaRef}
                    rows={1}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="tipo" className={styles.formLabel}>Tipo de Producto</label>
                <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={onChange}
                    className={styles.formInput}
                    style={{ backgroundColor: 'white' }}
                >
                    <option value="stock">Stock Inmediato</option>
                    <option value="bajo_demanda">Bajo Demanda</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="precio" className={styles.formLabel}>Precio</label>
                <Input id="precio" type="number" name="precio" value={formData.precio} onChange={onChange} required className={styles.formInput} />
            </div>

            {/* Renderizado Condicional del Stock */}
            {formData.tipo === 'stock' && (
                <div className={styles.formGroup}>
                    <label htmlFor="stock" className={styles.formLabel}>Stock Disponible</label>
                    <Input id="stock" type="number" name="stock" value={formData.stock} onChange={onChange} required className={styles.formInput} />
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="categoria" className={styles.formLabel}>Categoría</label>
                {!isNewCategory ? (
                    <select
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleCategoryChange}
                        className={styles.formInput}
                        style={{ backgroundColor: 'white' }}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                        <option value="new_category_option" style={{ fontWeight: 'bold', color: 'var(--color-principal)' }}>+ Nueva categoría</option>
                    </select>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Input
                            type="text"
                            placeholder="Nombre de la nueva categoría"
                            value={newCategoryName}
                            onChange={handleNewCategoryChange}
                            required
                            className={styles.formInput}
                            autoFocus
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsNewCategory(false); setFormData({ ...formData, categoria: '' }); }}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Cancelar
                        </Button>
                    </div>
                )}
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
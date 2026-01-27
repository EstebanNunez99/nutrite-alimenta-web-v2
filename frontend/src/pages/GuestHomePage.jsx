//verificado
// frontend/src/pages/GuestHomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getHomeConfig, updateHomeConfig } from '../services/configService';
import { useAuth } from '../hooks/useAuth'; // Para verificar si es admin
import { uploadImage } from '../services/uploadService'; // Para subir imagen de banner
import { toast } from 'react-toastify';
import styles from './styles/GuestHomePage.module.css';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProductCard from '../features/products/ProductCard';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GuestHomePage = () => {
    useDocumentTitle('Inicio');
    const { usuario } = useAuth(); // Obtenemos usuario para saber si es admin
    const isAdmin = usuario?.rol === 'admin';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Configuración y Edición
    const [config, setConfig] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        heroTitle: '',
        heroSubtitle: '',
        bannerImage: '',
        promoMessage: '',
        featuredProducts: [] // IDs de productos seleccionados
    });
    const [saving, setSaving] = useState(false);
    const [allProductsForSelect, setAllProductsForSelect] = useState([]); // Todos los productos para el selector

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Obtenemos config y "latest products" (por si no hay manuales)
                const [latestProductsData, configData] = await Promise.all([
                    getAllProducts(1, 'createdAt_desc', '', ''), // Traemos los más nuevos por defecto
                    getHomeConfig().catch(err => {
                        console.error("Error config home", err);
                        return {};
                    })
                ]);

                setProducts(latestProductsData.products || []);
                setConfig(configData || {});

                // 2. Cargamos TODOS los productos para que el admin pueda elegir (solo si es admin, idealmente, pero aquí cargamos todo simple)
                // Nota: getAllProducts paginado... para simplificar asumiremos que traemos muchos o hacemos una búsqueda.
                // Para el selector idealmente necesitaríamos un endpoint "search" o "all without pagination", 
                // pero usaremos el mismo getAllProducts con un límite alto para este MVP.
                const allProdsData = await getAllProducts(1, 'nombre_asc', '', '', 100); // Traer hasta 100 productos para elegir
                setAllProductsForSelect(allProdsData.products || []);

                // Inicializamos el form
                // configData.featuredProducts viene populado (objetos), pero para el form necesitamos IDs
                const currentFeaturedIds = configData?.featuredProducts?.map(p => p._id) || [];

                setEditForm({
                    heroTitle: configData?.heroTitle || 'EL SABOR DE LO\nSALUDABLE',
                    heroSubtitle: configData?.heroSubtitle || 'Disfrutamos de brindar una experiencia gastronómica única, donde calidad, sabor y salud se unen. Gracias a nuestros clientes, seguimos creciendo día a día. ¡Elegí lo saludable!',
                    bannerImage: configData?.bannerImage || 'https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png',
                    promoMessage: configData?.promoMessage || '',
                    featuredProducts: currentFeaturedIds
                });

            } catch (error) {
                console.error("Error general home:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Manejo de cambios en los inputs text
    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Toggle de productos destacados
    const toggleFeaturedProduct = (productId) => {
        const current = editForm.featuredProducts;
        if (current.includes(productId)) {
            // Quitar
            setEditForm({ ...editForm, featuredProducts: current.filter(id => id !== productId) });
        } else {
            // Agregar (Limitamos a 10 por ejemplo)
            if (current.length >= 10) {
                toast.warning("Máximo 10 productos destacados");
                return;
            }
            setEditForm({ ...editForm, featuredProducts: [...current, productId] });
        }
    };


    // Subida de imagen para el banner
    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading("Subiendo nueva imagen...");
        try {
            const url = await uploadImage(file); // Reusamos el servicio de upload existente
            setEditForm(prev => ({ ...prev, bannerImage: url }));
            toast.update(toastId, { render: "Imagen lista para guardar", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            console.error(error);
            toast.update(toastId, { render: "Error al subir imagen", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    // Guardar cambios
    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateHomeConfig(editForm);
            setConfig(updated); // Actualizamos la vista "real"
            setIsEditing(false); // Salimos del modo edición
            toast.success("¡Portada actualizada!");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    // Cancelar edición
    const handleCancel = () => {
        // Restauramos el form a lo que tiene 'config'
        const currentFeaturedIds = config?.featuredProducts?.map(p => p._id) || [];
        setEditForm({
            heroTitle: config?.heroTitle || 'EL SABOR DE LO\nSALUDABLE',
            heroSubtitle: config?.heroSubtitle || '',
            bannerImage: config?.bannerImage || '',
            promoMessage: config?.promoMessage || '',
            featuredProducts: currentFeaturedIds
        });
        setIsEditing(false);
    };

    // DECISIÓN: ¿Qué productos mostramos en el carrusel?
    // 1. Si hay config.featuredProducts (y tiene items), usamos esos.
    // 2. Si no, usamos 'products' (que son los "latest" que trajimos al principio).
    let displayProducts = [];
    if (config?.featuredProducts && config.featuredProducts.length > 0) {
        displayProducts = config.featuredProducts;
    } else {
        displayProducts = products;
    }

    // Fallback de seguridad
    const carouselProducts = displayProducts.length > 0 ? displayProducts.slice(0, Math.min(10, displayProducts.length)) : [];

    return (
        <div className={styles.pageContainer}>

            {/* BARRA DE EDICIÓN ADMIN */}
            {isAdmin && (
                <div className={styles.adminBar}>
                    {!isEditing ? (
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            ✏️ Editar esta página
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                            </Button>
                            <Button variant="danger" onClick={handleCancel} disabled={saving}>
                                ❌ Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* HERO SECTION REDISEÑADA */}
            <section className={styles.hero}>
                <div className={styles.heroGrid}>

                    {/* IZQUIERDA: IMAGEN/BANNER */}
                    <div className={styles.heroLeft}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={isEditing ? editForm.bannerImage : (config?.bannerImage || 'https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png')}
                                alt="Nutrirte Alimenta Banner"
                                className={styles.heroLogo}
                                style={{ borderRadius: '12px', objectFit: 'cover' }}
                            />
                            {isEditing && (
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Cambiar Imagen:</label>
                                    <input type="file" onChange={handleBannerUpload} accept="image/*" />
                                    <div style={{ textAlign: 'center', margin: '5px 0', fontSize: '0.8rem' }}>O pega una URL:</div>
                                    <input
                                        type="text"
                                        name="bannerImage"
                                        value={editForm.bannerImage}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DERECHA: TEXTOS */}
                    <div className={styles.heroRight}>

                        {/* Promo Badge */}
                        <div style={{ marginBottom: '1rem' }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#ece2e2' }}>Texto Promocional (Opcional):</label>
                                    <input
                                        name="promoMessage"
                                        value={editForm.promoMessage}
                                        onChange={handleChange}
                                        placeholder="Ej: ¡Envío Gratis!"
                                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            ) : (
                                (config?.promoMessage || config === null) && ( // Si null (loading) o hay mensaje
                                    <span className={styles.badge} style={{ backgroundColor: 'var(--color-acento)', color: 'white' }}>
                                        {config?.promoMessage || 'DISFRUTÁ LO NATURAL'}
                                    </span>
                                )
                            )}
                        </div>

                        {/* Title */}
                        <h1 className={styles.title} style={{ whiteSpace: 'pre-line' }}>
                            {isEditing ? (
                                <textarea
                                    name="heroTitle"
                                    value={editForm.heroTitle}
                                    onChange={handleChange}
                                    className={styles.editInput}
                                    style={{ fontSize: '2rem', fontFamily: 'var(--fuente-titulos)', width: '100%', border: '2px dashed #ccc' }}
                                />
                            ) : (
                                config?.heroTitle || 'EL SABOR DE LO\nSALUDABLE'
                            )}
                        </h1>

                        {/* Subtitle */}
                        <div className={styles.subtitle}>
                            {isEditing ? (
                                <textarea
                                    name="heroSubtitle"
                                    value={editForm.heroSubtitle}
                                    onChange={handleChange}
                                    className={styles.editInput}
                                    style={{ width: '100%', minHeight: '100px', border: '1px dashed #ccc' }}
                                />
                            ) : (
                                config?.heroSubtitle || 'Disfrutamos de brindar una experiencia gastronómica única, donde calidad, sabor y salud se unen. Gracias a nuestros clientes, seguimos creciendo día a día. ¡Elegí lo saludable!'
                            )}
                        </div>

                        {!isEditing && (
                            <Link to="/productos">
                                <Button variant='primary' size="large">VER CATÁLOGO</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* NOVEDADES / CARRUSEL */}
            {loading ? <Spinner /> : (
                <section className={styles.carouselSection}>
                    <h2 className={styles.sectionTitle}>
                        {isEditing ? 'Seleccionar Productos Destacados' : 'Novedades'}
                    </h2>

                    {/* SELECTOR DE PRODUCTOS (Solo visible en edición) */}
                    {isEditing && (
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '30px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '2px dashed var(--color-principal)'
                        }}>
                            <p style={{ marginBottom: '10px', color: '#666' }}>Selecciona los productos que quieres que aparezcan en el inicio (Máx 10). Los marcados en <strong style={{ color: 'var(--color-principal)' }}>Naranja</strong> están seleccionados.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {allProductsForSelect.map(p => {
                                    const isSelected = editForm.featuredProducts.includes(p._id);
                                    return (
                                        <div
                                            key={p._id}
                                            onClick={() => toggleFeaturedProduct(p._id)}
                                            style={{
                                                padding: '10px',
                                                border: isSelected ? '2px solid var(--color-principal)' : '1px solid #ddd',
                                                backgroundColor: isSelected ? '#fff8dc' : 'white',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #ccc', background: isSelected ? 'var(--color-principal)' : 'white' }} />
                                            <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{p.nombre}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* VISTA PREVIA DEL CARRUSEL (Siempre visible, refleja la selección) */}
                    {isEditing && <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Vista Previa del Carrusel</h3>}

                    {carouselProducts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'white' }}>No hay productos destacados seleccionados.</p>
                    ) : (
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                            }}
                        >
                            {carouselProducts.map(product => (
                                <SwiperSlide key={product._id}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </section>
            )}
        </div>
    );
};

export default GuestHomePage;
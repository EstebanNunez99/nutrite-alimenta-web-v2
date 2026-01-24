//verificado
// frontend/src/pages/GuestHomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import styles from './styles/GuestHomePage.module.css';
import Button from '../components/ui/Button';
import ProductCard from '../features/products/ProductCard';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GuestHomePage = () => {
    useDocumentTitle('Inicio')
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Obtener más productos para tener carrusel y destacado
                const data = await getAllProducts(1, 'createdAt_desc', '', '');
                const allProducts = data.products || [];
                setProducts(allProducts);
            } catch (error) {
                console.error("Error al cargar productos:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const carouselProducts = products.length > 0 ? products.slice(0, Math.min(7, products.length)) : [];

    return (
        <div className={styles.pageContainer}>
            {/* HERO SECTION REDISEÑADA */}
            <section className={styles.hero}>
                <div className={styles.heroGrid}>
                    {/* IZQUIERDA: LOGO GRANDE */}
                    <div className={styles.heroLeft}>
                        <img
                            src="https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png"
                            alt="Nutrirte Alimenta Logo"
                            className={styles.heroLogo}
                        />
                    </div>

                    {/* DERECHA: TEXTO LEYENDA */}
                    <div className={styles.heroRight}>
                        <span className={styles.badge}>DIFRUTÁ LO NATURAL</span>
                        <h1 className={styles.title}>
                            EL SABOR DE LO<br />
                            SALUDABLE
                        </h1>
                        <p className={styles.subtitle}>
                            Disfrutamos de brindar una experiencia gastronómica única, donde calidad, sabor y salud se unen.
                            Gracias a nuestros clientes, seguimos creciendo día a día.
                            ¡Elegí lo saludable!
                        </p>
                        <Link to="/productos">
                            <Button variant='primary' size="large">VER CATÁLOGO</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* NOVEDADES / CARRUSEL */}
            {loading ? <Spinner /> : (
                <section className={styles.carouselSection}>
                    <h2 className={styles.sectionTitle}>Novedades</h2>
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
                </section>
            )}
        </div>
    );
};

export default GuestHomePage;
//verificado
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import styles from "./styles/CartPage.module.css";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getHomeConfig } from '../services/configService';
import { getAllProducts } from '../services/productService';
import ProductCard from '../features/products/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CartPage = () => {

  useDocumentTitle('Carrito')
  // 1. IMPORTAMOS LA NUEVA FUNCIÓN DEL HOOK
  const { cart, removeItem, updateItemQuantity, loading, itemCount } =
    useCart();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
        try {
            const configData = await getHomeConfig();
            if (configData && configData.featuredProducts && configData.featuredProducts.length > 0) {
                setFeaturedProducts(configData.featuredProducts.slice(0, 10));
            } else {
                // Fallback: Si no hay destacados, traemos los primeros 10 productos más nuevos
                const data = await getAllProducts(1, 'createdAt_desc', '', '');
                if (data && data.products) {
                    setFeaturedProducts(data.products.slice(0, 10));
                }
            }
        } catch (error) {
            console.error("Error fetching featured products", error);
            // Fallback en caso de error de red con config
            try {
                const data = await getAllProducts(1, 'createdAt_desc', '', '');
                if (data && data.products) {
                    setFeaturedProducts(data.products.slice(0, 10));
                }
            } catch (fallbackError) {
                console.error("Error al cargar productos de fallback", fallbackError);
            }
        } finally {
            setLoadingFeatured(false);
        }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!cart || itemCount === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Tu Carrito de Compras está Vacío</h2>
          <p>Parece que todavía no has añadido ningún producto.</p>
          <Link to="/productos">
            <Button variant="primary">Explorar Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.cantidad * item.precio,
    0
  );
  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(cartTotal);
  const formattedSubtotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(cartTotal); // Asumiendo que no hay impuestos/envío aún

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Tu Carrito de Compras</h2>
      <div className={styles.cartGrid}>
        {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
        <div className={styles.cartItemsList}>
          {cart.items.map((item) => (
            <div key={item.producto._id} className={styles.cartItem}>
              <img
                src={item.producto.imagen || "https://via.placeholder.com/100"}
                alt={item.producto.nombre}
                className={styles.itemImage}
              />

              <div className={styles.itemDetails}>
                <h4>{item.producto.nombre}</h4>
                <p>Precio Unitario: ${item.precio.toFixed(2)}</p>

                {/* 2. NUEVOS CONTROLES DE CANTIDAD */}
                <div className={styles.quantityControl}>
                  {/* ANTES: <button> */}
                  <Button
                    variant="quantity" // Usamos nuestra nueva variante
                    onClick={() =>
                      updateItemQuantity(item.producto._id, item.cantidad - 1)
                    }
                    disabled={item.cantidad <= 1}
                  >
                    -
                  </Button>
                  <span className={styles.quantityDisplay}>
                    {item.cantidad}
                  </span>
                  {/* ANTES: <button> */}
                  <Button
                    variant="quantity" // Usamos nuestra nueva variante
                    onClick={() =>
                      updateItemQuantity(item.producto._id, item.cantidad + 1)
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                variant="danger"
                onClick={() => removeItem(item.producto._id)}
                className={styles.removeItemButton}
              >
                X
              </Button>
            </div>
          ))}

          {/* --- SECCIÓN DE DESTACADOS --- */}
          {!loadingFeatured && featuredProducts.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-texto-terciario)', textTransform: 'uppercase', fontFamily: 'var(--fuente-titulos)', fontSize: '2rem' }}>
                    Por si te tienta algo más… 😉
                </h3>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    breakpoints={{
                        800: { slidesPerView: 2 }
                    }}
                    style={{ paddingBottom: '40px' }} // Espacio para la paginación
                >
                    {featuredProducts.map((product) => (
                        <SwiperSlide key={product._id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN DE COMPRA --- */}
        <div className={styles.summary}>
          <h3>Resumen de la Compra</h3>
          <div className={styles.summaryRow}>
            <span>Subtotal ({itemCount} items)</span>
            <span>{formattedSubtotal}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/checkout" style={{ width: '100%' }}>
              <Button variant="primary" style={{ width: '100%' }}>
                Proceder al Pago
              </Button>
            </Link>
            <Link to="/productos" style={{ width: '100%' }}>
              <Button variant="secondary" style={{ width: '100%' }}>
                Volver al menú
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CartPage;

//verificado
// src/features/products/ProductCard.jsx

import React from 'react';
// import { Link } from 'react-router-dom'; // Desactivamos links directos
import styles from './ProductCard.module.css';
import { useCart } from '../../hooks/useCart.js';
import { FaCartPlus, FaBan } from 'react-icons/fa';

const ProductCard = ({ product, onClick }) => {

    // El modal se encargará de añadir al carrito, pero dejamos esto por si se quisiera usar
    // el botón pequeño directo. Para el diseño "Menu", suele ser mejor que todo abra el modal.
    const { addItem } = useCart();
    const imageUrl = product.imagen || 'https://via.placeholder.com/400x400/f0f0f0/cccccc?text=Producto+Sin+Imagen';

    // Formateador para mostrar el precio con formato de moneda local
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(product.precio);

    // Handler local para clicks en la tarjeta
    const handleCardClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(product);
        }
    };

    // Handler para botón de añadir directo (opcional, si se quiere mantener)
    const handleQuickAdd = (e) => {
        e.stopPropagation(); // Para que no abra el modal
        addItem(product, 1);
    };

    const isBajoDemanda = product.tipo === 'bajo_demanda';
    const stockReal = product.stock;
    const hayStock = isBajoDemanda || stockReal > 0;

    return (
        <article className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    {/* Usamos h3 y p normales, ya no links */}
                    <h3 className={styles.cardTitle}>{product.nombre}</h3>

                    {/* Asumimos que existe descripcion, si no, mostramos un fallback o nada. 
                        En el modelo real deberíamos verificar si el backend lo devuelve */}
                    <p className={styles.cardDescription}>
                        {product.descripcion || product.ingredientes || 'Delicioso y fresco.'}
                    </p>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.priceContainer}>
                        <span className={styles.cardPrice}>{formattedPrice}</span>
                    </div>

                    {/* El botón pequeño aún puede funcionar para añadir 1 rápido, o quitarse si se prefiere solo modal */}
                    <button
                        className={`${styles.addButton} ${!hayStock ? styles.disabledButton : ''}`}
                        onClick={handleQuickAdd}
                        disabled={!hayStock}
                        title={hayStock ? "Agregar 1 al carrito" : "Sin stock"}
                    >
                        {hayStock ? <FaCartPlus /> : <FaBan />}
                    </button>
                </div>
            </div>

            <div className={styles.imageLink}> {/* Ya no es Link */}
                <div className={styles.imageContainer}>
                    <img src={imageUrl} alt={product.nombre} className={styles.cardImage} />
                    {!hayStock && <span className={styles.badgeAgotado}>Agotado</span>}
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
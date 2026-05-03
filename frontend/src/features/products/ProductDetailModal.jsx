// src/features/products/ProductDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ProductDetailModal.module.css';
import { FaTimes, FaMinus, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { useCart } from '../../hooks/useCart';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [comment, setComment] = useState('');

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuantity(1); // Reset state
            setComment('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const imageUrl = product.imagen || 'https://via.placeholder.com/400x400/f0f0f0/cccccc?text=Producto+Sin+Imagen';

    // Calcular precio total
    const totalPrice = product.precio * quantity;
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(product.precio);

    const formattedTotalPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(totalPrice);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    const handleAddToOrder = () => {
        addItem(product, quantity, comment); // Asumimos que addItem soporta comentarios o lo adaptamos
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                {/* Header Image */}
                <div className={styles.imageContainer}>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        <FaChevronLeft />
                    </button>
                    <img src={imageUrl} alt={product.nombre} className={styles.productImage} />
                </div>

                {/* Scrollable Content */}
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{product.nombre}</h2>
                        <span className={styles.price}>{formattedPrice}</span>
                    </div>

                    <p className={styles.description}>
                        {product.descripcion || product.ingredientes || 'Una deliciosa opción para tu comida de hoy. Elaborada con los mejores ingredientes.'}
                    </p>

                    {/* Quantity Selector */}
                    {/* (Opcional según referencia: a veces está separado, aquí lo pongo para funcionalidad completa) */}

                    <div className={styles.sectionTitle}>Comentarios</div>
                    <div className={styles.commentsContainer}>
                        <textarea
                            className={styles.commentsInput}
                            placeholder="Agrega notas (sin coco rallado, sin chips de choco, ...)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <div className={styles.quantityControl}>
                        <button className={styles.qtyBtn} onClick={handleDecrement} disabled={quantity <= 1}>
                            <FaMinus size={14} />
                        </button>
                        <span className={styles.quantity}>{quantity}</span>
                        <button className={styles.qtyBtn} onClick={handleIncrement}>
                            <FaPlus size={14} />
                        </button>
                    </div>
                </div>

                {/* Footer Action */}
                <div className={styles.footer}>
                    <button className={styles.addButton} onClick={handleAddToOrder}>
                        <span>Agregar a mi pedido</span>
                        <span className={styles.btnPrice}>{formattedTotalPrice}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductDetailModal;

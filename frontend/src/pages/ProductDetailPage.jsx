//verficado
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../hooks/useCart';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import styles from './styles/ProductDetailPage.module.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [stockEngaged, setStockEngaged] = useState(1)

    // Título dinámico del documento
    useDocumentTitle(product ? product.nombre : 'Cargando producto...');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('No se pudo encontrar el producto.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addItem(product, quantity);
    };

    const handleStockEngaged = () => {

    }

    if (loading) return <Spinner />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!product) return <div className={styles.error}>Producto no encontrado.</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.productGrid}>
                <div className={styles.imageContainer}>
                    <img src={product.imagen} alt={product.nombre} className={styles.productImage} />
                </div>
                <div className={styles.detailsContainer}>
                    <h1 className={styles.productTitle}>{product.nombre}</h1>
                    <p className={styles.productPrice}>${product.precio.toFixed(2)}</p>
                    <p className={styles.productDescription}>{product.descripcion}</p>

                    <div className={styles.stockInfo}>
                        {product.tipo === 'bajo_demanda' ? (
                            <span>Disponibilidad: <strong style={{ color: '#e67e22' }}>Bajo Demanda (Producción)</strong></span>
                        ) : (
                            <span>Disponible: {(product.stock - product.stockComprometido)}</span>
                        )}
                    </div>

                    {console.log(product.stockComprometido)}

                    {(product.tipo === 'bajo_demanda' || (product.stock - product.stockComprometido) > 0) && (
                        <div className={styles.actions}>
                            <div className={styles.quantityControl}>
                                <label htmlFor="quantity">Cantidad:</label>
                                <select
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className={styles.quantitySelect}
                                >
                                    {/* Si es bajo demanda mostramos una lista fija (ej. 1 a 20), sino basado en stock */}
                                    {product.tipo === 'bajo_demanda'
                                        ? [...Array(20).keys()].map(x => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))
                                        : [...Array((product.stock - product.stockComprometido)).keys()].slice(0, 10).map(x => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <Button variant="primary" onClick={handleAddToCart}>
                                Añadir al Carrito
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
//revisado
//verificado
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { getAllProducts, getAllCategories } from '../services/productService';
import { getSettings } from '../services/settingsService'; // <-- IMPORTADO
import ProductCard from '../features/products/ProductCard';
import Paginate from '../components/ui/Paginate';
import Spinner from '../components/ui/Spinner';
import styles from './styles/ProductsPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle'
import ProductDetailModal from '../features/products/ProductDetailModal';

const ProductsPage = () => {
    useDocumentTitle('Catálogo')
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Configuración global (Horarios y dirección)
    const [settings, setSettings] = useState(null);

    // --- STATE PARA MODAL ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- NUEVOS ESTADOS PARA ORDENAR Y FILTRAR ---
    const [sort, setSort] = useState('createdAt_desc'); // Por defecto: más nuevos primero
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState(''); // Por defecto: todas

    // --- CARGAR CONFIGURACIÓN GLOBAL ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (err) {
                console.error("Error loading settings", err);
            }
        };
        fetchSettings();
    }, []);

    // --- USEEFFECT PARA CARGAR CATEGORÍAS (SOLO UNA VEZ) ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getAllCategories();
                // Asegurarnos de que siempre sea un array
                setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
            } catch (err) {
                console.error("No se pudieron cargar las categorías:", err);
                // Si hay error, mantener categories como array vacío
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // --- NUEVO ESTADO PARA BÚSQUEDA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Resetear a página 1 al buscar
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- USEEFFECT MEJORADO PARA CARGAR PRODUCTOS ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Pasamos debouncedSearch al servicio
            const data = await getAllProducts(page, sort, filterCategory, debouncedSearch);
            // Safety check for data structure
            setProducts(data?.products || []);
            setTotalPages(data?.totalPages || 1);
        } catch (err) {
            setError('No se pudieron cargar los productos.', err.status);
        } finally {
            setLoading(false);
        }
    }, [page, sort, filterCategory, debouncedSearch]); // Se vuelve a ejecutar si cambia la pág, orden, categoría o búsqueda

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePageChange = (newPage) => setPage(newPage);
    const handleSortChange = (e) => setPage(1) & setSort(e.target.value);
    // Nuevo handler para clicks en tabs de categoría
    const handleCategoryClick = (cat) => {
        setPage(1);
        setFilterCategory(cat === filterCategory ? '' : cat); // Toggle o selección
    };
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    // --- HANDLER PARA CLIC EN PRODUCTO (ABRIR MODAL) ---
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    if (loading && products.length === 0) return <Spinner />;
    if (error) return <div className={styles.message}>{error}</div>;

    return (
        <div className={styles.pageWrapper}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Nutrirte Alimenta</h1>
                    <p className={styles.heroSubtitle}>Descubrí nuestros productos frescos y saludables</p>
                    <div className={styles.heroInfo}>
                        <span><FaClock className={styles.icon} /> {settings?.openingHours || 'Consultar Horarios'}</span>
                        <span><FaMapMarkerAlt className={styles.icon} /> {settings?.address || 'Corrientes, Argentina'}</span>
                    </div>
                </div>
            </section>

            <div className={styles.pageContainer}>
                {/* BARRA DE BÚSQUEDA Y FILTROS */}
                <div className={styles.filterSection}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        <FaSearch className={styles.searchIcon} />
                    </div>

                    <div className={styles.controlsGroup}>
                        <select id="sort-order" className={styles.sortSelect} onChange={handleSortChange} value={sort}>
                            <option value="createdAt_desc">Más Nuevos</option>
                            <option value="precio_asc">Precio: Menor a Mayor</option>
                            <option value="precio_desc">Precio: Mayor a Menor</option>
                            <option value="nombre_asc">Nombre: A-Z</option>
                            <option value="nombre_desc">Nombre: Z-A</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORY TABS */}
                <div className={styles.categoriesContainer}>
                    <button
                        className={`${styles.categoryTab} ${filterCategory === '' ? styles.activeTab : ''}`}
                        onClick={() => handleCategoryClick('')}
                    >
                        Todos
                    </button>
                    {Array.isArray(categories) && categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.categoryTab} ${filterCategory === cat ? styles.activeTab : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRILLA DE PRODUCTOS */}
                {loading ? <Spinner /> : (
                    products.length > 0 ? (
                        <>
                            <h2 className={styles.sectionTitle}>
                                {filterCategory ? `Categoría: ${filterCategory}` : 'Todos los Productos'}
                            </h2>
                            <div className={styles.productsGrid}>
                                {products.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onClick={handleProductClick} // Pasamos el handler
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <h3>No encontramos lo que buscas</h3>
                            <p>Intenta con otra categoría o término de búsqueda</p>
                            <button onClick={() => { setFilterCategory(''); setSearchTerm('') }} className={styles.resetButton}>
                                Ver todo
                            </button>
                        </div>
                    )
                )}

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className={styles.paginationContainer}>
                        <Paginate pages={totalPages} page={page} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* PRODUCT DETAIL MODAL */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ProductsPage;
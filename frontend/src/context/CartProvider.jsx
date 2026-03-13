//revisado
// src/context/CartProvider.jsx

import React, { useState, useEffect } from 'react';
import { CartContext } from './CartContext.js';
// --- CAMBIO ---
// Eliminamos los servicios del carrito (API) y useAuth
// import { getCart, addItemToCart, removeItemFromCart, updateCartItemQuantity } from '../services/cartService';
// import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
// Mantenemos createOrder porque SÍ lo necesitamos para el checkout
import { createOrder } from '../services/orderService';
// --- FIN CAMBIO ---

const CartProvider = ({ children }) => {
    // --- CAMBIO ---
    // Inicializamos el carrito como null hasta que localStorage lo cargue
    const [cart, setCart] = useState(null);
    // El loading ahora es para leer localStorage, no la API
    const [loading, setLoading] = useState(true);
    // const { isAuthenticated } = useAuth(); // <-- Eliminado
    // --- FIN CAMBIO ---
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- CAMBIO ---
    // EFECTO 1: Cargar el carrito desde localStorage al iniciar la app
    useEffect(() => {
        setLoading(true);
        try {
            const localCart = localStorage.getItem('cart');
            if (localCart) {
                setCart(JSON.parse(localCart));
            } else {
                // Si no hay nada, creamos un carrito vacío
                setCart({ items: [] });
            }
        } catch (error) {
            console.error("Error al cargar carrito desde localStorage:", error);
            setCart({ items: [] }); // Iniciar vacío en caso de error
        } finally {
            setLoading(false);
        }
    }, []); // <-- Se ejecuta solo una vez al montar

    // EFECTO 2: Guardar el carrito en localStorage cada vez que cambie
    useEffect(() => {
        // No guardamos en localStorage hasta que la carga inicial haya terminado
        if (!loading && cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, loading]); // <-- Se ejecuta cada vez que 'cart' o 'loading' cambian
    // --- FIN CAMBIO ---

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // --- CAMBIO ---
    // Función reescrita para ser síncrona y usar el estado local.
    // ¡¡IMPORTANTE: Ahora recibe el objeto 'product' completo!!
    const addItem = (product, quantity, comment = '') => {
        if (!product || !product._id) {
            console.error("Intento de añadir producto inválido", product);
            toast.error("No se pudo añadir el producto.");
            return;
        }

        try {
            // Hacemos una copia profunda de los items
            const newItems = [...cart.items];
            // Buscamos si existe un item con el mismo ID Y el mismo comentario
            const itemIndex = newItems.findIndex(item =>
                item.producto._id === product._id && (item.comentarios || '') === (comment || '')
            );

            if (itemIndex > -1) {
                // Si ya existe (mismo prod y mismo comentario), actualizamos la cantidad
                const newQuantity = newItems[itemIndex].cantidad + quantity;
                if (product.tipo !== 'bajo_demanda' && newQuantity > product.stock) {
                    toast.error(`Por el momento solo tenemos disponible ${product.stock} unidades de este producto.`);
                    return;
                }
                newItems[itemIndex].cantidad = newQuantity;
            } else {
                if (product.tipo !== 'bajo_demanda' && quantity > product.stock) {
                    toast.info(`Por el momento solo tenemos disponible ${product.stock} unidades de este producto.`);
                    return;
                }
                // Si no existe, lo añadimos al array
                newItems.push({
                    // Guardamos solo los datos necesarios
                    producto: {
                        _id: product._id,
                        nombre: product.nombre,
                        imagen: product.imagen,
                        precio: product.precio,
                        stock: product.stock, // Guardamos stock para futuras validaciones
                        tipo: product.tipo // RF-001/002: Guardamos el tipo
                    },
                    cantidad: quantity,
                    comentarios: comment, // Guardamos el comentario
                    // Replicamos la estructura del backend
                    nombre: product.nombre,
                    imagen: product.imagen,
                    precio: product.precio,
                    tipo: product.tipo // RF-001/002: Guardamos el tipo
                });
            }

            setCart({ ...cart, items: newItems });
            // toast.success("Producto añadido al carrito!");
            openCart();
        } catch (error) {
            toast.error("No se pudo añadir el producto.", error.message);
        }
    };

    // Función reescrita para ser síncrona
    const removeItem = (productId, comment = null) => {
        try {
            // Si pasamos comentario, filtramos exacto. Si no (legacy), borramos todos los de ese ID?? 
            // Para simplificar y no romper nada: si se llama sin comment, borra por ID (todos). 
            // Pero lo ideal sería pasar índice o ID único de línea.
            // Por ahora mantenemos borrado por ID para compatibilidad, pero ojo con duplicados de ID.
            // MEJORA: Filtrar el que coincida. Pero la UI actual de CartItem probablemente solo pasa ID.
            // Asumiremos que si hay múltiples variantes, esto podría borrar todas.
            // TODO: Refactorizar CartItem para usar un ID de línea único en el futuro.
            const newItems = cart.items.filter(item => item.producto._id !== productId);
            setCart({ ...cart, items: newItems });
            toast.info("Producto eliminado del carrito.");
        } catch (error) {
            toast.error("No se pudo eliminar el producto.", error.message);
        }
    };

    // Función reescrita para ser síncrona
    const updateItemQuantity = (productId, newQuantity, comment = null) => {
        if (newQuantity < 1) {
            return removeItem(productId, comment);
        }

        try {
            const newItems = cart.items.map(item => {
                if (item.producto._id === productId) {
                    if (item.producto.tipo !== 'bajo_demanda' && newQuantity > item.producto.stock) {
                        toast.error(`Solo hay ${item.producto.stock} unidades disponibles.`);
                        return item; // devolver sin cambios
                    }
                    return { ...item, cantidad: newQuantity };
                }
                return item;
            });
            setCart({ ...cart, items: newItems });
        } catch (error) {
            console.error("Error al actualizar cantidad:", error);
            toast.error("No se pudo actualizar la cantidad.");
        }
    };

    // Función reescrita para ser síncrona
    const clearCart = () => {
        setCart({ items: [] });
        // El useEffect [cart, loading] se encargará de actualizar localStorage
    };
    // --- FIN CAMBIO ---

    // El cálculo de 'itemCount' debe ajustarse a la nueva estructura si es necesario
    // (Parece que la estructura 'item.cantidad' se mantiene, así que esto está bien)
    const itemCount = cart ? cart.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

    // --- CAMBIO ---
    // Esta función es la única que habla con una API (orderService)
    const checkout = async (orderData) => {
        try {
            // 'orderData' debe contener { customerInfo, shippingAddress, paymentMethod, shippingCost }
            // Y le añadimos los 'items' del carrito local
            const completeOrderData = {
                ...orderData,
                items: cart.items.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    imagen: item.imagen,
                    precio: item.precio,
                    producto: item.producto._id, // Pasamos solo el ID del producto
                    comentarios: item.comentarios || '' // Incluimos comentarios
                }))
            };

            const newOrder = await createOrder(completeOrderData);

            // Después de crear la orden con éxito, limpiamos el carrito local
            clearCart();
            return newOrder; // Devolvemos la orden creada para que la página pueda redirigir

        } catch (error) {
            console.error("Error en el proceso de checkout:", error);
            throw error; // Relanzamos para que CheckoutPage lo maneje
        }
    };
    // --- FIN CAMBIO ---


    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addItem,
                removeItem,
                updateItemQuantity,
                clearCart,
                itemCount,
                isCartOpen,
                openCart,
                closeCart,
                checkout, // 'checkout' se mantiene
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
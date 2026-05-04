//verificado
// frontend/src/components/layout/Header.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaFacebookF, FaInstagram, FaTiktok, FaArrowLeft } from "react-icons/fa"; // Iconos sociales y de UI
import { FaXTwitter } from "react-icons/fa6"; // X icon
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import styles from "./Header.module.css";

// --- NavLinks Component ---
const NavLinks = ({ onLinkClick, mobile = false }) => {
  const { isAuthenticated, usuario, logout } = useAuth(); // Agregamos logout
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate(); // Necesitamos navigate para redirigir

  const handleCartClick = (e) => {
    e.preventDefault();
    openCart();
    if (onLinkClick) onLinkClick();
  };

  const handleLogout = () => {
    logout();
    if (onLinkClick) onLinkClick();
    // Redirección opcional
    navigate('/auth');
  };

  const linkClass = styles.navLink;

  return (
    <>
      {isAuthenticated && usuario.rol === "admin" ? (
        <>
          <Link to="/" className={linkClass} onClick={onLinkClick}>Inicio</Link>
          <Link to="/admin" className={linkClass} onClick={onLinkClick}>Panel Principal</Link>

          {/* Atajos MÓVILES para Admin (Solo visibles en menú hamburguesa) */}
          {mobile && (
            <>
              <Link to="/admin/products" className={linkClass} onClick={onLinkClick} style={{ fontSize: '0.9em', opacity: 0.8 }}>📦 Productos</Link>
              <Link to="/admin/sales-history" className={linkClass} onClick={onLinkClick} style={{ fontSize: '0.9em', opacity: 0.8 }}>💰 Ventas</Link>
              <Link to="/admin/orders/manual" className={linkClass} onClick={onLinkClick} style={{ fontSize: '0.9em', opacity: 0.8 }}>+ Nueva Venta</Link>
            </>
          )}

          <Link to="/admin/settings" className={linkClass} onClick={onLinkClick}>Configuración</Link>

          {/* Botón de Cerrar Sesión */}
          <button
            className={linkClass}
            onClick={handleLogout}
            style={{ color: '#ff6b6b' }} // Un rojo suave para destacar "salir"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <>
          <Link to="/" className={linkClass} onClick={onLinkClick}>Inicio</Link>          <Link to="/productos" className={linkClass} onClick={onLinkClick}>Catálogo</Link>
          {/* <Link to="/franquicias" className={linkClass} onClick={onLinkClick}>Franquíciate</Link> */}
          {/* <Link to="/seguimiento" className={linkClass} onClick={onLinkClick}>Mi Pedido</Link> */}

          <button className={linkClass} onClick={handleCartClick}>
            Carrito ({itemCount})
          </button>
        </>
      )}
    </>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>

      {/* SECCION IZQUIERDA: LOGO */}
      <div className={styles.logoSection}>
        <div className={styles.logoContainer}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
            <img src="https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png" alt="Logo" className={styles.logoImg} />
            <h1 className={styles.headerTitle}>
                NUTRIRTE<br/>ALIMENTA
            </h1>
          </Link>
        </div>
      </div>

      {/* SECCION DERECHA: BARRA DE NAVEGACION */}
      <div className={styles.navSection}>
        <nav className={styles.desktopNav}>
          <NavLinks />
        </nav>
      </div>

      {/* HAMBURGER BUTTON (Mobile only) */}
      <button
        className={`${styles.hamburgerButton} ${isMenuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
        aria-label="Abrir Cataólgo"
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* MOBILE MENU OVERLAY & DRAWER */}
      <div
        className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.isOpen : ""}`}
        onClick={closeMenu}
      >
        <div className={`${styles.mobileMenuDrawer} ${isMenuOpen ? styles.isOpen : ""}`} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeDrawerButton} onClick={closeMenu} aria-label="Cerrar menú">
            <FaArrowLeft />
          </button>
          <nav className={styles.mobileNavLinks}>
            <NavLinks onLinkClick={closeMenu} mobile />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
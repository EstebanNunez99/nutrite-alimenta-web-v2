//verificado
// frontend/src/components/layout/Header.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa"; // Iconos sociales
import { FaXTwitter } from "react-icons/fa6"; // X icon
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import styles from "./Header.module.css";

// --- NavLinks Component ---
const NavLinks = ({ onLinkClick, mobile = false }) => {
  const { isAuthenticated, usuario } = useAuth();
  const { itemCount, openCart } = useCart();

  const handleCartClick = (e) => {
    e.preventDefault();
    openCart();
    if (onLinkClick) onLinkClick();
  };

  const linkClass = styles.navLink;

  return (
    <>
      {isAuthenticated && usuario.rol === "admin" ? (
        <>
          <Link to="/admin" className={linkClass} onClick={onLinkClick}>Panel Admin</Link>
          <Link to="/admin/settings" className={linkClass} onClick={onLinkClick}>Configuración</Link>
          <Link to="/perfil" className={linkClass} onClick={onLinkClick}>Mi Perfil</Link>
        </>
      ) : (
        <>
          <Link to="/" className={linkClass} onClick={onLinkClick}>Inicio</Link>          <Link to="/productos" className={linkClass} onClick={onLinkClick}>Catálogo</Link>
          {/* <Link to="/franquicias" className={linkClass} onClick={onLinkClick}>Franquíciate</Link> */}
          <Link to="/seguimiento" className={linkClass} onClick={onLinkClick}>Mi Pedido</Link>

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
          <Link to="/">
            <img src="https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png" alt="Logo" className={styles.logoImg} />
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

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ""}`}
        onClick={closeMenu}
      >
        <nav className={styles.mobileNavLinks} onClick={(e) => e.stopPropagation()}>
          <NavLinks onLinkClick={closeMenu} mobile />
        </nav>
      </div>
    </header>
  );
};

export default Header;
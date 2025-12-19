//verificado
// frontend/src/components/layout/Header.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
// import { toast } from "react-toastify"; // <-- Eliminado (ya no se usa)
import Button from "../ui/Button";
import styles from "./Header.module.css";

// --- CAMBIO: Lógica de NavLinks completamente refactorizada ---
const NavLinks = ({ onLinkClick }) => {
  const { isAuthenticated, usuario } = useAuth();
  const { itemCount, openCart } = useCart();
  // const navigate = useNavigate(); // <-- Eliminado (ya no se usa)

  // Eliminada la función 'handlePrivateLinkClick'

  // La lógica del carrito ahora es pública
  const handleCartClick = (e) => {
    e.preventDefault();
    openCart();
    if (onLinkClick) onLinkClick();
  };

  return (
    <>
      {isAuthenticated && usuario.rol === "admin" ? (
        // --- VISTA DE ADMIN ---
        <>
          <Button to="/admin" variant="primary" onClick={onLinkClick}>
            Panel Admin
          </Button>
          <Button to="/admin/settings" variant="secondary" onClick={onLinkClick}>
            Configuracion
          </Button>
          <Button to="/perfil" variant="link" onClick={onLinkClick}>
            Mi Perfil
          </Button>
          {/* El admin no ve el carrito ni el catálogo general */}
        </>
      ) : (
        // --- VISTA DE INVITADO ---
        <>
          <Button to="/" variant="link" onClick={onLinkClick}>Inicio</Button>
          <Button to="/productos" variant="link" onClick={onLinkClick}>Catálogo</Button>

          {/* Reemplazamos "Mis Pedidos" por "Seguimiento" */}
          <Button to="/seguimiento" variant="link" onClick={onLinkClick}>
            Mi pedido
          </Button>

          <Button variant="link" onClick={handleCartClick}>
            Carrito ({itemCount})
          </Button>
        </>
      )}
    </>
  );
};
// --- FIN CAMBIO ---

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
      <div className={styles.leftSection}>
        <Link to="/" className={styles.logo}>
          <img src="https://res.cloudinary.com/drk7ixxdm/image/upload/v1766147064/logo-nutrirte-v2_tm4wpo.png" alt="Logo E.N." className={styles.logoImg} />
        </Link>
      </div>

      <div className={styles.centerSection}>
        <Link to="/" className={styles.storeLink}>
          <h1 className={styles.storeTitle}>Nutrirte Alimenta</h1>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <nav className={styles.desktopNav}>
          <NavLinks />
        </nav>

        <button
          className={`${styles.hamburgerButton} ${isMenuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ""}`}
        onClick={closeMenu}
      >
        <nav className={styles.mobileNavLinks} onClick={(e) => e.stopPropagation()}>
          <NavLinks onLinkClick={closeMenu} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
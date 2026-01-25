//verificado
// src/components/layout/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter, FaTelegram, FaWhatsapp, FaMapMarkerAlt, FaClock, FaPhone } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { getSettings } from "../../services/settingsService"; // Importamos servicio

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Cargar config para mostrar datos reales
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error cargando footer info", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Sobre Nutrirte</h4>
          <p className={styles.footerText} style={{ marginBottom: '1rem' }}>
            Alimentación saludable y consciente.
          </p>

          {/* INFORMACIÓN DINÁMICA */}
          {settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: '#ccc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt /> <span>{settings.address || 'Dirección no configurada'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock /> <span>{settings.openingHours || 'Horarios no configurados'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPhone /> <span>{settings.contactPhone || 'Teléfono no disponible'}</span>
              </div>
            </div>
          )}

        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Navegación</h4>
          <ul className={styles.navList}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Catálogo</Link></li>

            <li><Link to="/seguimiento">Mi pedido</Link></li>
            <li><Link to="/auth">Admin</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Mis Redes</h4>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/esteban.ignacio.1460/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/esteban_nnunez/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://x.com/Estebannunex" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Contactáme</h4>
          <div className={styles.socialIcons}>
            <a href={`mailto:${settings?.contactEmail || 'nunezesteban750@gmail.com'}?subject=Consulta`} aria-label="Email">
              <MdOutlineMail />
            </a>
            <a href="https://wa.me/qr/UNO32CGW2ZE6D1" target="_blank" rel="noopener noreferrer" aria-label="Whatsapp">
              <FaWhatsapp />
            </a>
            <a href="https://t.me/+543781408870" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <FaTelegram />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>
          &copy; {new Date().getFullYear()} <span> Todos los derechos reservados. </span> Diseñado y desarrollado por Esteban Nuñez.
        </p>
        <Link to="/acerca-de">Acerca de EN S.A</Link>
      </div>
    </footer>
  );
};

export default Footer;
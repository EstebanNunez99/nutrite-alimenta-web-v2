//verificado
// src/components/layout/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter, FaTelegram, FaWhatsapp, FaMapMarkerAlt, FaClock, FaPhone } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { getSettings, updateSettings } from "../../services/settingsService"; // Importamos servicio
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import Button from "../ui/Button";

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Cargar config para mostrar datos reales
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        setEditForm(data); // Inicializar form
      } catch (error) {
        console.error("Error cargando footer info", error);
      }
    };
    fetchSettings();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar: resetear form
      setEditForm(settings);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (network, field, value) => {
    setEditForm(prev => ({
      ...prev,
      socialNetworks: {
        ...prev.socialNetworks,
        [network]: {
          ...prev.socialNetworks?.[network],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateSettings(editForm);
      setSettings(updated);
      setIsEditing(false);
      toast.success("Info del pie de página actualizada");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar cambios");
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Sobre Nutrirte</h4>
          <p className={styles.footerText} style={{ marginBottom: '1rem' }}>
            Alimentación saludable y consciente.
          </p>

          {/* INFORMACIÓN DINÁMICA */}

          {/* INFORMACIÓN DINÁMICA */}
          {settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: '#ccc' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt />
                {isEditing ? (
                  <input
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Dirección"
                  />
                ) : (
                  <span>{settings.address || 'Dirección no configurada'}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock />
                {isEditing ? (
                  <input
                    name="openingHours"
                    value={editForm.openingHours || ''}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Horarios"
                  />
                ) : (
                  <span>{settings.openingHours || 'Horarios no configurados'}</span>
                )}
              </div>

              {(isEditing || (settings?.contactPhoneEnabled ?? true)) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPhone />
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                      <input
                        name="contactPhone"
                        value={editForm.contactPhone || ''}
                        onChange={handleInputChange}
                        className={styles.editInput}
                        placeholder="Teléfono"
                      />
                      <input
                        type="checkbox"
                        name="contactPhoneEnabled"
                        checked={editForm.contactPhoneEnabled ?? true}
                        onChange={(e) => setEditForm({ ...editForm, contactPhoneEnabled: e.target.checked })}
                      />
                    </div>
                  ) : (
                    <span>{settings.contactPhone || 'Teléfono no disponible'}</span>
                  )}
                </div>
              )}

              {/* Admin Controls */}
              {isAdmin && !isEditing && (
                <div style={{ marginTop: '10px' }}>
                  <Button
                    variant="secondary"
                    onClick={handleEditToggle}
                    size="small"
                    style={{ fontSize: '0.8rem', padding: '5px 10px' }} // Ajustes inline para que no sea tan grande
                  >
                    ✏️ Editar Información
                  </Button>
                </div>
              )}

              {isEditing && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  <Button variant="primary" size="small" onClick={handleSave}>Guardar</Button>
                  <Button variant="secondary" size="small" onClick={handleEditToggle}>Cancelar</Button>
                </div>
              )}

            </div>
          )}

        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Navegación</h4>
          <ul className={styles.navList}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Catálogo</Link></li>

            <li><Link to="/seguimiento">Mi pedido</Link></li>
          </ul>
        </div>


        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Mis Redes</h4>
          <div className={styles.socialIcons}>
            {/* Facebook */}
            <div style={{ display: 'flex', flexDirection: isEditing ? 'column' : 'row', gap: isEditing ? '5px' : '10px' }}>
              {isEditing ? (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaFacebook />
                    <input
                      value={editForm.socialNetworks?.facebook?.url || ''}
                      onChange={(e) => handleSocialChange('facebook', 'url', e.target.value)}
                      className={styles.editInput}
                      placeholder="Facebook URL"
                    />
                    <input
                      type="checkbox"
                      checked={editForm.socialNetworks?.facebook?.enabled || false}
                      onChange={(e) => handleSocialChange('facebook', 'enabled', e.target.checked)}
                    />
                  </div>
                </div>
              ) : (
                settings?.socialNetworks?.facebook?.enabled && (
                  <a href={settings.socialNetworks.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook />
                  </a>
                )
              )}

              {/* Instagram */}
              {isEditing ? (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaInstagram />
                    <input
                      value={editForm.socialNetworks?.instagram?.url || ''}
                      onChange={(e) => handleSocialChange('instagram', 'url', e.target.value)}
                      className={styles.editInput}
                      placeholder="Instagram URL"
                    />
                    <input
                      type="checkbox"
                      checked={editForm.socialNetworks?.instagram?.enabled || false}
                      onChange={(e) => handleSocialChange('instagram', 'enabled', e.target.checked)}
                    />
                  </div>
                </div>
              ) : (
                settings?.socialNetworks?.instagram?.enabled && (
                  <a href={settings.socialNetworks.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                )
              )}

              {/* Twitter */}
              {isEditing ? (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaTwitter />
                    <input
                      value={editForm.socialNetworks?.twitter?.url || ''}
                      onChange={(e) => handleSocialChange('twitter', 'url', e.target.value)}
                      className={styles.editInput}
                      placeholder="Twitter URL"
                    />
                    <input
                      type="checkbox"
                      checked={editForm.socialNetworks?.twitter?.enabled || false}
                      onChange={(e) => handleSocialChange('twitter', 'enabled', e.target.checked)}
                    />
                  </div>
                </div>
              ) : (
                settings?.socialNetworks?.twitter?.enabled && (
                  <a href={settings.socialNetworks.twitter.url} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Contactáme</h4>
          <div className={styles.socialIcons} style={{ display: 'flex', flexDirection: isEditing ? 'column' : 'row', gap: isEditing ? '5px' : '10px' }}>
            {/* Email */}
            {isEditing ? (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MdOutlineMail />
                  <input
                    name="contactEmail"
                    value={editForm.contactEmail || ''}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Email contacto"
                  />
                  <input
                    type="checkbox"
                    name="contactEmailEnabled"
                    checked={editForm.contactEmailEnabled ?? true}
                    onChange={(e) => setEditForm({ ...editForm, contactEmailEnabled: e.target.checked })}
                  />
                </div>
              </div>
            ) : (
              (settings?.contactEmailEnabled ?? true) && (
                <a href={`mailto:${settings?.contactEmail || 'nunezesteban750@gmail.com'}?subject=Consulta`} aria-label="Email">
                  <MdOutlineMail />
                </a>
              )
            )}

            {/* WhatsApp */}
            {isEditing ? (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaWhatsapp />
                  <input
                    value={editForm.socialNetworks?.whatsapp?.url || ''}
                    onChange={(e) => handleSocialChange('whatsapp', 'url', e.target.value)}
                    className={styles.editInput}
                    placeholder="WhatsApp Link"
                  />
                  <input
                    type="checkbox"
                    checked={editForm.socialNetworks?.whatsapp?.enabled || false}
                    onChange={(e) => handleSocialChange('whatsapp', 'enabled', e.target.checked)}
                  />
                </div>
              </div>
            ) : (
              settings?.socialNetworks?.whatsapp?.enabled && (
                <a href={settings.socialNetworks.whatsapp.url} target="_blank" rel="noopener noreferrer" aria-label="Whatsapp">
                  <FaWhatsapp />
                </a>
              )
            )}

            {/* Telegram */}
            {isEditing ? (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaTelegram />
                  <input
                    value={editForm.socialNetworks?.telegram?.url || ''}
                    onChange={(e) => handleSocialChange('telegram', 'url', e.target.value)}
                    className={styles.editInput}
                    placeholder="Telegram Link"
                  />
                  <input
                    type="checkbox"
                    checked={editForm.socialNetworks?.telegram?.enabled || false}
                    onChange={(e) => handleSocialChange('telegram', 'enabled', e.target.checked)}
                  />
                </div>
              </div>
            ) : (
              settings?.socialNetworks?.telegram?.enabled && (
                <a href={settings.socialNetworks.telegram.url} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <FaTelegram />
                </a>
              )
            )}
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
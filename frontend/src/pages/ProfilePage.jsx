//verificada
import React, { useRef, useState } from 'react';
// import { Link } from 'react-router-dom'; // <-- Eliminado (ya no se usa)
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/userService';
import { toast } from 'react-toastify';
import UpdateProfileForm from '../features/users/UpdateProfileForm';
import UpdatePasswordForm from '../features/users/UpdatePasswordForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import styles from './styles/ProfilePage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle'

const ProfilePage = () => {
    useDocumentTitle('Mi Perfil'); // Esto ahora significa "Perfil de Admin"
    const { usuario, logout, updateUserContext } = useAuth();
    const fileInputRef = useRef(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    
    if (!usuario) return <Spinner />;

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ... (Tu lógica de validación de imagen está bien)
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecciona una imagen válida.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB.');
            return;
        }

        setUploadingPhoto(true);
        
        try {
            // ... (Tu lógica de subida de imagen está bien)
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64String = reader.result;
                    const updatedUser = await updateUserProfile({ fotoURL: base64String });
                    updateUserContext(updatedUser);
                    toast.success('Foto de perfil actualizada correctamente');
                } catch (error) {
                    console.error('Error al actualizar foto:', error);
                    toast.error('Error al actualizar la foto de perfil');
                } finally {
                    setUploadingPhoto(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error al procesar foto:', error);
            toast.error('Error al procesar la imagen');
            setUploadingPhoto(false);
        }
    };

    return (
        <div className={styles.profileContainer}>
            {/* --- SECCIÓN DEL ENCABEZADO DE LA PÁGINA --- */}
            <div className={styles.header}>
                <h2>Mi Perfil (Admin)</h2>
                <Button variant="danger" onClick={logout}>Cerrar Sesión</Button>
            </div>

            {/* --- SECCIÓN DE INFORMACIÓN DEL USUARIO (ADMIN) --- */}
            <div className={styles.infoSection}>
                <div className={styles.accountInfo}>
                    <h3>Datos de la Cuenta</h3>
                    <div className={styles.infoGrid}>
                        <p className={styles.infoLabel}>Nombre:</p>
                        <p className={styles.infoValue}>{usuario.nombre}</p>

                        <p className={styles.infoLabel}>Email:</p>
                        <p className={styles.infoValue}>{usuario.email}</p>

                        <p className={styles.infoLabel}>Teléfono:</p>
                        <p className={styles.infoValue}>
                            {usuario.telefono || <span style={{ color: '#999', fontStyle: 'italic' }}>No especificado</span>}
                        </p>
                    </div>
                </div>
                
                <div className={styles.profilePhoto}>
                    <h3>Foto de Perfil</h3>
                    <div className={styles.photoContainer}>
                        <div className={styles.photoWrapper}>
                            <img
                                src={usuario.fotoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(usuario.nombre) + '&size=200&background=random'}
                                alt="Foto de perfil"
                                className={styles.photo}
                            />
                            {uploadingPhoto && (
                                <div className={styles.photoOverlay}>
                                    <Spinner />
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />
                        <Button 
                            variant='secondary' 
                            onClick={handlePhotoClick}
                            disabled={uploadingPhoto}
                        >
                            {uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- CAMBIO --- */}
            {/* SECCIÓN DE ACCIONES (CLIENTE) ELIMINADA */}
            {/* --- FIN CAMBIO --- */}
            
            {/* --- SECCIÓN DE FORMULARIOS (ADMIN) --- */}
            <div className={styles.formsContainer}>
                <UpdateProfileForm />
                <UpdatePasswordForm />
            </div>
        </div>
    );
};

export default ProfilePage;
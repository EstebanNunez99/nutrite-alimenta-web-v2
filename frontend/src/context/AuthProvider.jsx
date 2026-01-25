//revisado
// frontend/src/context/AuthProvider.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext.js';

const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [cargando, setCargando] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUsuario(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/users/profile')
                .then(res => {
                    if (res.data.rol === 'admin') {
                        setUsuario(res.data);
                        setIsAuthenticated(true);
                    } else {
                        logout();
                    }
                })
                .catch((error) => {
                    console.error("Error validando sesión:", error);
                    // Solo cerrar sesión si el token es inválido (401)
                    if (error.response && error.response.status === 401) {
                        logout();
                    } else {
                        // Si es otro error (ej. servidor caído), no borramos el token.
                        // El usuario no podrá entrar a rutas protegidas, pero al recargar (cuando el server vuelva) funcionará.
                        setIsAuthenticated(false);
                    }
                })
                .finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, [logout]);

    const login = async (email, password) => {
        // --- CAMBIO CRÍTICO ---
        // La ruta correcta de login que verificamos en el backend es /auth/login
        const res = await api.post('/auth/login', { email, password });
        // --- FIN CAMBIO ---

        localStorage.setItem('token', res.data.token);

        // --- CAMBIO (Optimización) ---
        // La respuesta de /auth/login ya incluye el objeto 'usuario'
        // No necesitamos hacer una segunda llamada a /users/profile
        setUsuario(res.data.usuario);
        setIsAuthenticated(true);
        // --- FIN CAMBIO ---
    };

    // --- CAMBIO CRÍTICO ---
    // Eliminamos la función de registro
    // const registro = async (nombre, email, password) => { ... };
    // --- FIN CAMBIO ---

    const updateUserContext = (newUserData) => {
        setUsuario(prevUsuario => ({ ...prevUsuario, ...newUserData }));
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            usuario,
            cargando,
            login,
            // registro, // <-- Eliminado
            logout,
            updateUserContext
        }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
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
            // El interceptor ya sabe del token.
            // Esta ruta '/users/profile' es CORRECTA, la verificamos en user.routes.js
            api.get('/users/profile') 
                .then(res => {
                    // Verificamos que el usuario del token sea admin
                    if (res.data.rol === 'admin') {
                        setUsuario(res.data);
                        setIsAuthenticated(true);
                    } else {
                        // Si es un token de un 'cliente' (quizás de una versión vieja), lo sacamos
                        logout();
                    }
                })
                .catch(() => logout()) // Si el token es inválido, cerramos sesión.
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
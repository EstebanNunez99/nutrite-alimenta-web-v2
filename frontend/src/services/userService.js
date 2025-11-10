//revisado
// src/services/userService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

// --- SERVICIOS DE USUARIO (SOLO PERFIL DE ADMIN) ---

// --- CAMBIO: FUNCIONES ELIMINADAS (Código Muerto) ---
// ya que no hay gestión de usuarios, solo el perfil del propio admin
// export const getAllUsers = ...
// export const getUserById = ...
// export const updateUserRole = ...
// export const deleteUser = ...
// --- FIN CAMBIO ---

/**
 * Actualiza el perfil del usuario logueado (Admin).
 * Llama a: PUT /api/users/profile
 */
export const updateUserProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
};

/**
 * Actualiza la contraseña del usuario logueado (Admin).
 * Llama a: PUT /api/users/profile/password
 */
export const updateUserPassword = async (passwordData) => {
    const response = await api.put('/users/profile/password', passwordData);
    return response.data;
};
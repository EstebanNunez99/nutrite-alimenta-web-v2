import api from '../api/axios';

// Obtener configuración pública (Home)
export const getHomeConfig = async () => {
    const response = await api.get('/config/home');
    return response.data;
};

// Actualizar configuración (Admin)
export const updateHomeConfig = async (data) => {
    const response = await api.put('/config/home', data);
    return response.data;
};

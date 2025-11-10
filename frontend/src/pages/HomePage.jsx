//verificado
// frontend/src/pages/HomePage.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';

// --- CAMBIO ---
// Importamos solo las DOS posibles páginas de inicio
import AdminHomePage from './AdminHomePage';
// import ClientHomePage from './ClientHomePage'; // <-- Eliminado
import GuestHomePage from './GuestHomePage';
import  Spinner  from '../components/ui/Spinner'
// --- FIN CAMBIO ---

const HomePage = () => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <Spinner />;
    }

    // --- CAMBIO ---
    // Lógica de despacho de dos vías (Admin o Invitado)
    if (usuario?.rol === 'admin') {
        return <AdminHomePage />;
    }
    
    // Eliminamos la lógica para 'cliente'
    // if (usuario?.rol === 'cliente') {
    //     return <ClientHomePage />;
    // }
    
    // Si no es admin, es un invitado
    return <GuestHomePage />;
    // --- FIN CAMBIO ---
};

export default HomePage;
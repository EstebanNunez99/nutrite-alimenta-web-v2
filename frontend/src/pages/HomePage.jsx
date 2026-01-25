//verificado
// frontend/src/pages/HomePage.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';

// --- CAMBIO ---
// Importamos solo las DOS posibles páginas de inicio
// import AdminHomePage from './AdminHomePage'; // <-- Eliminado (Ya no se usa en root)
// import ClientHomePage from './ClientHomePage'; // <-- Eliminado
import GuestHomePage from './GuestHomePage';
import Spinner from '../components/ui/Spinner'
// --- FIN CAMBIO ---

const HomePage = () => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <Spinner />;
    }

    // --- CAMBIO ---
    // Ahora TODOS (Guests y Admins) ven la GuestHomePage en la raíz.
    // El Admin tendrá controles extra dentro de esa página.
    return <GuestHomePage />;
    // --- FIN CAMBIO ---
};

export default HomePage;
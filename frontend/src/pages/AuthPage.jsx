// frontend/src/pages/AuthPage.jsx

import React from 'react'; // Eliminamos 'useState'
import Login from '../features/auth/Login';
// import Registro from '../features/auth/Registro'; // <-- Eliminado

const AuthPage = () => {
    // --- CAMBIO ---
    // Eliminamos el estado y la lógica para cambiar entre vistas
    // const [showLogin, setShowLogin] = useState(true);
    //
    // if (showLogin) {
    //     return <Login onSwitchToRegister={() => setShowLogin(false)} />;
    // } else {
    //     return <Registro onSwitchToLogin={() => setShowLogin(true)} />;
    // }
    // --- FIN CAMBIO ---

    // Ahora esta página solo renderiza el componente Login.
    // También eliminamos la prop 'onSwitchToRegister'
    return <Login />;
};

export default AuthPage;
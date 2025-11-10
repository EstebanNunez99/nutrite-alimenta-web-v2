//verificado
// Ubicación: web/src/features/auth/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input';
import styles from './AuthForm.module.css';

// 1. Importamos los íconos que vamos a usar
import { FaEnvelope, FaLock } from 'react-icons/fa';

// --- CAMBIO ---
// Eliminamos la prop 'onSwitchToRegister'
const Login = () => {
// --- FIN CAMBIO ---
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(email, password);
            // Opcional: un toast de bienvenida
            toast.success('¡Bienvenido!');
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            toast.error(`Error: ${error.response ? error.response.data.msg : 'Credenciales inválidas'}`);
        }
    };

     return (
        <div className={styles.formContainer}>
            {/* --- CAMBIO --- */}
            <h2>Login de Administrador</h2>
            {/* --- FIN CAMBIO --- */}
            <form onSubmit={onSubmit} className={styles.form}>
                
                <Input
                    icon={<FaEnvelope />}
                    type="email"
                    placeholder="Correo Electrónico"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                />
                
                <Input
                    icon={<FaLock />}
                    type="password"
                    placeholder="Contraseña"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                />

                <Button variant='secondary' type="submit" >
                    Iniciar Sesión
                </Button>
            </form>
            
            {/* --- CAMBIO --- */}
            {/* Eliminamos el párrafo y botón de "Regístrate" */}
            {/* <p className={styles.switchText}> ... </p> */}
            {/* --- FIN CAMBIO --- */}
        </div>
    );
};

export default Login;
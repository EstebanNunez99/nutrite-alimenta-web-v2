//authController.js

// --- INICIO CAMBIO ---
// Importamos el modelo de usuario para poder usarlo en la base de datos
import Usuario from '../users/user.model.js';
// --- FIN CAMBIO ---

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar si el usuario existe
        // Esta línea ahora funcionará porque 'Usuario' está definido
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña ingresada con la hasheada en la BD
        const esCorrecta = await bcrypt.compare(password, usuario.password);
        if (!esCorrecta) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }
        
        if (usuario.rol !== 'admin') {
            return res.status(401).json({ msg: 'Acceso no autorizado.' });
        }

        // 3. Si todo es correcto, crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id,
                rol: usuario.rol
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        }, (error, token) => {
            if (error) throw error;
            res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};


// @desc    Obtener todos los usuarios (Admin)
// (Esta función ahora solo devolverá otros Admins)
export const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        // Esta línea también funcionará ahora
        const usuarios = await Usuario.find().select('-password'); 
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};
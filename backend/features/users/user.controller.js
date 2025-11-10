import User from './user.model.js';
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken'; // Ya no se necesita aquí porque no hacemos login/register

// --- FUNCIONES ELIMINADAS POR REDUNDANCIA O SEGURIDAD ---
// register (No queremos registro público)
// login (Ya está en auth.controller.js)
// getAllUsers (Ya está en auth.controller.js)
// -------------------------------------------------------

// @desc    Obtener el perfil del usuario (Admin) autenticado
// @route   GET /api/users/profile
// @access  Private (Admin)
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.usuario.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

// @desc    Actualizar el perfil del Admin (nombre, email, telefono, fotoURL)
// @route   PUT /api/users/profile
// @access  Private (Admin)
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.usuario.id);

        if (user) {
            user.nombre = req.body.nombre || user.nombre;
            user.email = req.body.email || user.email;
            // Opcionales:
            if (req.body.telefono !== undefined) user.telefono = req.body.telefono;
            if (req.body.fotoURL !== undefined) user.fotoURL = req.body.fotoURL;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                nombre: updatedUser.nombre,
                email: updatedUser.email,
                rol: updatedUser.rol,
                telefono: updatedUser.telefono || '',
                fotoURL: updatedUser.fotoURL || '',
            });
        } else {
            res.status(404).json({ msg: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Actualizar la contraseña del Admin
// @route   PUT /api/users/profile/password
// @access  Private (Admin)
export const updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Por favor, provea la contraseña actual y la nueva.' });
        }

        const user = await User.findById(req.usuario.id);

        if (user) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ msg: 'La contraseña actual es incorrecta.' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({ msg: 'Contraseña actualizada con éxito.' });
        } else {
            res.status(404).json({ msg: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};
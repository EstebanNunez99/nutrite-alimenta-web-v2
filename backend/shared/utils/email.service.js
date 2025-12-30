import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia notificación de nueva orden al administrador
 * RF-010
 */
export const sendOrderNotification = async (order) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY no configurada. No se enviará correo.');
        return;
    }

    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #2c3e50;">¡Nueva Venta Realizada!</h2>
                <p>Se ha registrado una nueva orden en el sistema.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <p><strong>Cliente:</strong> ${order.customerInfo.nombre}</p>
                    <p><strong>Email:</strong> ${order.customerInfo.email}</p>
                    <p><strong>Teléfono:</strong> ${order.customerInfo.telefono || 'No especificado'}</p>
                    <p><strong>Total:</strong> $${order.totalPrice}</p>
                    <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
                    <p><strong>Tipo de Envío:</strong> ${order.shippingType || 'Estándar'}</p>
                </div>

                <h3>Detalle del Pedido:</h3>
                <ul>
                    ${order.items.map(item => `
                        <li>
                            <strong>${item.cantidad}x</strong> ${item.nombre} 
                            ${item.tipo === 'bajo_demanda' ? '<span style="color: #e67e22; font-size: 0.8em;">(Bajo Demanda)</span>' : ''}
                        </li>
                    `).join('')}
                </ul>

                <p style="margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Ir al Panel de Administración
                    </a>
                </p>
            </div>
        `;

        // 1. Enviar al Admin
        const { data: dataAdmin, error: errorAdmin } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Dominio de prueba de Resend
            to: process.env.EMAIL_USER, // Usamos EMAIL_USER como destinatario (tu email)
            subject: `Nueva Orden #${order._id.toString().slice(-6)}`,
            html: htmlContent
        });

        if (errorAdmin) console.error('Error Resend Admin:', errorAdmin);
        else console.log('Email de notificación enviado al ADMIN:', dataAdmin);

        // 2. Enviar al Cliente (Solo posible si verificas dominio, o si el cliente es el mismo usuario registrado en resend para testing)
        // Por ahora, en modo testing gratuito, SOLO puedes enviar a tu propio email registrado.
        // Si intentas enviar al cliente real dará error 403.
        // ADVERTENCIA: Comentamos esto para evitar errores en logs hasta que verifiques dominio.
        /*
        if (order.customerInfo && order.customerInfo.email) {
            // ... logica cliente ...
            // Para producción real con dominio propio (ej: ventas@nutrite.com)
        }
        */
        console.warn('AVISO: En modo Test de Resend solo se envían correos a tu email registrado. El correo al cliente se omitirá hasta verificar dominio.');

    } catch (error) {
        console.error('Error al enviar email de notificación:', error);
    }
};

/**
 * Envia resumen de productos bajo demanda al administrador
 * RF-003
 */
export const sendDemandSummary = async (orders, deliveryDate) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY no configurada.');
        return;
    }

    try {
        const summary = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.nombre;
                if (!summary[key]) summary[key] = 0;
                summary[key] += item.cantidad;
            });
        });

        const listHtml = Object.entries(summary).map(([name, qty]) =>
            `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${qty}</strong></td></tr>`
        ).join('');

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.EMAIL_USER,
            subject: `Resumen de Producción - ${new Date(deliveryDate).toLocaleDateString('es-AR')}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #27ae60;">Resumen de Producción Bajo Demanda</h2>
                    <p>Fecha de entrega: <strong>${new Date(deliveryDate).toLocaleDateString('es-AR')}</strong></p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                         <tbody>${listHtml || 'Sin pedidos.'}</tbody>
                    </table>
                </div>
            `
        });

        if (error) throw error;
        console.log('Email de resumen enviado correctamente:', data);

    } catch (error) {
        console.error('Error enviando resumen de demanda:', error);
    }
};

import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Cliente OAuth2 para conectar con Gmail API
 */
const getGmailClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        console.warn('Faltan credenciales de Google OAuth2 en .env');
        return null;
    }

    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground' // Redirect URI
    );

    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return google.gmail({ version: 'v1', auth: oAuth2Client });
};

/**
 * Helper para codificar el mensaje en Base64 URL-safe
 */
const makeBody = (to, from, subject, message) => {
    const str = [
        `To: ${to}`,
        `From: ${from}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '', // Línea vacía obligatoria antes del cuerpo
        message
    ].join('\n');

    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Función genérica para enviar email usando Gmail API
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const gmail = getGmailClient();
        if (!gmail) return;

        const rawMessage = makeBody(to, process.env.EMAIL_USER, subject, html);

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage,
            },
        });

        return res.data;
    } catch (error) {
        console.error('Error enviando email vía Gmail API:', error.message);
        throw error; // Relanzar para manejarlo arriba si es necesario
    }
};

/**
 * Envia notificación de nueva orden al administrador
 * RF-010
 */
export const sendOrderNotification = async (order) => {
    if (!process.env.EMAIL_USER) {
        console.warn('EMAIL_USER no configurado. No se enviará correo.');
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

        // Enviar al Admin
        const resAdmin = await sendEmail({
            to: process.env.EMAIL_USER,
            subject: `Nueva Orden Recibida #${order._id.toString().slice(-6)} - Nutrirte Alimenta`,
            html: htmlContent
        });
        console.log('Email de notificación enviado al ADMIN. ID:', resAdmin.id);

        // Enviar al Cliente
        if (order.customerInfo && order.customerInfo.email) {
            const htmlClient = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #2c3e50;">¡Hola ${order.customerInfo.nombre}!</h2>
                    <p>Muchas gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0;">Resumen del Pedido #${order._id.toString().slice(-6)}</h3>
                        <ul>
                            ${order.items.map(item => `
                                <li>
                                    <strong>${item.cantidad}x</strong> ${item.nombre} 
                                    ${item.tipo === 'bajo_demanda' ? '<span style="color: #e67e22; font-size: 0.8em;">(Bajo Demanda)</span>' : ''}
                                </li>
                            `).join('')}
                        </ul>
                        <p><strong>Total:</strong> $${order.totalPrice}</p>
                         <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
                    </div>

                    ${order.paymentMethod === 'Transferencia' ? `
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba;">
                        <strong>Datos para Transferencia:</strong><br>
                        Alias: nutrite.alimenta<br>
                        CBU: 0000000000000000000000<br>
                        Banco: Banco Nación
                    </div>
                    ` : ''}

                    <p>Te avisaremos cuando tu pedido esté en camino.</p>
                    <p>Saludos,<br>El equipo de Nutrirte Alimenta</p>
                </div>
            `;

            const resClient = await sendEmail({
                to: order.customerInfo.email,
                subject: `¡Recibimos tu pedido! #${order._id.toString().slice(-6)} - Nutrirte Alimenta`,
                html: htmlClient
            });
            console.log('Email de confirmación enviado al CLIENTE. ID:', resClient.id);
        }
    } catch (error) {
        console.error('Error al enviar emails:', error.message);
        // No lanzamos error para no romper el flujo del pedido
    }
};

/**
 * Envia resumen de productos bajo demanda al administrador
 * RF-003
 */
export const sendDemandSummary = async (orders, deliveryDate) => {
    if (!process.env.EMAIL_USER) return;

    try {
        // Agrupar productos
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

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #27ae60;">Resumen de Producción Bajo Demanda</h2>
                <p>Cierre de pedidos para la fecha de entrega: <strong>${new Date(deliveryDate).toLocaleDateString('es-AR')}</strong></p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="text-align: left; padding: 10px;">Producto</th>
                            <th style="text-align: left; padding: 10px;">Cantidad Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listHtml || '<tr><td colspan="2">No hay pedidos registrados para esta fecha.</td></tr>'}
                    </tbody>
                </table>

                <p style="margin-top: 20px; color: #7f8c8d; font-size: 0.9em;">
                    Este reporte fue generado automáticamente por el sistema Nutrirte Alimenta.
                </p>
            </div>
        `;

        const res = await sendEmail({
            to: process.env.EMAIL_USER,
            subject: `Resumen de Producción - Entrega ${new Date(deliveryDate).toLocaleDateString('es-AR')}`,
            html: htmlContent
        });

        console.log('Email de resumen enviado correctamente. ID:', res.id);
    } catch (error) {
        console.error('Error enviando resumen de demanda:', error.message);
        throw error;
    }
};

RF-001: Servicio de pedidos ‘Bajo demanda’
Descripción: El sistema debe permitir a los clientes realizar pedidos en un límite de tiempo fijo establecido por el admin. 
El admin es quién establece la fecha y hora límite de pedido, debe poder cambiar manualmente. Los dias de entrega de los pedidos bajo demanda son los Miercoles y sabados, pero debe haber una opción que le permita cambiar de días de entrega.
Los pedidos se reciben hasta las 14:00 hs del día anterior
Para los miércoles: Recibe hasta el Martes 14:00 hs
Para los sábados: Recibe hasta el Viernes 14:00 hs

RF-002: Servicio de pedidos ‘Stock Inmediato’
Descripción: El sistema debe permitir a los clientes realizar pedidos el tiempo que la tienda esté abierta. 
El admin es quién establece la fecha y hora de cierre de la tienda. 
En caso de que no haya Stock disponible, también los productos de ‘Stock Inmediato’ se pueden encargar.

RF-003: Disponibilidad de producción de pedidos ‘Bajo demanda’
Descripción: El sistema debe permitir registrar todos los productos solicitados por los clientes sin límite de producción. 
Al finalizar la fecha y hora de pedidos, se envía una notificación al admin via email (falta implementar gmail) con un resumen de pedidos solicitados. (Ver la posibilidad de exportar a una planilla de GoogleSheets)

RF-004: Entrega de pedidos de productos ‘Bajo demanda’
Descripción: El sistema debe permitir al admin, cambiar de estado la venta de Bajo demanda cuando se realice la entrega. ‘En preparación → Entregado’ o similar.

RF-005: Entrega de pedidos de productos ‘Stock Inmediato’
Descripción: El sistema debe permitir al admin, cambiar de estado la venta de Stock Inmediato cuando se realice la entrega. ‘Listo para entregar’ → ‘Entregado’ o similar

RF-006: Entrega de pedidos de productos ‘Bajo demanda y Stock Inmediato’ en simultáneo
(Corresponde a un pedido en el que hay pedido de los dos tipos)
En este caso se debe poder registrar el estado de 
Dos entregas distintas si el cliente lo desea una correspondiente al Stock Inmediato ese mismo día y la otra entrega corresponde a la entrega del producto Bajo Demanda solicitado el día correspondiente. (Consultar excepciones con Num de Telefono). Posibles casos:
- Una sola entrega, en caso de que el cliente desee esperar al día de entrega del producto ‘Bajo Demanda’ → Corresponde a RF-004
- Dos entregas, una para el producto Stock Inmediato y otra entrega correspondiente al producto Bajo demanda, Si el pedido tiene dos tipos de productos, el sistema debe permitir elegir qué pedido se entregó y no debe permitir cerrar la venta al admin hasta que no se entregue el otro tipo de pedido. (En el frontend capaz mostrar un modal con una listita)

RF-007: Envío de pedidos 
El sistema debe permitir al cliente ingresar su dirección para luego el admin pueda realizar el envío con el servicio de Uber Motos. Avisar al cliente que los envíos se realizan con Uber Motos y no contamos con la cotización en tiempo real, por lo que no podemos asegurar un precio exacto de envío, el costo del envío está a cargo del cliente. No hay límite de distancia con Uber Motos.

RF-007: Retiro de pedidos 
Al momento de realizar un pedido el cliente debe poder, elegir la modalidad de entrega entre ‘Envio a domicilio’, ‘Retiro en Domicilio’ o ‘Retiro en gimnasio’  → Gestionar mediante numero de telefono. (Envío a domicilio considerado en RF-006)
Retiro en Domicilio: Se proporciona numero de telefono y canales de contacto. NO PUBLICAR DIRECCIÓN
Retiro en Gimnasio: Se proporciona numero de telefono y canales de contacto igual que la entrega en domicilio.

RF-008: Retiro de pedidos en Domicilio
El sistema debe mostrar al cliente los días y horarios disponibles para retiro en domicilio
En caso de que sea stock bajo demanda las entregas son los días Miércoles y Sábados.
En caso de que sea stock disponible las entregas se realizan todos los días
El horario es de (en cualquiera de los dos casos).
Mañana 8:00 a.m a 12:00 a.m. 
Tarde 17:00 hs a 22:00 hs 

RF-009: Tipo de Pago
El sistema debe permitir al cliente elegir entre dos tipos de pagos
Transferencia
Efectivo
En el caso de que sea Transferencia el sistema debe permitir seleccionar al admin a qué billetera se realizó la transferencia. (Esto teniendo en cuenta que la transferencia se hace coordinando con ella, o sea si un cliente selecciona transferencia se deben comunicar con ella a través de su numero de telefono para que ella le dé el alias o CBU de la cuenta a la que quiere recibir el pago)

RF-010: Notificaciones
El sistema debe enviar un correo electrónico al admin cada vez que se realiza un pedido.
El sistema debe enviar un correo electrónico al admin cuando se cierran los pedidos de ‘Bajo demanda’ y proporcionar una lista con los pedidos. 

RF-011: Carga de imágenes de los productos 
El sistema debe permitir cargar productos directamente desde la galeria del cliente

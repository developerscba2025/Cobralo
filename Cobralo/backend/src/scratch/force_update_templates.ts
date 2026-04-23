
import { prisma } from '../db';

async function forceUpdateTemplates() {
    console.log("Forcing update of all templates for all users (NO EMOJIS)...");
    
    const DEFAULT_REMINDER = "*RECORDATORIO DE PAGO*\n\n{saludo} {nombre_pila}, te escribo de *{negocio}* para recordarte tu pago de *{servicio}* correspondiente a {mes_actual}.\n\nMonto: *{moneda}{monto}*\n\nAvisame cualquier cosa. Gracias!";
    const DEFAULT_CLASS_REMINDER = "*RECORDATORIO DE CLASE*\n\n¡Hola {nombre_pila}! Te recuerdo que tenemos cita a las *{hora_inicio}*.\n\nPor favor, confirmame acá si venís: {url_confirmar}\n\nSi necesitás cancelar, usá este enlace: {url_cancelar}. ¡Nos vemos!";
    const DEFAULT_WELCOME = "*¡BIENVENIDO/A!*\n\n¡Hola {nombre_pila}! Te damos la bienvenida oficial a *{negocio}*. ¡Qué alegría que te sumes!\n\nEstamos muy felices de que empieces tus clases de *{servicio}*. Queremos asegurarnos de que tengas la mejor experiencia posible con nosotros.\n\nCualquier duda que tengas, podés escribirme por acá. ¡Nos vemos muy pronto!";
    const DEFAULT_GENERAL = "*AVISO IMPORTANTE*\n\n{saludo} {nombre_pila}, te escribimos de *{negocio}* para informarte lo siguiente:\n\n{mensaje}\n\nCualquier duda quedamos a tu entera disposición. ¡Saludos!";

    const users = await prisma.user.findMany();
    
    for (const user of users) {
        console.log(`Updating ${user.email}...`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                reminderTemplate: DEFAULT_REMINDER,
                classReminderTemplate: DEFAULT_CLASS_REMINDER,
                welcomeTemplate: DEFAULT_WELCOME,
                generalTemplate: DEFAULT_GENERAL
            }
        });
    }

    console.log("Force update finished.");
}

forceUpdateTemplates().catch(console.error).finally(() => prisma.$disconnect());

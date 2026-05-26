import admin from 'firebase-admin';
import { type INotificacionService } from '../domain/notificacion.repository.js';
import type { NotificacionPayload } from '../domain/notificacion.entity.js';



const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan variables de entorno esenciales de Firebase en el archivo .env");
}

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}

export class FirebaseNotificacionRepository implements INotificacionService {

    constructor() { }

    async enviarPush({ token, titulo, cuerpo }: NotificacionPayload): Promise<void> {
        const mensaje = {
            notification: {
                title: titulo,
                body: cuerpo,
            },
            token: token,
        };

        try {
            await admin.messaging().send(mensaje);
            console.log('--- Push enviado por Firebase con éxito ---');
        } catch (error) {
            console.error('Error en Firebase Infrastructure:', error);
            throw new Error('No se pudo enviar la notificación push');
        }
    }
}
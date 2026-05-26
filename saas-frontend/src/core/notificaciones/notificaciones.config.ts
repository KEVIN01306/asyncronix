import { initializeApp } from "firebase/app";
import { getMessaging, getToken as getFirebaseToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Obtiene el token FCM del usuario
 * Solicita permisos si es necesario
 * @returns Promesa con el token FCM o null
 */
export async function obtenerTokenFCM(): Promise<string | null> {
    try {
        console.log("Solicitando permisos de notificación...");
        
        const permiso = await Notification.requestPermission();
        
        if (permiso !== "granted") {
            console.log("El usuario rechazó las notificaciones.");
            return null;
        }

        if (!VAPID_KEY) {
            console.error("VITE_FIREBASE_VAPID_KEY no está definida en el .env");
            return null;
        }

        console.log("¡Permiso concedido!");

        const token = await getFirebaseToken(messaging, {
            vapidKey: VAPID_KEY
        });

        if (token) {
            console.log("Token FCM obtenido correctamente");
            return token;
        } else {
            console.log("No se pudo generar el token. Verifica si el Service Worker está en su lugar.");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener el token FCM:", error);
        return null;
    }
}

/**
 * Activa las notificaciones y retorna el token
 * Solo hace logging del token (sin guardar)
 */
export default function activarNotificaciones() {
    obtenerTokenFCM().then((token) => {
        if (token) {
            console.log("👇 TOKEN FCM DISPONIBLE 👇");
            console.log(token);
        }
    });
}
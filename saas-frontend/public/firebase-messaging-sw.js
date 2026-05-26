importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDg0VNAoKBBgK1LroOMoMwN1-okDAU3bzE",
    authDomain: "asyncronix-ed7c3.firebaseapp.com",
    projectId: "asyncronix-ed7c3",
    storageBucket: "asyncronix-ed7c3.firebasestorage.app",
    messagingSenderId: "166494488202",
    appId: "1:166494488202:web:75e03c409bd971328ecf73",
    measurementId: "G-NGRF7FNEQM"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Push en segundo plano recibido:', payload);

    const tituloNotificacion = payload.notification.title;
    const opcionesNotificacion = {
        body: payload.notification.body,
        icon: 'icons/asyncronix_corto.png'
    };

    self.registration.showNotification(tituloNotificacion, opcionesNotificacion);
});
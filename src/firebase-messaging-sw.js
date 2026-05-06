importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Aquí necesitamos inicializar Firebase con la misma config de environment.ts
// Como el Service Worker no tiene acceso a environment.ts directamente, hay que ponerla hardcoded o inyectarla.
// Lo más seguro y fácil en PWAs con Firebase es ponerla aquí.

firebase.initializeApp({
  apiKey: "AIzaSyCHuX8wSkYrDvkMLNxV9w1u6472EBDBpXc",
  authDomain: "ecoair-app.firebaseapp.com",
  projectId: "ecoair-app",
  storageBucket: "ecoair-app.firebasestorage.app",
  messagingSenderId: "1073768602826",
  appId: "1:1073768602826:web:a0ea2911767f93cd1ba833"
});

const messaging = firebase.messaging();

// Este evento captura los mensajes push cuando la web está en SEGUNDO PLANO (cerrada o minimizada)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);
  
  // Extraemos el título y el cuerpo que manda nuestro backend (en NotificationService)
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-72x72.png', // O el icono que prefieras
    badge: '/assets/icons/icon-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

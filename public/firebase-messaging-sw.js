// Service Worker do Firebase Cloud Messaging
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDvwhqpy7heH1emn2ncCFCQO3pw5XZmpCY",
  authDomain: "rn-gestor.firebaseapp.com",
  projectId: "rn-gestor",
  storageBucket: "rn-gestor.firebasestorage.app",
  messagingSenderId: "822111494373",
  appId: "1:822111494373:web:7f45a0e19fc170780f740c",
  measurementId: "G-YGSG4JM1XN"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obter instância do Messaging
const messaging = firebase.messaging();

// Listener para mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Mensagem recebida em background:", payload);

  const notificationTitle = payload.notification?.title || "Nova notificação";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

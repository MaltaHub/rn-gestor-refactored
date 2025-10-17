// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvwhqpy7heH1emn2ncCFCQO3pw5XZmpCY",
  authDomain: "rn-gestor.firebaseapp.com",
  projectId: "rn-gestor",
  storageBucket: "rn-gestor.firebasestorage.app",
  messagingSenderId: "822111494373",
  appId: "1:822111494373:web:7f45a0e19fc170780f740c",
  measurementId: "G-YGSG4JM1XN"
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);

// Initialize Messaging (só funciona no cliente)
export let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(appFirebase);
}

// Função para pedir permissão e obter token
export async function solicitarPermissaoNotificacao() {
  // Verificar se está no navegador
  if (typeof window === "undefined" || !messaging) {
    console.warn("Firebase Messaging não disponível");
    return null;
  }

  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    alert("Notificações bloqueadas!");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) {
    console.error("VAPID Key não encontrada! Verifique o .env.local");
    return null;
  }

  console.warn("VAPID Key:", vapidKey.substring(0, 20) + "...");

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });

  console.warn("Token FCM:", token);
  return token;
}

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBVPDZjcSqp1u89KcO6KUQG4R_upFOQCqU",
  authDomain: "doutly-1c54c.firebaseapp.com",
  projectId: "doutly-1c54c",
  storageBucket: "doutly-1c54c.firebasestorage.app",
  messagingSenderId: "127862661423",
  appId: "1:127862661423:web:19c242ce91da39888e41da",
  measurementId: "G-XRWYF9YX2M"
};

const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);

// Connection state management
let isOnline = navigator.onLine;
let connectionRetryCount = 0;
const maxRetries = 3;

// Monitor connection status
window.addEventListener('online', () => {
  isOnline = true;
  connectionRetryCount = 0;
  enableNetwork(db).catch(console.error);
});

window.addEventListener('offline', () => {
  isOnline = false;
  disableNetwork(db).catch(console.error);
});

// Connection retry logic
export const retryConnection = async (): Promise<boolean> => {
  if (!isOnline || connectionRetryCount >= maxRetries) {
    return false;
  }

  try {
    connectionRetryCount++;
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn(`Connection retry ${connectionRetryCount} failed:`, error);
    return false;
  }
};

// Export connection utilities
export const isFirebaseOnline = () => isOnline;
const getConnectionRetryCount = () => connectionRetryCount;


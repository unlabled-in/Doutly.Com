import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyByjeW4BVRgsbYma3lAlun5RpcRpZ-tp3Y",
  authDomain: "doutly-71190.firebaseapp.com",
  projectId: "doutly-71190",
  storageBucket: "doutly-71190.firebasestorage.app",
  messagingSenderId: "710419702210",
  appId: "1:710419702210:web:54a626d4cc8507169b365b",
  measurementId: "G-Q0DW01YP61"
};

const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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
export const getConnectionRetryCount = () => connectionRetryCount;

export default app;
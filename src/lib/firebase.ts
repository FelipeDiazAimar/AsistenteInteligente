
// IMPORTANT: Replace with your actual Firebase project configuration!
// Go to your Firebase project console -> Project settings -> General -> Your apps -> Web app SDK setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace
  authDomain: "YOUR_AUTH_DOMAIN", // Replace
  projectId: "YOUR_PROJECT_ID", // Replace
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace
  appId: "YOUR_APP_ID", // Replace
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// Firestore and Storage imports are removed as resource management is being externalized.
// If you use Firebase Authentication or other Firebase services, you might re-add specific imports.

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// const db = getFirestore(app); // Keep if you plan to use Firestore for other features
// const storage = getStorage(app); // Keep if you plan to use Firebase Storage for other features

// Resource specific functions (addResource, getResources, deleteResource, uploadFileToStorage, deleteFileFromStorage)
// have been removed. You will implement these functionalities with your PostgreSQL backend.

export { app };
// Export db and storage if you initialize and use them for other Firebase services.
// export { db, storage, app };


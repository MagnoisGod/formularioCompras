// Importa las funciones de Firebase que vas a usar
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase (esto lo obtuviste de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAeE2mXj84HtNIuQdQtIgUjJI3iBNtMMuM",
  authDomain: "tiendabd-d8109.firebaseapp.com",
  projectId: "tiendabd-d8109",
  storageBucket: "tiendabd-d8109.firebasestorage.app",
  messagingSenderId: "50294328461",
  appId: "1:50294328461:web:c6c3f20ab80281967026c4",
  measurementId: "TU_MEASUREMENT_ID"
};

// Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Inicializa Firestore para interactuar con la base de datos
const db = getFirestore(app);

export { db };



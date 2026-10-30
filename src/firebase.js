// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Reemplaza estas con tus claves reales que te dio Firebase
const firebaseConfig = {
apiKey: "AIzaSyBbB5wk1x3aclg0zyRtjFT5kAfyYGwX9jA",
  authDomain: "sahumerios-ab4b5.firebaseapp.com",
  projectId: "sahumerios-ab4b5",
  storageBucket: "sahumerios-ab4b5.firebasestorage.app",
  messagingSenderId: "392280619756",
  appId: "1:392280619756:web:3115c771a5ee2bb48e83c9",
  measurementId: "G-52Z2QFK59N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
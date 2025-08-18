import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDX27Ukkm7SxsYRea7EOQYgJk3BNkcPwW8",
  authDomain: "e-service-portal-195f5.firebaseapp.com",
  projectId: "e-service-portal-195f5",
  storageBucket: "e-service-portal-195f5.firebasestorage.app",
  messagingSenderId: "777420356464",
  appId: "1:777420356464:web:465c80529bc6fe817eadb5",
  measurementId: "G-RS2HV07G68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);

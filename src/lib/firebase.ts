import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBRnY-ZDpWlKKxIBvHSnEuWVCSW59SwWXY",
  authDomain: "cisemtomer.firebaseapp.com",
  projectId: "cisemtomer",
  storageBucket: "cisemtomer.firebasestorage.app",
  messagingSenderId: "254903972586",
  appId: "1:254903972586:web:6a86e778543d6405a29d93"
};

// Initialize Firebase (prevent reinitializing in dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

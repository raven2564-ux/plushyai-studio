import { initializeApp } from "@firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "@firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, query, orderBy, getDocs, updateDoc, increment, deleteDoc } from "@firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes, deleteObject } from "@firebase/storage";

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseAuthDomain = isLocalHost
  ? `${firebaseProjectId}.firebaseapp.com`
  : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db, googleProvider, storage;

if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (e) {
    console.error("Eroare la initializare Firebase:", e);
  }
} else {
  console.warn("Firebase nu este configurat in .env.local. Functionalitatile de login sunt dezactivate temporar.");
}

export { 
  app, auth, db, storage, googleProvider, 
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, onSnapshot,
  collection, addDoc, query, orderBy, getDocs,
  updateDoc, increment, deleteDoc,
  ref, uploadString, getDownloadURL, uploadBytes, deleteObject
};

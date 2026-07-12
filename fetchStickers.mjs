import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwj5Z0OEG4eqJwAml_g0ZX2M_R8GgK6dI",
  authDomain: "plushyai-720cd.firebaseapp.com",
  projectId: "plushyai-720cd",
  storageBucket: "plushyai-720cd.firebasestorage.app",
  messagingSenderId: "996103205007",
  appId: "1:996103205007:web:62223036c1b70f116740fa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const q = query(
      collectionGroup(db, 'creations'),
      where('mode', '==', 'sticker'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      console.log(doc.data().url);
    });
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();

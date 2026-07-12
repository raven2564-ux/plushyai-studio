import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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
    const snapshot = await getDocs(collection(db, 'users'));
    let count = 0;
    for (const d of snapshot.docs) {
      const data = d.data();
      if ((data.credits || 0) < 60) {
        await updateDoc(doc(db, 'users', d.id), { credits: 60 });
        count++;
      }
    }
    console.log(`Updated ${count} users to 60 credits.`);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();

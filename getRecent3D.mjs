import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('src/firebase-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const q = query(
      collectionGroup(db, 'creations'),
      where('mode', '==', '3d'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(snapshot.docs[0].data().url);
    } else {
      console.log('No 3d creations found');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();

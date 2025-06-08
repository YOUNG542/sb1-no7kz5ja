// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDYsfLDmWTbt68PAIzpAeZ6ij7rwP_RWHk',
  authDomain: 'honggaeting1.firebaseapp.com',
  projectId: 'honggaeting1',
  storageBucket: 'honggaeting1.firebasestorage.app',
  messagingSenderId: '1033603372828',
  appId: '1:1033603372828:web:811b48c9b064ab54b24cd9',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAcnOmLs2rP6iMiuxpNNZ7eMMRRLARJ8MY",
  authDomain: "mundial01.firebaseapp.com",
  projectId: "mundial01",
  storageBucket: "mundial01.firebasestorage.app",
  messagingSenderId: "487537338758",
  appId: "1:487537338758:web:0d68b8eb07c3797fdbe407",
  measurementId: "G-67XJDYVCK6"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

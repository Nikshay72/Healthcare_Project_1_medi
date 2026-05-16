// frontend/src/utils/firebase.js
// Full Firebase integration — keys loaded from frontend/.env

import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Init only once
const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db   = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
export const FIREBASE_ENABLED = true

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

// ── FIRESTORE ─────────────────────────────────────────────────────────────────

export async function logEmergency(data) {
  try {
    const ref = await addDoc(collection(db, 'emergencies'), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return ref.id
  } catch (e) {
    console.warn('[Firebase] logEmergency:', e.message)
    return null
  }
}

export function listenEmergencies(callback) {
  try {
    const q = query(
      collection(db, 'emergencies'),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    return onSnapshot(q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err)  => console.warn('[Firebase] listenEmergencies:', err.message)
    )
  } catch (e) {
    console.warn('[Firebase] listenEmergencies setup:', e.message)
    return () => {}
  }
}

export async function logAlert(data) {
  try {
    await addDoc(collection(db, 'alerts'), {
      ...data,
      sentAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('[Firebase] logAlert:', e.message)
  }
}

export function listenAmbulances(callback) {
  try {
    return onSnapshot(
      collection(db, 'ambulances'),
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err)  => console.warn('[Firebase] listenAmbulances:', err.message)
    )
  } catch (e) {
    return () => {}
  }
}

export default app


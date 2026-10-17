import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

// Web app's Firebase configuration provided for Dream Bazaar
export const firebaseConfig = {
  apiKey: 'AIzaSyC9ZwkGXKNDBGO7KHyej78FQrMbUWzYBBM',
  authDomain: 'motu-seth.firebaseapp.com',
  projectId: 'motu-seth',
  storageBucket: 'motu-seth.firebasestorage.app',
  messagingSenderId: '772286662233',
  appId: '1:772286662233:web:733f2ede2afa09708fd348',
  measurementId: 'G-BCWV12VLED',
}

let app: FirebaseApp | null = null
let analytics: Analytics | null = null

export function getClientFirebaseApp(): FirebaseApp {
  if (!app) {
    const existing = getApps()
    app = existing.length > 0 ? existing[0] : initializeApp(firebaseConfig)
  }
  return app
}

export async function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null
  if (!analytics) {
    const supported = await isSupported().catch(() => false)
    if (supported) {
      analytics = getAnalytics(getClientFirebaseApp())
    }
  }
  return analytics
}

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'

let app: App | null = null
let db: Firestore | null = null

// Embedded production service account fallback for Vercel deployment
const DEFAULT_SERVICE_ACCOUNT = {
  type: 'service_account',
  project_id: 'motu-seth',
  private_key_id: 'e9e88ffc10692ea77cdea61b8e62548d62da97c7',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLOsmBxgX5xTyZ\na8lliTdkTLaJOU3KnweVUifHUoSLe5+b5cN8NrEfO694SbZk0WYz8QZOHnUSgRNJ\n2uAmGRj+BjMRHePkYk61odWQVG3Kq9DUIRIcEInYkeuaJCq5/pAmySqUn6EyhfBy\nslBRJ4L5sxdbi7bd/E4SIi6P6IfbbVFNPVeA60fmRSr24CFwDQh9lFbK2AINTsoz\nwJsa4pyWxZBawysCa4fcaxxAKG9fRIUffTrx195A28uwx2KepxAabXOUofCtr0oj\nRvXFXRnvNGYxmHVvDrv3c7sR1IhtlKwF4RHbnKJvCMtLvKQUo8olE+k40zAMeL9M\nKamJa/RBAgMBAAECggEAA2Bf06+iDshySCGXJYA2SDd8EDiVrHL1nHX9IjMimkdS\nBgmMX2ZwjT0fyQb/KEVQW4w6whaAdG+/jcpnT0q7HxFO948AZ8gjAvfZhVMvGx8S\np6DrB5tWEZ/kWFnBz02a6yy2xTmyYxVVmC+Sj7PxLvaE7KjxagEUnPmDaNxV/Cpu\nXbKorZ3B53EI+P+o4k34VxcrPKBGGvdfgCWX3tXt0mYIiydVp+CxLUXarMNopEgU\nHEIvqExG4GzUoyWdC3IU/Pms7N8Wz6mOULVuSsBff8Z/S1MpzRcoJgIIo+MZ7+BD\nIoATCDS+JK7MvRtibjRkcoHq3lOlYMP1XPtZqiK66QKBgQDw4Jx5LTZdPv9sk7fy\nJ0caNVatkSLBBfwpRmnXCJ+U33051wPPsSQxNjOCY9tahhgP9CXeALWeR0psG017\nDorisalRxw1lxuexGn9b40MUL84SLhJMP1oNtWsdOjyOjWzEIJAlMYoh6o/uuX/6\noYFea6/9ud59ruskQ8vO1LRIXQKBgQDX/Rmg78xiUaB6jIuMR7/ctnfQYYSmCDCf\njQmk+YEkPpXmZk76Un1w6XPXeNQFIRsftFfQWPO8EU4Jp62BloG5F7sagOP3215j\nt//VFs6H90eDCgnzrWxdu1lN4f/cBX3+hcV+hp99Ah1hqu8k0xA9+pZ/o4M+ydyS\n217WtllNNQKBgQCxRSwCxfJXZ3CFEKV0MdHTCOQUclZ4ZZYxLh/gX/lJj7xSH9ov\nNHelO/VmhWS+VydIPm7L1gvTQzYTH3jDEm3F7eflRi+m8l466XxHPJZ2OcRXfs56\njLkSk6wT43MDmjMsl6ZdqPq2gTCSCLSV19wkh+4KNYr3Rg7JLpfETKetBQKBgCya\nihZgLxcGwFtOdusLTiXoUKnp2ZjoDBKG77zwAalYe2BPNHQhYOJWc6PFwhMlGRLd\nDV1rYTovYKxBwmUGjdeJfQwmHe3rkXyKXPzGbvRJLq1y/0chQ0XAENsylsH7KF/N\nhFFyv7DzJNoskKJMLAiAnV/ShqIK0dBKGTXCBoMZAoGBAK74Ykwp1tRkSxGqQmcs\n7Bx9ypfr2PYBDLE4NtUdnrPJvGph6CX4b7HcClWtE6Kd3yAJkbFjpr1HBwWZerEJ\nEVr7BA0MYyV0WLGKs1koHK1q9f3y6xC8IvV5v0CXjj9Ka1LWVKemxbS4nkWJx7/R\ngZ8EibfCFeOqse+9WowUb2lo\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@motu-seth.iam.gserviceaccount.com',
  client_id: '113242961324118038132',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40motu-seth.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
}

function getServiceAccount(): any {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    } catch {
      // ignore
    }
  }

  const localFile = path.resolve(process.cwd(), 'firebase-service-account.json')
  if (fs.existsSync(localFile)) {
    try {
      return JSON.parse(fs.readFileSync(localFile, 'utf8'))
    } catch {
      // ignore
    }
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  // Fallback to embedded service account so serverless functions never crash
  return DEFAULT_SERVICE_ACCOUNT
}

export function getFirebaseApp(): App {
  if (!app) {
    const existing = getApps()
    if (existing.length > 0) {
      app = existing[0]
    } else {
      const sa = getServiceAccount()
      app = initializeApp({
        credential: cert(sa),
        projectId: sa.project_id || sa.projectId || 'star-e7eb0',
      })
    }
  }
  return app
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
    try {
      db.settings({ ignoreUndefinedProperties: true })
    } catch {
      // settings already applied
    }
  }
  return db
}

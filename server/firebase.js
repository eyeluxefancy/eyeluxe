import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

try {
    console.log("Initializing Firebase...");
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
            console.log("Using Service Account from:", serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath)
            });
        } else if (process.env.FIREBASE_PRIVATE_KEY) {
            console.log("Using Private Key from Environment Variables");
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
        } else if (process.env.FIREBASE_PROJECT_ID) {
            console.log("Using Project ID only (Attempting Application Default Credentials)");
            // Attempt local discovery or application default credentials
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        } else {
            throw new Error("No Firebase configuration found.");
        }
    } else {
        console.log("Firebase already initialized (apps exists)");
    }

    db = admin.firestore();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error.message);
    console.log("Falling back to Mock DB context.");
    db = {
        collection: (name) => ({
            get: async () => ({ docs: [] }),
            add: async (data) => ({ id: 'mock-id' }),
            doc: (id) => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                update: async () => { },
                delete: async () => { },
                set: async () => { },
            }),
            orderBy: function () { return this; },
            count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }),
        }),
        runTransaction: async (fn) => {
            console.log("Mock Transaction running");
            return fn({
                get: async (ref) => ({ exists: true, data: () => ({ stock: 100 }) }),
                update: () => { },
                set: () => { },
            });
        }
    };
}

export { db };

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
        let serviceAccountPath;

        // Check for Render.com secret files first
        if (process.env.RENDER) {
            serviceAccountPath = '/etc/secrets/serviceAccountKey.json';
            console.log("Render detected - Using Secret File from:", serviceAccountPath);
        } else {
            // Local development
            serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
            console.log("Local development - Using Service Account from:", serviceAccountPath);
        }

        // Try to initialize with file
        try {
            const fs = await import('fs');
            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("Firebase initialized with service account file");
            } else {
                throw new Error(`Service account file not found at: ${serviceAccountPath}`);
            }
        } catch (fileError) {
            console.error("Failed to read service account file:", fileError.message);

            // Fallback to environment variables
            if (process.env.FIREBASE_PRIVATE_KEY) {
                console.log("Falling back to environment variables");
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    })
                });
                console.log("Firebase initialized with environment variables");
            } else {
                throw new Error("No valid Firebase configuration found");
            }
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

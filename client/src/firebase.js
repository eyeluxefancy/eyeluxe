import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAScCJbxEZL8wYBbs-0UL0f0VPEofMLQxA",
    authDomain: "eyeluxe-338d3.firebaseapp.com",
    projectId: "eyeluxe-338d3",
    storageBucket: "eyeluxe-338d3.firebasestorage.app",
    messagingSenderId: "1015716300735",
    appId: "1:1015716300735:web:340c06b42f87f80ba2030a",
    measurementId: "G-LYF01DXVXF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

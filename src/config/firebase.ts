import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD11zIdNRihY6F8GqybHIaDgAoHzF-QDp4",
    authDomain: "blaze-trivia.firebaseapp.com",
    databaseURL: "https://blaze-trivia-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "blaze-trivia",
    storageBucket: "blaze-trivia.firebasestorage.app",
    messagingSenderId: "1081548773254",
    appId: "1:1081548773254:web:2cd3ba43b5b32a328fbe07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

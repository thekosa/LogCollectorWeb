// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAguLc0V0WkVyxmPqMWNI8a_G9MAgT6B9w",
    projectId: "logcollector-d2acc",
    storageBucket: "logcollector-d2acc.firebasestorage.app",
    appId: "1:170108012560:android:52b2d07fc568622f8b6295",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksport instancji Firestore
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCuCPN0PatnAmi76-AIW1cu35vJaczxjQU",
    authDomain: "logcollector-d2acc.firebaseapp.com",
    projectId: "logcollector-d2acc",
    storageBucket: "logcollector-d2acc.firebasestorage.app",
    messagingSenderId: "170108012560",
    appId: "1:170108012560:web:83c5556e296e4f3b8b6295"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
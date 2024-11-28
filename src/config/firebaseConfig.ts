import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database'; 

const firebaseConfig = {
    apiKey: "AIzaSyBBTm-ot0MevHehpnRWCCCTVO6g0UtE3vE",
    authDomain: "bento-prod-app.firebaseapp.com",
    databaseURL: "https://bento-prod-app-default-rtdb.firebaseio.com",
    projectId: "bento-prod-app",
    storageBucket: "bento-prod-app.firebasestorage.app",
    messagingSenderId: "759566473477",
    appId: "1:759566473477:web:c6d2a8931ff5e7fb61bf6c",
    measurementId: "G-E6ZRRTHSMN"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); 

export { database, ref, push };

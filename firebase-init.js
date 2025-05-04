import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo, push, onChildAdded, onValue, limitToLast, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAmacVhYc0VAAKeW0faGfQBVxSlBpVFvdY",
    authDomain: "spotly-cfb28.firebaseapp.com",
    projectId: "spotly-cfb28",
    storageBucket: "spotly-cfb28.firebasestorage.app",
    messagingSenderId: "130072441124",
    appId: "1:130072441124:web:8fdf89ec4549292e4443b1"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database, ref, set, get, createUserWithEmailAndPassword, query, orderByChild, equalTo, signInWithEmailAndPassword, push, onChildAdded, onValue, signOut, limitToLast, remove };

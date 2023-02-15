// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2_ij6-q6IOdDT5LAOC3aQkxiKk1kE-us",
  authDomain: "kskfyp.firebaseapp.com",
  projectId: "kskfyp",
  storageBucket: "kskfyp.appspot.com",
  messagingSenderId: "187099826935",
  appId: "1:187099826935:web:097bc05fb53d5faf4fe1f2",
  measurementId: "G-4HK7J0NPK7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export { auth, db };

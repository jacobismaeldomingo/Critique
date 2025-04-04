// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAc8jjpEzHO-ae4JJVw2GqmrG58yDapKZA",
  authDomain: "filmdiaryapp.firebaseapp.com",
  projectId: "filmdiaryapp",
  storageBucket: "filmdiaryapp.firebasestorage.app",
  messagingSenderId: "542453473907",
  appId: "1:542453473907:web:4215651267ef3501190006",
};

export const MAPS_API_KEY = "AIzaSyASxi5UgDU5ZaiB-Tgv6oRfKUrhaRWSGKE";

const firebase_app = initializeApp(firebaseConfig);
const firebase_auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

export { firebase_auth, db };

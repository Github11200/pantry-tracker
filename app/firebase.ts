// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzQdiAyeoD5adKDDxSHEMdLvCRkwCz_0Q",
  authDomain: "pantry-tracker-14451.firebaseapp.com",
  projectId: "pantry-tracker-14451",
  storageBucket: "pantry-tracker-14451.appspot.com",
  messagingSenderId: "508603042140",
  appId: "1:508603042140:web:48f9f997a37421761ad999",
  measurementId: "G-ENE8B94YPZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };

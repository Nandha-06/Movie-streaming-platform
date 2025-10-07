import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD-pmX8or5bedm_7p0-1dlIi0fOQ4j_Qv8",
  authDomain: "binge-monkey.firebaseapp.com",
  projectId: "binge-monkey",
  storageBucket: "binge-monkey.firebasestorage.app",
  messagingSenderId: "1046401911615",
  appId: "1:1046401911615:web:2d29de118b15941dcca18a",
  measurementId: "G-JE2XFDJNDK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

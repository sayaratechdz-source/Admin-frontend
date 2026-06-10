import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

// تسجيل
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// تسجيل دخول
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./auth";
import { createUserRole } from "./user";

// register
export const register = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await createUserRole(res.user.uid, "user");

  return res;
};

// login
export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
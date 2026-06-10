import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firestore";

// إنشاء user مع role
export const createUserRole = async (uid, role = "user") => {
  await setDoc(doc(db, "users", uid), {
    role
  });
};

// جلب role
export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : "user";
};
import {
  collection, doc, getDocs, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";

const COL = "users";

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = async (uid, vendeurStatus) => {
  await updateDoc(doc(db, COL, uid), {
    vendeurStatus,
    role: vendeurStatus === "approved" ? "vendeur" : "acheteur",
    updatedAt: serverTimestamp(),
  });
};

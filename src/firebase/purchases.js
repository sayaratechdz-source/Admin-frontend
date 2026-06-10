import {
  collection, doc, getDocs, updateDoc,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";

const COL = "purchases";

export const getAllPurchases = async () => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updatePurchaseStatus = async (id, status) => {
  await updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() });
};

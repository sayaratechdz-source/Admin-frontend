import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./firestore";
import { storage } from "./storage";

const COL = "products";

export const getProducts = async () => {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data, imageFile = null) => {
  let imageUrl = null;
  if (imageFile) {
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }
  const sku = data.productTitle.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    sku,
    imageUrl,
    productRating: 0,
    status: "available",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (id, data, imageFile = null) => {
  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }
  await updateDoc(doc(db, COL, id), { ...data, imageUrl, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COL, id));
};

/**
 * سكريبت لإنشاء حساب Admin في Firebase
 * شغّله مرة واحدة فقط من المتصفح أو Node.js
 *
 * الخطوات:
 * 1. سجّل دخول بالإيميل والباسورد عبر Firebase Console أو Auth
 * 2. ثم شغّل هذه الدالة لإضافة role: "admin" في Firestore
 */

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "./firestore";
import { auth } from "./auth";

export const createAdminUser = async (email, password, username = "Admin") => {
  try {
    // إنشاء الحساب في Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;

    // إضافة role: admin في Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      username,
      role: "admin",
      vendeurStatus: "none",
      createdAt: serverTimestamp(),
    });

    console.log("✅ Admin créé avec succès:", uid);
    return uid;
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    throw err;
  }
};

// لاستخدامه مؤقتاً في المتصفح:
// import { createAdminUser } from "./firebase/createAdmin";
// createAdminUser("admin@sayaratech.dz", "Admin1234!");

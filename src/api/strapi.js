import axios from "axios";

const STRAPI_URL =
  process.env.REACT_APP_STRAPI_URL ||
  "https://backend-stdz-production.up.railway.app";

const api = axios.create({ baseURL: STRAPI_URL });

// أضف JWT تلقائياً لكل طلب
api.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("adminJwt");
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  const { data } = await api.get("/api/products?pagination[limit]=1000&sort=createdAt:desc");
  return data.data.map((item) => ({ id: item.id, ...item.attributes }));
};

export const addProduct = async (formData) => {
  const { data } = await api.post("/api/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/api/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/api/products/${id}`);
};

// ─── Orders / Purchases ──────────────────────────────────────────────────────

export const getAllPurchases = async () => {
  const { data } = await api.get(
    "/api/orders?pagination[limit]=1000&sort=createdAt:desc&populate=*"
  );
  return data.data.map((item) => ({ id: item.id, ...item.attributes }));
};

export const updatePurchaseStatus = async (id, status) => {
  await api.put(`/api/orders/${id}`, { data: { status } });
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const { data } = await api.get("/api/users?populate=role");
  return data.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    vendeurStatus: u.vendeurStatus || "none",
    createdAt: u.createdAt,
    role: u.role,
  }));
};

export const updateUserRole = async (userId, vendeurStatus) => {
  await api.put(`/api/users/${userId}`, { vendeurStatus });
};

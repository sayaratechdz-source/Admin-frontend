// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, CircularProgress, Alert, Chip, Avatar, Stack, TextField,
  InputAdornment, IconButton, Tooltip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../api/strapi";

const MARQUES = ["PEUGEOT","RENAULT","VOLKSWAGEN","SEAT","SKODA","MERCEDES","AUDI","KIA","HYUNDAI","CHEVROLET","FIAT","CHERY","GEELY"];
const EMPTY_FORM = { productTitle: "", productPrice: "", stock: "", category: "PEUGEOT", discount: "", productDescription: "", image: null };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [dialog, setDialog]     = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [snack, setSnack]       = useState({ open: false, msg: "", sev: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then(data => setProducts(data))
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setDialog(true); };
  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      productTitle: p.productTitle || "",
      productPrice: p.productPrice || "",
      stock: p.stock || "",
      category: p.category || "PEUGEOT",
      discount: p.discount || "",
      productDescription: p.productDescription || "",
      imageUrl: p.imageUrl || null,
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.productTitle || !form.productPrice) {
      setSnack({ open: true, msg: "Titre et prix obligatoires", sev: "error" }); return;
    }
    setSaving(true);
    try {
      // بناء FormData لـ Strapi (multipart/form-data)
      const fd = new FormData();
      fd.append("data", JSON.stringify({
        productTitle: form.productTitle,
        productPrice: Number(form.productPrice),
        stock: Number(form.stock) || 0,
        category: form.category || "PEUGEOT",
        discount: Math.abs(Number(form.discount) || 0),
        productDescription: form.productDescription || ".",
        productRating: 0,
      }));
      if (form.image) fd.append("files.image", form.image);

      if (editId) {
        await updateProduct(editId, fd);
      } else {
        await addProduct(fd);
      }
      setSnack({ open: true, msg: editId ? "Produit modifié ✓" : "Produit ajouté ✓", sev: "success" });
      setDialog(false);
      fetchProducts();
    } catch {
      setSnack({ open: true, msg: "Erreur lors de la sauvegarde", sev: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSnack({ open: true, msg: "Produit supprimé", sev: "info" });
    } catch { setSnack({ open: true, msg: "Erreur suppression", sev: "error" }); }
    setDeleteConfirm(null);
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#E63946" }} /></Box>;
  if (error)   return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  const filtered = products.filter(p =>
    p.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = products.filter(p => (p.stock || 0) <= 5);

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#fff">Produits</Typography>
          <Typography fontSize={13} color="rgba(255,255,255,0.4)">{products.length} produits au total</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {lowStock.length > 0 && (
            <Chip icon={<WarningAmberIcon sx={{ fontSize: 16 }} />} label={`${lowStock.length} stock faible`}
              sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", fontWeight: 700 }} />
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ bgcolor: "#E63946", borderRadius: 2.5, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#c1121f" } }}>
            Ajouter un produit
          </Button>
        </Stack>
      </Stack>

      <TextField placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} size="small"
        sx={{ mb: 3, width: 300, "& .MuiOutlinedInput-root": { bgcolor: "#1a1a1a", borderRadius: 2, color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#E63946" } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }} /></InputAdornment> }} />

      <Paper sx={{ bgcolor: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              {["Produit", "Catégorie", "Prix", "Remise", "Stock", "Statut", "Actions"].map(h => (
                <TableCell key={h} sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 5, color: "rgba(255,255,255,0.2)", borderBottom: "none" }}>Aucun produit</TableCell></TableRow>
            )}
            {filtered.map(p => {
              const discount   = p.discount || 0;
              const finalPrice = discount > 0 ? p.productPrice - (p.productPrice * discount) / 100 : p.productPrice;
              const stock      = p.stock || 0;
              const isLow      = stock <= 5;
              return (
                <TableRow key={p.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" }, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar src={p.imageUrl || undefined} variant="rounded" sx={{ width: 40, height: 40, bgcolor: "#222" }}>
                        <InventoryIcon sx={{ fontSize: 18, color: "#555" }} />
                      </Avatar>
                      <Typography fontSize={13} fontWeight={600} color="#fff">{p.productTitle}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Chip label={p.category || "—"} size="small" sx={{ bgcolor: "rgba(230,57,70,0.1)", color: "#E63946", fontWeight: 700, fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Stack>
                      <Typography fontSize={13} fontWeight={700} color="#fff">{finalPrice?.toFixed(0)} DA</Typography>
                      {discount > 0 && <Typography fontSize={11} color="rgba(255,255,255,0.3)" sx={{ textDecoration: "line-through" }}>{p.productPrice} DA</Typography>}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {discount > 0
                      ? <Chip label={`-${discount}%`} size="small" sx={{ bgcolor: "rgba(230,57,70,0.15)", color: "#E63946", fontWeight: 800, fontSize: 11 }} />
                      : <Typography fontSize={12} color="rgba(255,255,255,0.3)">—</Typography>}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={13} fontWeight={700} color={isLow ? "#f59e0b" : "#fff"}>{stock} {isLow && "⚠️"}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Chip label={stock > 0 ? "En stock" : "Rupture"} size="small"
                      sx={{ bgcolor: stock > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: stock > 0 ? "#10b981" : "#ef4444", fontWeight: 700, fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#3b82f6" } }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => setDeleteConfirm(p.id)} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#ef4444" } }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "#fff", fontWeight: 800 }}>{editId ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { key: "productTitle",       label: "Titre du produit", xs: 12 },
              { key: "productPrice",       label: "Prix (DA)",        xs: 6, type: "number" },
              { key: "stock",              label: "Stock",            xs: 6, type: "number" },
              { key: "discount",           label: "Remise (%)",       xs: 6, type: "number" },
              { key: "productDescription", label: "Description",      xs: 12, multiline: true },
            ].map(f => (
              <Grid item xs={f.xs} key={f.key}>
                <TextField fullWidth label={f.label} type={f.type || "text"} value={form[f.key] || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  multiline={f.multiline} rows={f.multiline ? 3 : 1}
                  sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.15)" }, "&:hover fieldset": { borderColor: "#E63946" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } }} />
              </Grid>
            ))}
            <Grid item xs={6}>
              <TextField select fullWidth label="Marque" value={form.category || "PEUGEOT"}
                onChange={e => setForm({ ...form, category: e.target.value })}
                SelectProps={{ native: true }}
                sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.15)" }, "&:hover fieldset": { borderColor: "#E63946" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" } }}>
                {MARQUES.map(m => <option key={m} value={m} style={{ background: "#111" }}>{m}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, borderRadius: 2, border: "1px dashed rgba(255,255,255,0.2)", textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "#E63946" } }}
                onClick={() => document.getElementById("img-upload-admin").click()}>
                <input id="img-upload-admin" type="file" accept="image/*" hidden onChange={e => setForm({ ...form, image: e.target.files[0] })} />
                {form.image
                  ? <Typography fontSize={12} color="#10b981">✓ {form.image.name}</Typography>
                  : form.imageUrl
                  ? <Typography fontSize={12} color="#3b82f6">Image existante — cliquez pour changer</Typography>
                  : <Typography fontSize={12} color="rgba(255,255,255,0.3)">📷 Cliquez pour ajouter une image</Typography>
                }
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}
            sx={{ bgcolor: "#E63946", borderRadius: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#c1121f" } }}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "#fff", fontWeight: 800 }}>Confirmer la suppression</DialogTitle>
        <DialogContent><Typography color="rgba(255,255,255,0.6)">Cette action est irréversible.</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>Annuler</Button>
          <Button variant="contained" onClick={() => handleDelete(deleteConfirm)}
            sx={{ bgcolor: "#ef4444", borderRadius: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#dc2626" } }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

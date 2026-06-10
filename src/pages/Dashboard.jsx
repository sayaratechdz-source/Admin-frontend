// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Stack, Divider,
} from "@mui/material";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getProducts } from "../api/strapi";
import { getAllPurchases } from "../api/strapi";
import { getAllUsers } from "../api/strapi";

const RED = "#E63946";
const PALETTE = [RED, "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

const STATUS_MAP = {
  pending:   { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", label: "En attente" },
  confirmed: { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6", label: "Confirmée"  },
  shipped:   { bg: "rgba(139,92,246,0.15)",  color: "#8b5cf6", label: "Expédiée"   },
  delivered: { bg: "rgba(16,185,129,0.15)",  color: "#10b981", label: "Livrée"     },
  cancelled: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "Annulée"    },
};

function KCard({ icon, color, label, value, sub }) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, bgcolor: "#111",
      border: "1px solid rgba(255,255,255,0.07)",
      position: "relative", overflow: "hidden", transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-2px)", border: `1px solid ${color}55` },
      "&::before": { content: '""', position: "absolute", top: 0, left: 0, width: 3, height: "100%", bgcolor: color },
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, mb: 0.8 }}>
            {label}
          </Typography>
          <Typography sx={{ color: "#fff", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
          {sub && <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, mt: 0.6 }}>{sub}</Typography>}
        </Box>
        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const [products,  setProducts]  = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getAllPurchases(),
      getAllUsers(),
    ]).then(([prods, purch, usrs]) => {
      setProducts(prods);
      setPurchases(purch);
      setUsers(usrs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#0a0a0a" }}>
      <CircularProgress sx={{ color: RED }} size={36} />
    </Box>
  );

  const totalRevenue = purchases.reduce((s, p) => s + Number(p.totalPrice || 0), 0);

  // مبيعات شهرية
  const monthlySales = {};
  purchases.forEach(p => {
    const date = new Date(p.createdAt || Date.now());
    const k = date.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
    monthlySales[k] = (monthlySales[k] || 0) + (p.quantity || 0);
  });
  const monthlyData = Object.entries(monthlySales).map(([month, sales]) => ({ month, sales }));

  // أفضل المنتجات
  const topProducts = products.map(p => ({
    name: (p.productTitle || "?").slice(0, 14),
    sold: purchases.filter(pu => pu.productId === p.id).reduce((s, pu) => s + (pu.quantity || 0), 0),
  })).sort((a, b) => b.sold - a.sold).slice(0, 6);

  // توزيع الطلبات حسب الولاية
  const wilayaMap = {};
  purchases.forEach(p => {
    if (p.wilaya) wilayaMap[p.wilaya] = (wilayaMap[p.wilaya] || 0) + 1;
  });
  const wilayaData = Object.entries(wilayaMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // آخر الطلبات
  const latestOrders = [...purchases].slice(0, 8);

  // مخزون منخفض
  const lowStock = products.filter(p => (p.stock || 0) <= (p.minStock || 5));

  return (
    <Box sx={{ p: 4, bgcolor: "#0a0a0a", minHeight: "100vh" }}>
      {/* KPIs */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KCard icon={<ShoppingCartIcon />} color={RED}     label="Commandes"  value={purchases.length} sub="total" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KCard icon={<InventoryIcon />}    color="#3b82f6" label="Produits"    value={products.length}  sub="en ligne" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KCard icon={<AttachMoneyIcon />}  color="#10b981" label="Revenus"     value={totalRevenue.toLocaleString() + " DA"} sub="total" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KCard icon={<PeopleIcon />}       color="#f59e0b" label="Utilisateurs" value={users.length}   sub="inscrits" />
        </Grid>
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={3} mb={3}>
        {/* Monthly sales */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <TrendingUpIcon sx={{ color: RED, fontSize: 20 }} />
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Ventes mensuelles</Typography>
            </Stack>
            {monthlyData.length === 0
              ? <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Aucune donnée</Typography>
                </Box>
              : <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={RED} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    <Area type="monotone" dataKey="sales" stroke={RED} strokeWidth={2} fill="url(#salesGrad)" name="Ventes" />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </Paper>
        </Grid>

        {/* Wilaya pie */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3 }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14, mb: 3 }}>Commandes par wilaya</Typography>
            {wilayaData.length === 0
              ? <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Aucune donnée</Typography>
                </Box>
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={wilayaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                      {wilayaData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
            }
          </Paper>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={3} mb={3}>
        {/* Top products */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3 }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14, mb: 2.5 }}>Top produits vendus</Typography>
            {topProducts.length === 0
              ? <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Aucune vente</Typography>
                </Box>
              : <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={topProducts} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    <Bar dataKey="sold" name="Vendus" radius={[6, 6, 0, 0]}>
                      {topProducts.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Paper>
        </Grid>

        {/* Latest orders */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ bgcolor: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2 }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Dernières commandes</Typography>
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#0d0d0d" }}>
                  {["Client", "Produit", "Qté", "Total", "Wilaya", "Statut"].map(h => (
                    <TableCell key={h} sx={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {latestOrders.length === 0 && (
                  <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "rgba(255,255,255,0.2)", borderBottom: "none" }}>Aucune commande</TableCell></TableRow>
                )}
                {latestOrders.map(p => {
                  const status = STATUS_MAP[p.status] || STATUS_MAP.pending;
                  return (
                    <TableRow key={p.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                      <TableCell sx={{ borderBottom: "none", color: "#fff", fontSize: 12, fontWeight: 600 }}>{p.name || "—"}</TableCell>
                      <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.6)", fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.productTitle || "—"}</TableCell>
                      <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{p.quantity}</TableCell>
                      <TableCell sx={{ borderBottom: "none", color: "#10b981", fontWeight: 700, fontSize: 12 }}>{Number(p.totalPrice || 0).toLocaleString()} DA</TableCell>
                      <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{p.wilaya || "—"}</TableCell>
                      <TableCell sx={{ borderBottom: "none" }}>
                        <Chip label={status.label} size="small"
                          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: 10, height: 20 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, bgcolor: "#111", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 3 }}>
          <Typography sx={{ color: "#f59e0b", fontWeight: 800, fontSize: 14, mb: 2 }}>
            ⚠️ Stock faible ({lowStock.length} produits)
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {lowStock.map(p => (
              <Chip key={p.id} label={`${p.productTitle} — ${p.stock} restants`} size="small"
                sx={{ bgcolor: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 700, fontSize: 11 }} />
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

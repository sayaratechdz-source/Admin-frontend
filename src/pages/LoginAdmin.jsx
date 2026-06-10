// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Stack,
  Alert, InputAdornment, IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import axios from "axios";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || "https://backend-stdz-production.up.railway.app";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // تسجيل الدخول عبر Strapi
      const { data } = await axios.post(`${STRAPI_URL}/api/auth/local`, {
        identifier: email,
        password,
      });

      const { jwt, user } = data;

      // التحقق من أن المستخدم لديه role admin أو superAdmin
      const isAdmin =
        user.role?.type === "admin" ||
        user.role?.type === "superAdmin" ||
        user.isAdmin === true;

      if (!isAdmin) {
        setError("Accès refusé. Compte administrateur requis.");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminJwt", jwt);
      localStorage.setItem("adminUid", String(user.id));
      localStorage.setItem("adminName", user.username || email);
      navigate("/");
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400 || status === 401
          ? "Identifiants incorrects."
          : "Erreur de connexion au serveur.";
      setError(msg);
    }
    setLoading(false);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff", bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2,
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
      "&:hover fieldset": { borderColor: "#E63946" },
      "&.Mui-focused fieldset": { borderColor: "#E63946", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#E63946" },
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex",
      background: "radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.06) 0%, transparent 60%), #080808",
    }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: "none", md: "flex" }, flex: 1,
        background: "linear-gradient(145deg, #0d0d0d 0%, #1a0000 60%, #0d0d0d 100%)",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        p: 6, position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(230,57,70,0.1)",
      }}>
        {[200, 350, 500].map((size, i) => (
          <Box key={i} sx={{ position: "absolute", width: size, height: size, borderRadius: "50%",
            border: "1px solid rgba(230,57,70,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        ))}
        <Stack alignItems="center" spacing={3} sx={{ position: "relative" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: "#E63946", display: "flex",
            alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(230,57,70,0.4)" }}>
            <DirectionsCarIcon sx={{ fontSize: 42, color: "#fff" }} />
          </Box>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 3 }}>
            SAYARA<Box component="span" sx={{ color: "#E63946" }}>TECH</Box>
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 2 }}>
            PANNEAU D'ADMINISTRATION
          </Typography>
          <Stack spacing={1.5} mt={2}>
            {["Gestion des produits", "Suivi des commandes", "Gestion des utilisateurs"].map(t => (
              <Stack key={t} direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#E63946" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{t}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Right form */}
      <Box sx={{ flex: { xs: 1, md: "0 0 480px" }, display: "flex", alignItems: "center",
        justifyContent: "center", p: { xs: 3, sm: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Stack alignItems="center" spacing={1} mb={5}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: "rgba(230,57,70,0.15)",
              border: "1px solid rgba(230,57,70,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AdminPanelSettingsIcon sx={{ color: "#E63946", fontSize: 26 }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Connexion Admin</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Accès réservé aux administrateurs</Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", "& .MuiAlert-icon": { color: "#ef4444" } }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <TextField label="Email" fullWidth value={email} onChange={e => setEmail(e.target.value)} sx={inputSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }} /></InputAdornment> }} />

              <TextField label="Mot de passe" type={showPass ? "text" : "password"} fullWidth
                value={password} onChange={e => setPassword(e.target.value)} sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)} sx={{ color: "rgba(255,255,255,0.3)" }}>
                      {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>,
                }} />

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ bgcolor: "#E63946", borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: "none", fontSize: 15,
                  "&:hover": { bgcolor: "#c1121f" }, boxShadow: "0 8px 24px rgba(230,57,70,0.3)" }}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

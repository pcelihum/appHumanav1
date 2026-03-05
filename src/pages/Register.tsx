import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const d = data as { register?: string | null };

      setSuccess(d.register ?? "Usuario registrado");
      setError("");
      setTimeout(() => navigate("/login"), 1200);
    },
    onError: (err) => {
      setSuccess("");
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    register({ variables: { username, password } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        background: "linear-gradient(135deg, #0b1220, #0f172a)",
      }}
    >
      {/* LEFT: Image / Brand */}
      <Box
        sx={{
          position: "relative",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background:
            "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.16), transparent 60%), #0b1220",
        }}
      >
        {/* Decorative grid */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            opacity: 0.25,
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", maxWidth: 520, width: "100%" }}>
          <Box
            component="img"
            src="/logo_horizontal.png"
            alt="MegaTech"
            sx={{
              width: "100%",
              maxWidth: 420,
              height: "auto",
              filter: "drop-shadow(0 0 14px rgba(56,189,248,0.35))",
              mb: 4,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.92)",
              mb: 1,
            }}
          >

          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.70)",
              lineHeight: 1.6,
              maxWidth: 460,
            }}
          >
            
          </Typography>
        </Box>
      </Box>

      {/* RIGHT: Form */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(15, 27, 45, 0.88)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Mobile brand */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
            <Box
              component="img"
              src="/logo_horizontal.png"
              alt="MegaTech"
              sx={{
                width: "100%",
                maxWidth: 260,
                height: "auto",
                mb: 2,
                filter: "drop-shadow(0 0 10px rgba(56,189,248,0.30))",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            Register
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 0.5, mb: 3, color: "rgba(255,255,255,0.70)" }}
          >
            Crea tu usuario para empezar.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={muiFieldStyles}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={muiFieldStyles}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddAltIcon />
              }
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2,
                fontWeight: 900,
                color: "#07111f",
                background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                },
              }}
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.10)" }} />

          <Typography variant="body2" sx={{ opacity: 0.78 }}>
            ¿Ya tienes cuenta?{" "}
            <span
              style={{ cursor: "pointer", color: "#38bdf8", fontWeight: 800 }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const muiFieldStyles = {
  input: { color: "rgba(255,255,255,0.92)" },
  label: { color: "rgba(255,255,255,0.60)" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255,255,255,0.10)" },
    "&:hover fieldset": { borderColor: "rgba(56,189,248,0.55)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(56,189,248,0.85)" },
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 2,
  },
};
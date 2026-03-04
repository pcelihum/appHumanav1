import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      userId
      roles
    }
  }
`;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("token", data.login.token);
      localStorage.setItem("userId", String(data.login.userId)); //
      localStorage.setItem("roles", JSON.stringify(data.login.roles));
      
      navigate("/products");
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login({ variables: { username, password } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)"
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            backgroundColor: "#111827",
            color: "#fff"
          }}
        >
          <CardContent sx={{ p: 4 }}>

            {/* LOGO */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  width: 300,
                  height: 300,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 10px rgba(56,189,248,0.4))"
                }}
              />
            </Box>          
            <form onSubmit={handleSubmit}>

              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#9ca3af" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#374151" },
                    "&:hover fieldset": { borderColor: "#38bdf8" },
                    "&.Mui-focused fieldset": { borderColor: "#38bdf8" }
                  }
                }}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#9ca3af" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#374151" },
                    "&:hover fieldset": { borderColor: "#38bdf8" },
                    "&.Mui-focused fieldset": { borderColor: "#38bdf8" }
                  }
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  loading
                    ? <CircularProgress size={20} color="inherit" />
                    : <LoginIcon />
                }
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)"
                  }
                }}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3, opacity: 0.7 }}
            >
              Don’t have an account?{" "}
              <span
                style={{ cursor: "pointer", color: "#38bdf8" }}
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </Typography>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
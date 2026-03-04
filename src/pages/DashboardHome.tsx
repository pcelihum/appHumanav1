import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GET_USERS = gql`
  query Users {
    users {
      id
      username
      role
    }
  }
`;

type User = {
  id: string;
  username: string;
  role: string;
};

type UsersResponse = {
  users: User[];
};

function isUnauthorizedError(msg: string) {
  return msg.includes("Unauthorized") || msg.includes("403") || msg.includes("FORBIDDEN");
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, loading, error } = useQuery<UsersResponse>(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  // Manejo 403/Unauthorized como en tus pages
  if (error) {
    if (isUnauthorizedError(error.message)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("roles");
      navigate("/login");
      return null;
    }
  }

  const users = data?.users ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const id = String(u.id).toLowerCase();
      const username = (u.username ?? "").toLowerCase();
      const role = (u.role ?? "").toLowerCase();
      return id.includes(q) || username.includes(q) || role.includes(q);
    });
  }, [users, search]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Usuarios
      </Typography>
      <Card
        sx={{
          backgroundColor: "#111827",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 3,
          mb: 2,
        }}
      >
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por id, username o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#0b1220",
                borderRadius: 2,
                color: "white",
                "& fieldset": { borderColor: "#243145" },
                "&:hover fieldset": { borderColor: "#38bdf8" },
                "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
              },
              input: { color: "white" },
            }}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <Chip
              label={`Total: ${users.length}`}
              sx={{
                backgroundColor: "rgba(56,189,248,0.12)",
                color: "white",
                border: "1px solid rgba(56,189,248,0.25)",
              }}
            />
            <Chip
              label={`Filtrados: ${filtered.length}`}
              sx={{
                backgroundColor: "rgba(167,139,250,0.12)",
                color: "white",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          backgroundColor: "#111827",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Typography color="error">Error: {error.message}</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "70vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: "#0b1220",
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 800,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#0b1220",
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 800,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#0b1220",
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 800,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      Role
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filtered.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
                      }}
                    >
                      <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {u.id}
                      </TableCell>
                      <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {u.username}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <Chip
                          size="small"
                          label={u.role}
                          sx={{
                            color: "white",
                            backgroundColor:
                              u.role.toUpperCase().includes("ADMIN")
                                ? "rgba(34,197,94,0.14)"
                                : "rgba(56,189,248,0.12)",
                            border:
                              u.role.toUpperCase().includes("ADMIN")
                                ? "1px solid rgba(34,197,94,0.25)"
                                : "1px solid rgba(56,189,248,0.25)",
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ color: "rgba(255,255,255,0.7)", p: 3 }}>
                        No hay usuarios que coincidan con tu búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
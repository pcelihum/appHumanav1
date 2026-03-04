import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

const drawerWidth = 260;
const collapsedWidth = 72;

function readRolesFromLocalStorage(): string[] {
  try {
    const raw = localStorage.getItem("roles");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isAdminRoute(pathname: string) {
  // todo lo que NO sea orders/settings/login/register lo tratamos como admin
  if (pathname.startsWith("/orders")) return false;
  if (pathname.startsWith("/settings")) return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/register")) return false;
  // "/" (DashboardHome) y "/products" y "/user..." => admin
  return true;
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const openMenu = Boolean(anchorEl);

  const token = localStorage.getItem("token") ?? "";
  const userId = localStorage.getItem("userId") ?? "";

  const roles = useMemo(() => readRolesFromLocalStorage(), []);
  const isAdmin = roles.includes("ROLE_ADMIN");

  // Redirecciona a orders si entra en otro lado
  useEffect(() => {
    if (!isAdmin && isAdminRoute(location.pathname)) {
      navigate("/orders", { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  const jwtInfo = useMemo(() => {
    const payload = safeParseJwt(token);
    const username = typeof payload?.sub === "string" ? payload.sub : "Usuario";
    const rolesArr = Array.isArray(payload?.roles) ? payload.roles : roles;
    const rolesText = rolesArr.length ? rolesArr.join(", ") : "—";
    return { username, roles: rolesText };
  }, [token, roles]);

  const pageTitle = useMemo(() => getPageTitle(location.pathname, isAdmin), [location.pathname, isAdmin]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
    navigate("/login");
  };


  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#0b1220",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          px: collapsed ? 1 : 2,
          minHeight: 60,
        }}
      >
        {!collapsed ? (
          <Box
            component="img"
            src="/logo_horizontal.png"
            alt="MegaTech"
            sx={{
              height: 26,
              width: "auto",
              objectFit: "contain",
              opacity: 0.95,
            }}
          />
        ) : (
          <Box
            component="img"
            src="/logo.png"
            alt="MegaTech"
            sx={{
              height: 26,
              width: 26,
              objectFit: "contain",
              opacity: 0.95,
            }}
          />
        )}

        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: "rgba(255,255,255,0.55)", borderRadius: 1 }}
          >
            <ChevronLeftIcon
              sx={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: ".18s",
                fontSize: 20,
              }}
            />
          </IconButton>
        )}
      </Toolbar>

      <List sx={{ mt: 1, px: 1 }}>
        {/* ✅ USER solo ve Órdenes */}
        {/* ✅ ADMIN ve todo */}
        {isAdmin && (
          <SidebarItem
            icon={<PeopleAltRoundedIcon />}
            text="Usuarios"
            active={location.pathname === "/" || location.pathname.startsWith("/user")}
            collapsed={collapsed}
            onClick={() => navigate("/")}
          />
        )}

        {isAdmin && (
          <SidebarItem
            icon={<Inventory2RoundedIcon />}
            text="Productos"
            active={location.pathname.startsWith("/products")}
            collapsed={collapsed}
            onClick={() => navigate("/products")}
          />
        )}

        <SidebarItem
          icon={<ReceiptLongRoundedIcon />}
          text="Órdenes"
          active={location.pathname.startsWith("/orders")}
          collapsed={collapsed}
          onClick={() => navigate("/orders")}
        />
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          px: 1,
          pb: 1.2,
          pt: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <SidebarItem
          icon={<SettingsIcon />}
          text="Settings"
          active={location.pathname.startsWith("/settings")}
          collapsed={collapsed}
          onClick={() => navigate("/settings")}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      {/* NAVBAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "rgba(11,18,32,0.82)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 60 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            {isMobile && (
              <IconButton color="inherit" onClick={() => setMobileOpen(true)} sx={{ borderRadius: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Box
              component="img"
              src="/logo_blanco.png"
              alt="MegaTech"
              sx={{ height: 28, width: "auto", objectFit: "contain", opacity: 0.95 }}
            />
            <Typography variant="body2" sx={{ opacity: 0.75, fontWeight: 600 }}>
              / {pageTitle}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip
              placement="bottom-end"
              arrow
              title={
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                    {jwtInfo.username}
                  </Typography>
                  <Typography sx={{ opacity: 0.85, fontSize: 12 }}>
                    Roles: {jwtInfo.roles}
                  </Typography>
                  <Typography sx={{ opacity: 0.85, fontSize: 12 }}>
                    UserId: {userId || "—"}
                  </Typography>
                </Box>
              }
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "rgba(17,24,39,0.98)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2,
                  },
                },
                arrow: {
                  sx: { color: "rgba(17,24,39,0.98)" },
                },
              }}
            >
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ borderRadius: 1 }}>
                <Avatar alt="Usuario" src="/user.png" sx={{ width: 34, height: 34 }} />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  backgroundColor: "rgba(17,24,39,0.98)",
                  color: "text.primary",
                  borderRadius: 2,
                  mt: 1,
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 230,
                },
              }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 13 }}>
                  {jwtInfo.username}
                </Typography>
                <Typography sx={{ opacity: 0.8, fontSize: 12 }}>
                  {jwtInfo.roles}
                </Typography>
                <Typography sx={{ opacity: 0.8, fontSize: 12 }}>
                  UserId: {userId || "—"}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/settings");
                }}
              >
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} /> Settings
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  handleLogout();
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: collapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : drawerWidth,
            transition: "width .2s ease",
            overflowX: "hidden",
            backgroundColor: "transparent",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, text, collapsed, active, onClick }: SidebarItemProps) {
  const accent = "#38bdf8";
  return (
    <Tooltip title={collapsed ? text : ""} placement="right">
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 1,
          px: collapsed ? 1.5 : 1.75,
          py: 1.15,
          mb: 0.5,
          position: "relative",
          backgroundColor: active ? "rgba(56,189,248,0.10)" : "transparent",
          "&:hover": {
            backgroundColor: active ? "rgba(56,189,248,0.14)" : "rgba(255,255,255,0.04)",
          },
        }}
      >
        {active && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 6,
              bottom: 6,
              width: 3,
              borderRadius: 1,
              backgroundColor: accent,
            }}
          />
        )}

        <ListItemIcon
          sx={{
            color: active ? accent : "rgba(255,255,255,0.70)",
            minWidth: 0,
            mr: collapsed ? 0 : 1.5,
            justifyContent: "center",
            "& svg": { fontSize: 20 },
          }}
        >
          {icon}
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={text}
            primaryTypographyProps={{
              fontWeight: active ? 700 : 500,
              fontSize: 13.5,
              color: active ? "text.primary" : "rgba(255,255,255,0.88)",
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
}

function getPageTitle(pathname: string, isAdmin: boolean) {
  if (isAdmin && (pathname === "/" || pathname.startsWith("/user"))) return "Usuarios";
  if (isAdmin && pathname.startsWith("/products")) return "Productos";
  if (pathname.startsWith("/orders")) return "Órdenes";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}

function safeParseJwt(token: string): any | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
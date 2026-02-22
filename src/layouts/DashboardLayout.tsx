import { useState } from "react";
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

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 260;
const collapsedWidth = 80;


export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const openMenu = Boolean(anchorEl);

  const handleLogout = () => {
    navigate("/login");
  };

  
  /* Dentro de DashboardLayout */

const drawerContent = (
  <Box
    sx={{
      height: "100%",
      background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      transition: "all .3s ease",
    }}
  >
    <Toolbar
      sx={{
        justifyContent: collapsed ? "center" : "space-between",
      }}
    >
      {!collapsed && (
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg,#60a5fa,#a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          MegaTech
        </Typography>
      )}

      {!isMobile && (
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: "#94a3b8" }}
        >
          <ChevronLeftIcon
            sx={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: ".3s",
            }}
          />
        </IconButton>
      )}
    </Toolbar>

    <List sx={{ mt: 2 }}>
      <SidebarItem
        icon={<DashboardIcon />}
        text="Dashboard"
        active={location.pathname === "/"}
        collapsed={collapsed}
        onClick={() => navigate("/")}
      />
      <SidebarItem
        icon={<InventoryIcon />}
        text="Products"
        active={location.pathname === "/products"}
        collapsed={collapsed}
        onClick={() => navigate("/products")}
      />
    </List>
  </Box>
);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #1e293b, #0f172a 60%)",
        color: "white",
      }}
    >
      {/* NAVBAR */}
       <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo o botón izquierdo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/logo.png"
            alt="logo"
            sx={{
              height: 38,
              mr: 2,
              filter: "drop-shadow(0 0 6px rgba(96,165,250,.6))",
            }}
          />
        </Box>

        {/* Sección de avatar e íconos */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Settings */}
          <Tooltip title="Configuración">
            <IconButton
              color="inherit"
             
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title="Usuario">
            <IconButton>
              <Avatar
                alt="Usuario"
                src="/user.png" // reemplaza con tu avatar
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menú de configuración */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              backgroundColor: "#1e293b",
              color: "white",
              borderRadius: 3,
              mt: 1,
            },
          }}
        >
          <MenuItem>
            <SettingsIcon sx={{ mr: 1 }} /> Configuración
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,.1)" }} />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
      {/* SIDEBAR */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: collapsed ? collapsedWidth : drawerWidth,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : drawerWidth,
            transition: "width .3s ease",
            overflowX: "hidden",
            background: "transparent",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* CONTENIDO */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
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

function SidebarItem({
  icon,
  text,
  collapsed,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <Tooltip title={collapsed ? text : ""} placement="right">
      <ListItemButton
        onClick={onClick}
        sx={{
          mx: 2,
          mb: 1,
          borderRadius: 3,
          position: "relative",
          backgroundColor: active ? "rgba(99,102,241,.15)" : "transparent",
          "&:hover": {
            backgroundColor: "rgba(99,102,241,.25)",
          },
          "&::before": active
            ? {
                content: '""',
                position: "absolute",
                left: 0,
                top: 8,
                bottom: 8,
                width: 4,
                borderRadius: 4,
                background: "linear-gradient(180deg,#60a5fa,#a78bfa)",
              }
            : {},
        }}
      >
        <ListItemIcon
          sx={{
            color: active ? "#a78bfa" : "#ffffff",
            minWidth: 0,
            mr: collapsed ? 0 : 2,
            justifyContent: "center",
            fontSize: 28, // asegura que los íconos se vean
          }}
        >
          {icon}
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={text}
            primaryTypographyProps={{
              fontWeight: active ? 600 : 400,
              color: "white",
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
}

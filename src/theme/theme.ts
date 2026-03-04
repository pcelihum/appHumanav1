import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b1220",
      paper: "rgba(17,24,39,0.78)",
    },
    text: {
      primary: "#e5e7eb",     // gris claro, no blanco puro
      secondary: "#9ca3af",   // gris suave
    },
  },
  typography: {
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(30,41,59,.9), rgba(11,18,32,1) 60%)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 14,
          paddingInline: 18,
          paddingBlock: 10,
        },
        contained: {
          background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
          boxShadow: "0 10px 22px rgba(2,132,199,0.18)",
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.16)",
          color: "rgba(255,255,255,0.9)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundImage:
            "linear-gradient(180deg, rgba(17,24,39,0.84), rgba(15,23,42,0.84))",
          backdropFilter: "blur(14px)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage:
            "linear-gradient(180deg, rgba(17,24,39,0.95), rgba(15,23,42,0.95))",
          backdropFilter: "blur(14px)",
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
        notchedOutline: {
          borderColor: "rgba(255,255,255,0.16)",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { color: "rgba(255,255,255,0.6)" },
      },
    },
  },
});

export default theme;
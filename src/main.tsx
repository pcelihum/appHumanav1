import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ApolloProvider } from "@apollo/client/react";  
import client from "./apolloClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";


const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "products", element: <Products /> },
      { path: "orders", element: <Orders /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { Autocomplete, TextField } from "@mui/material";

/** =========================
 *  GraphQL
 *  ========================= */

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
    }
  }
`;

const GET_USERS = gql`
  query Users {
    users {
      id
      username
      role
    }
  }
`;

const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      userId
      totalAmount
      status
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
    }
  }
`;

const ORDERS_BY_USER = gql`
  query OrdersByUser($userId: ID!) {
    ordersByUser(userId: $userId) {
      id
      userId
      totalAmount
      status
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
    }
  }
`;

const CREATE_MY_ORDER = gql`
  mutation CreateMyOrder($items: [OrderItemInput!]!) {
    createMyOrder(items: $items) {
      id
      userId
      totalAmount
      status
      createdAt
    }
  }
`;

const CREATE_ORDER_FOR_USER = gql`
  mutation CreateOrderForUser($userId: ID!, $items: [OrderItemInput!]!) {
    createOrderForUser(userId: $userId, items: $items) {
      id
      userId
      totalAmount
      status
      createdAt
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      userId
      totalAmount
    }
  }
`;

/** =========================
 *  Types
 *  ========================= */

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
}

type OrderStatus = "CREATED" | "PAID" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

type ProductsResponse = { products: Product[] };
type MyOrdersResponse = { myOrders: Order[] };
type OrdersByUserResponse = { ordersByUser: Order[] };

type User = { id: string; username: string; role: string };
type UsersResponse = { users: User[] };

/** =========================
 *  Helpers
 *  ========================= */

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

function isUnauthorizedError(msg: string) {
  return msg.includes("Unauthorized") || msg.includes("403") || msg.includes("FORBIDDEN");
}

/** =========================
 *  Component
 *  ========================= */

export default function Orders() {
  const navigate = useNavigate();

  const roles = useMemo(() => readRolesFromLocalStorage(), []);
  const isAdmin = roles.includes("ROLE_ADMIN");

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Admin search
  const [adminMode, setAdminMode] = useState<"MY" | "SEARCH">("MY");
  const [searchUser, setSearchUser] = useState<User | null>(null); // ✅ nuevo (buscar por usuario)

  // Cart state
  const [cart, setCart] = useState<Record<string, number>>({});

  // Admin create-for-user
  const [createTarget, setCreateTarget] = useState<"ME" | "USER">("ME");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Product search in modal
  const [productSearch, setProductSearch] = useState("");

  /** Queries */
  const productsQuery = useQuery<ProductsResponse>(GET_PRODUCTS);

  const myOrdersQuery = useQuery<MyOrdersResponse>(MY_ORDERS, {
    fetchPolicy: "cache-and-network",
  });

  const usersQuery = useQuery<UsersResponse>(GET_USERS, {
    skip: !isAdmin,
    fetchPolicy: "cache-and-network",
  });

  // ✅ Ahora la query depende del usuario seleccionado, no de un textbox de id
  const ordersByUserQuery = useQuery<OrdersByUserResponse>(ORDERS_BY_USER, {
    variables: { userId: searchUser?.id ?? "0" },
    skip: !isAdmin || adminMode !== "SEARCH" || !searchUser,
    fetchPolicy: "cache-and-network",
  });

  /** Mutations */
  const [createMyOrder, createMyOrderState] = useMutation(CREATE_MY_ORDER);
  const [createOrderForUser, createOrderForUserState] = useMutation(CREATE_ORDER_FOR_USER);
  const [updateOrderStatus, updateOrderStatusState] = useMutation(UPDATE_ORDER_STATUS);

  /** Error handling like Products.tsx */
  const anyError =
    productsQuery.error || myOrdersQuery.error || ordersByUserQuery.error || usersQuery.error;

  if (anyError) {
    const msg = anyError.message ?? "Unknown error";
    if (isUnauthorizedError(msg)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("roles");
      navigate("/login");
      return null;
    }
  }

  const products = productsQuery.data?.products ?? [];
  const myOrders = myOrdersQuery.data?.myOrders ?? [];
  const searchedOrders = ordersByUserQuery.data?.ordersByUser ?? [];
  const visibleOrders = isAdmin && adminMode === "SEARCH" ? searchedOrders : myOrders;

  // ✅ Usuarios robusto (para evitar que el ddl quede vacío por el filtro)
  const usersAll = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data]);

  const usersCustomers = useMemo(() => {
    // filtro flexible (USER o ROLE_USER)
    const onlyUsers = usersAll.filter((u) => (u.role ?? "").toUpperCase().includes("USER"));
    return onlyUsers.length > 0 ? onlyUsers : usersAll; // fallback: si queda vacío, muestra todos
  }, [usersAll]);

  /** Filter products */
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q) || String(p.id).includes(q);
    });
  }, [products, productSearch]);

  /** Cart helpers */
  const cartItems = useMemo(() => {
    const list: { product: Product; qty: number }[] = [];
    for (const [productId, qty] of Object.entries(cart)) {
      const p = products.find((x) => x.id === productId);
      if (p && qty > 0) list.push({ product: p, qty });
    }
    return list;
  }, [cart, products]);

  const estimatedTotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.product.price * it.qty, 0);
  }, [cartItems]);

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };

  const setQty = (productId: string, qty: number) => {
    const safe = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
    setCart((prev) => ({ ...prev, [productId]: safe }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const closeCreateModal = () => {
    setCart({});
    setCreateTarget("ME");
    setSelectedUser(null);
    setProductSearch("");
    setShowCreateModal(false);
  };

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío 🙂");
      return;
    }

    const items = cartItems.map((it) => ({ productId: it.product.id, quantity: it.qty }));

    try {
      if (isAdmin && createTarget === "USER") {
        if (!selectedUser) {
          alert("Selecciona el usuario destino");
          return;
        }

        await createOrderForUser({
          variables: { userId: selectedUser.id, items },
        });
      } else {
        await createMyOrder({ variables: { items } });
      }

      closeCreateModal();

      await myOrdersQuery.refetch();
      if (isAdmin && adminMode === "SEARCH" && searchUser) await ordersByUserQuery.refetch();
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Error creando la orden");
    }
  };

  const handlePay = async (order: Order) => {
    if (!isAdmin) return;
    if (order.status !== "CREATED") return;

    try {
      await updateOrderStatus({ variables: { id: order.id, status: "PAID" } });

      if (isAdmin && adminMode === "SEARCH" && searchUser) await ordersByUserQuery.refetch();
      else await myOrdersQuery.refetch();

      setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: "PAID" } : prev));
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Error marcando como pagada");
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!isAdmin) return;
    if (order.status !== "CREATED") return;

    const ok = window.confirm(`¿Seguro que quieres cancelar la orden #${order.id}?`);
    if (!ok) return;

    try {
      await updateOrderStatus({ variables: { id: order.id, status: "CANCELLED" } });

      if (isAdmin && adminMode === "SEARCH" && searchUser) await ordersByUserQuery.refetch();
      else await myOrdersQuery.refetch();

      setSelectedOrder((prev) =>
        prev && prev.id === order.id ? { ...prev, status: "CANCELLED" } : prev
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Error cancelando la orden");
    }
  };

  const loading =
    productsQuery.loading ||
    myOrdersQuery.loading ||
    usersQuery.loading ||
    createMyOrderState.loading ||
    createOrderForUserState.loading ||
    updateOrderStatusState.loading;

  return (
    <div className="container">
      {/* Header actions */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
          + Crear Orden
        </button>

        {isAdmin && (
          <>
            <button className={adminMode === "MY" ? "primary-btn" : "secondary-btn"} onClick={() => setAdminMode("MY")}>
              Mis Órdenes
            </button>

            <button
              className={adminMode === "SEARCH" ? "primary-btn" : "secondary-btn"}
              onClick={() => setAdminMode("SEARCH")}
            >
              Buscar por Usuario
            </button>

            {/* Buscador por usuario (Autocomplete) */}
            {adminMode === "SEARCH" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Autocomplete
                  options={usersCustomers}
                  loading={usersQuery.loading}
                  value={searchUser}
                  onChange={(_, value) => setSearchUser(value)}
                  getOptionLabel={(option) => `${option.username} (#${option.id})`}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  sx={{ width: 280 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Selecciona usuario..."
                      size="small"
                    />
                  )}
                />

                <button
                  className="secondary-btn"
                  onClick={() => ordersByUserQuery.refetch()}
                  disabled={!searchUser}
                >
                  Buscar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {loading && <div className="center">Cargando...</div>}
      {anyError && !isUnauthorizedError(anyError.message) && <div className="error">Error: {anyError.message}</div>}

      {/* Orders list */}
      <div className="products-grid">
        {visibleOrders.map((order) => {
          const canChange = isAdmin && order.status === "CREATED";

          return (
            <div key={order.id} className="product-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>Orden #{order.id}</h3>
                  <p className="description" style={{ margin: 0 }}>
                    UserId: {order.userId} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="price">${Number(order.totalAmount).toFixed(2)}</div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>Estado: {order.status}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ opacity: 0.85, fontSize: 13 }}>Items: {order.items?.length ?? 0}</div>

                <div className="form-actions" style={{ marginTop: 0 }}>
                  <button className="primary-btn" onClick={() => setSelectedOrder(order)}>
                    Detalle
                  </button>

                  {canChange && (
                    <>
                      <button
                        className="primary-btn"
                        onClick={() => handlePay(order)}
                        disabled={updateOrderStatusState.loading}
                        title="Marcar como pagada"
                      >
                        Pagar
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => handleCancelOrder(order)}
                        disabled={updateOrderStatusState.loading}
                        title="Cancelar"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && order.status !== "CREATED" && (
                <div className="description" style={{ marginTop: 10, opacity: 0.8 }}>
                  Orden finalizada: <b>{order.status}</b>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visibleOrders.length === 0 && <div className="empty-state">No hay órdenes para mostrar.</div>}

      {/* Create Order Modal */}
      {showCreateModal && (
        <ModalShell title="Crear orden (carrito)" onClose={closeCreateModal}>
          {/* Admin target selector */}
          {isAdmin && (
            <div className="form-card" style={{ marginBottom: 16 }}>
              <h2 style={{ marginBottom: 12 }}>Destino</h2>

              <div className="form-actions" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={createTarget === "ME" ? "primary-btn" : "secondary-btn"}
                  onClick={() => setCreateTarget("ME")}
                >
                  Para mí
                </button>
                <button
                  type="button"
                  className={createTarget === "USER" ? "primary-btn" : "secondary-btn"}
                  onClick={() => setCreateTarget("USER")}
                >
                  Para otro usuario
                </button>
              </div>

              {/* ✅ FIX dropdown dentro del modal (z-index) */}
              {createTarget === "USER" && (
                <Autocomplete
                  disablePortal
                  slotProps={{
                      popper: { style: { zIndex: 9999 } }
                    }}
                  options={usersCustomers}
                  loading={usersQuery.loading}
                  value={selectedUser}
                  onChange={(_, value) => setSelectedUser(value)}
                  getOptionLabel={(option) => `${option.username} (#${option.id})`}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar usuario"
                      placeholder="Escribe username..."
                      margin="dense"
                      InputLabelProps={{ style: { color: "#9ca3af" } }}
                      InputProps={{ ...params.InputProps, style: { color: "white" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#334155",
                          borderRadius: 2,
                          "& fieldset": { borderColor: "#374151" },
                          "&:hover fieldset": { borderColor: "#38bdf8" },
                          "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                        },
                        "& .MuiSvgIcon-root": { color: "#e2e8f0" },
                      }}
                    />
                  )}
                />
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
            {/* Product picker */}
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>Productos</h2>

              <input
                type="text"
                placeholder="Buscar producto por nombre, descripción o id..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ marginBottom: 12 }}
              />

              {products.length === 0 ? (
                <div className="empty-state">No hay productos. (Admin debe crearlos)</div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">No hay coincidencias para “{productSearch}”.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="product-card" style={{ padding: 12, margin: 0, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div className="description">{p.description}</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontWeight: 900 }}>${p.price.toFixed(2)}</div>
                          <button className="primary-btn" onClick={() => addToCart(p.id)}>
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 12 }}>Tu carrito</h2>

              {cartItems.length === 0 ? (
                <div className="empty-state">Agrega productos para armar la orden.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {cartItems.map((it) => (
                    <div key={it.product.id} className="product-card" style={{ padding: 12, margin: 0, boxShadow: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 800 }}>{it.product.name}</div>
                        <div style={{ fontWeight: 900 }}>${(it.product.price * it.qty).toFixed(2)}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) => setQty(it.product.id, Number(e.target.value))}
                          style={{ marginBottom: 0 }}
                        />

                        <button className="secondary-btn" onClick={() => removeFromCart(it.product.id)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
                  <span>Total estimado</span>
                  <span>${estimatedTotal.toFixed(2)}</span>
                </div>

                <div className="form-actions" style={{ marginTop: 12 }}>
                  <button
                    className="primary-btn"
                    onClick={handleCreateOrder}
                    disabled={createMyOrderState.loading || createOrderForUserState.loading}
                  >
                    {createMyOrderState.loading || createOrderForUserState.loading ? "Creando..." : "Crear orden"}
                  </button>

                  <button className="secondary-btn" onClick={closeCreateModal}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <ModalShell title={`Detalle Orden #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.9 }}>
              <div><b>UserId:</b> {selectedOrder.userId}</div>
              <div><b>Fecha:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div><b>Estado:</b> {selectedOrder.status}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>${Number(selectedOrder.totalAmount).toFixed(2)}</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <h2 style={{ marginBottom: 12 }}>Items</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {selectedOrder.items?.map((it) => (
                <div key={it.id} className="product-card" style={{ padding: 12, margin: 0, boxShadow: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{it.product.name}</div>
                      <div className="description">
                        Qty: {it.quantity} • Unit: ${it.product.price.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ fontWeight: 900 }}>${Number(it.price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: 16 }}>
              <button className="secondary-btn" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

/** =========================
 *  Modal Shell
 *  ========================= */
function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="form-card"
        style={{
          width: "min(1100px, 98vw)",
          maxHeight: "85vh",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="secondary-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </div>
  );
}
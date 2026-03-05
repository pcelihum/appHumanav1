import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";

import ProductCard from "../components/ProductCard";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
};

type GetProductsResponse = { products: Product[] };

export default function Products() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const { data, loading, error, refetch } = useQuery<GetProductsResponse>(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const title = useMemo(() => (editing ? "Edit product" : "Create product"), [editing]);

  const logoutHard = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", description: "", price: 0 });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormData({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

const submit = async (e?: FormEvent) => {
    e?.preventDefault();

    try {
      if (editing) {
        await updateProduct({
          variables: {
            id: editing.id,
            input: {
              name: formData.name,
              description: formData.description,
              price: Number(formData.price),
            },
          },
        });
      } else {
        await createProduct({
          variables: {
            input: {
              name: formData.name,
              description: formData.description,
              price: Number(formData.price),
            },
          },
        });
      }

      close();
      refetch();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  if (loading) return <Box sx={{ p: 2 }}>Loading products...</Box>;

  if (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("403")) {
      logoutHard();
      return null;
    }
    return <Box sx={{ p: 2 }}>Error: {error.message}</Box>;
  }

  const products = data?.products ?? [];

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Products
        </Typography>

        <Button variant="contained" onClick={openCreate}>
          + Add New Gadget
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 2,
        }}
      >
        {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{ ...p, description: p.description ?? null }}
              onEdit={openEdit}
              onDelete={remove}
            />
          ))}
      </Box>

      {products.length === 0 && (
        <Typography sx={{ opacity: 0.8 }}>No products found. Create your first gadget ⚡</Typography>
      )}

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {title}
          <IconButton onClick={close}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={submit}>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />

            <TextField
              label="Price"
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              fullWidth
            />
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button variant="outlined" type="button" onClick={close}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {editing ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
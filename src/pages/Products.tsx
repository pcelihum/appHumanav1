import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

function Products() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
  });

  type GetProductsResponse = {
  products: Product[];
};
const { data, loading, error, refetch } =
  useQuery<GetProductsResponse>(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await updateProduct({
          variables: {
            id: editingProduct.id,
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

      setFormData({ name: "", description: "", price: 0 });
      setEditingProduct(null);
      setShowForm(false);
      refetch();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: 0 });
  };

  if (loading) {
    return <div className="center">Loading products...</div>;
  }

  if (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("403")) {
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }

    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="container">
      {!showForm && (
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Add New Gadget
        </button>
      )}

      {showForm && (
        <div className="form-card">
          <h2>{editingProduct ? "Edit Product" : "Create Product"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: Number(e.target.value),
                })
              }
              required
            />

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingProduct ? "Update" : "Create"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-grid">
        {data?.products.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {data?.products.length === 0 && !showForm && (
        <div className="empty-state">
          No products found. Create your first gadget ⚡
        </div>
      )}
    </div>
  );
}

export default Products;
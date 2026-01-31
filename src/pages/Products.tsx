import { useState } from 'react';
import { gql } from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router';

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
    name: '',
    description: '',
    price: 0
  });

  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
              price: parseFloat(formData.price.toString())
            }
          }
        });
      } else {
        await createProduct({
          variables: {
            input: {
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price.toString())
            }
          }
        });
      }
      setFormData({ name: '', description: '', price: 0 });
      setEditingProduct(null);
      setShowForm(false);
      refetch();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0 });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error) {
    if (error.message.includes('Unauthorized') || error.message.includes('403')) {
      localStorage.removeItem('token');
      navigate('/login');
      return null;
    }
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error: {error.message}</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Products</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Add New Product
        </button>
      )}

      {showForm && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
          <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '16px', minHeight: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Price:</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
                {editingProduct ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCancel} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {data.products.map((product: Product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h3 style={{ marginTop: 0 }}>{product.name}</h3>
            <p style={{ color: '#666' }}>{product.description}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>${product.price.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => handleEdit(product)}
                style={{ flex: 1, padding: '8px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                style={{ flex: 1, padding: '8px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.products.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <p>No products found. Create your first product!</p>
        </div>
      )}
    </div>
  );
}

export default Products;

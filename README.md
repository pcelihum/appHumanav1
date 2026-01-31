# React + GraphQL Frontend

Frontend React con TypeScript, Vite, Apollo Client y GraphQL conectado al backend Spring Boot.

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Implementación Paso a Paso](#implementación-paso-a-paso)
- [Configuración de Apollo Client](#configuración-de-apollo-client)
- [Páginas Implementadas](#páginas-implementadas)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Queries y Mutations GraphQL](#queries-y-mutations-graphql)

---

## 🚀 Tecnologías

- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Apollo Client** - Cliente GraphQL
- **React Router** - Navegación
- **GraphQL** - Lenguaje de consultas

---

## ✅ Requisitos Previos

1. **Backend Spring Boot** ejecutándose en `http://localhost:8080`
2. **Node.js** versión 18 o superior
3. **npm** o **yarn**

---

## 📦 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Instalar Apollo Client y GraphQL

```bash
npm install @apollo/client graphql
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
src/
├── apolloClient.ts          # Configuración de Apollo Client
├── main.tsx                 # Punto de entrada con rutas
├── pages/
│   ├── Login.tsx           # Página de login
│   ├── Register.tsx        # Página de registro
│   └── Products.tsx        # Página de productos (CRUD)
├── App.tsx
├── index.css
└── assets/
```

---

## 🛠️ Implementación Paso a Paso

### Paso 1: Instalar Apollo Client

```bash
npm install @apollo/client graphql
```

**¿Qué hace Apollo Client?**
- Cliente GraphQL para React
- Maneja cache automático
- Gestiona estado de loading/error
- Facilita queries y mutations

---

### Paso 2: Configurar Apollo Client

Crear `src/apolloClient.ts`:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Conexión HTTP al backend GraphQL
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

// Link de autenticación - agrega JWT token a headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Cliente Apollo con autenticación y cache
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;
```

**Explicación:**
- `httpLink`: Conecta al endpoint GraphQL del backend
- `authLink`: Intercepta requests y agrega token JWT del localStorage
- `InMemoryCache`: Cache automático de datos

---

### Paso 3: Configurar Rutas y Provider

Actualizar `src/main.tsx`:

```typescript
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/products",
        element: <Products />,
    },
]);

createRoot(document.getElementById('root')!).render(
    <ApolloProvider client={client}>
        <RouterProvider router={router} />
    </ApolloProvider>
)
```

**Explicación:**
- `ApolloProvider`: Provee el cliente Apollo a toda la app
- `createBrowserRouter`: Define rutas de la aplicación
- Ruta raíz `/` redirige a Login

---

### Paso 4: Crear Página de Login

Crear `src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router';

// Mutation GraphQL para login
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hook de Apollo para ejecutar mutation
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Guardar token en localStorage
      localStorage.setItem('token', data.login.token);
      // Redirigir a productos
      navigate('/products');
    },
    onError: (error) => {
      setError('Error: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({ variables: { username, password } });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}

export default Login;
```

**Explicación:**
- `useMutation`: Hook de Apollo para ejecutar mutations
- `onCompleted`: Callback cuando mutation es exitosa
- `localStorage.setItem`: Guarda JWT token
- `navigate`: Redirige a página de productos

---

### Paso 5: Crear Página de Register

Crear `src/pages/Register.tsx`:

```typescript
import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      setSuccess(data.register);
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      setError('Error: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    register({ variables: { username, password } });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Register;
```

---

### Paso 6: Crear Página de Productos (CRUD Completo)

Crear `src/pages/Products.tsx`:

```typescript
import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router';

// Query para obtener todos los productos
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

// Mutation para crear producto
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

// Mutation para actualizar producto
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

// Mutation para eliminar producto
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

  // Hook useQuery para obtener datos
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  
  // Hooks useMutation para operaciones CRUD
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
        // Actualizar producto existente
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
        // Crear nuevo producto
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
      refetch(); // Recargar lista de productos
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

  if (loading) return <div>Loading...</div>;
  if (error) {
    // Si hay error de autenticación, redirigir a login
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      navigate('/login');
      return null;
    }
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Products</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)}>Add New Product</button>
      )}

      {showForm && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', marginBottom: '30px' }}>
          <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <button type="submit">{editingProduct ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {data.products.map((product: Product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '20px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
            <button onClick={() => handleEdit(product)}>Edit</button>
            <button onClick={() => handleDelete(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
```

**Explicación:**
- `useQuery`: Hook para ejecutar queries GraphQL
- `useMutation`: Hook para ejecutar mutations (create, update, delete)
- `refetch()`: Recarga los datos después de operaciones CRUD
- Manejo de autenticación: Si token es inválido, redirige a login

---

## 🔐 Configuración de Apollo Client

### Flujo de Autenticación

1. **Login/Register** → Obtiene token JWT del backend
2. **localStorage** → Guarda token en el navegador
3. **authLink** → Intercepta todas las requests GraphQL
4. **Authorization Header** → Agrega `Bearer <token>` automáticamente
5. **Backend** → Valida token y permite/deniega acceso

### Código del authLink

```typescript
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});
```

---

## 📄 Páginas Implementadas

### 1. Login (`/login`)
- Formulario de login
- Mutation GraphQL `login`
- Guarda token JWT
- Redirige a `/products`

### 2. Register (`/register`)
- Formulario de registro
- Mutation GraphQL `register`
- Mensaje de éxito
- Redirige a `/login`

### 3. Products (`/products`)
- **Listar productos** - Query `products`
- **Crear producto** - Mutation `createProduct`
- **Editar producto** - Mutation `updateProduct`
- **Eliminar producto** - Mutation `deleteProduct`
- **Logout** - Limpia token y redirige a login

---

## 🎯 Uso de la Aplicación

### 1. Iniciar Backend

```bash
cd /path/to/backend
mvn spring-boot:run
```

Backend debe estar en: `http://localhost:8080`

### 2. Iniciar Frontend

```bash
npm run dev
```

Frontend estará en: `http://localhost:5173`

### 3. Flujo de Usuario

1. **Abrir** `http://localhost:5173`
2. **Registrarse** en `/register`
3. **Login** en `/login`
4. **Ver productos** en `/products`
5. **Crear/Editar/Eliminar** productos

---

## 📡 Queries y Mutations GraphQL

### Login
```graphql
mutation {
  login(username: "diego", password: "123456") {
    token
  }
}
```

### Register
```graphql
mutation {
  register(username: "nuevo", password: "pass123")
}
```

### Get Products
```graphql
query {
  products {
    id
    name
    description
    price
  }
}
```

### Create Product
```graphql
mutation {
  createProduct(input: {
    name: "Laptop"
    description: "Dell XPS 15"
    price: 1299.99
  }) {
    id
    name
    price
  }
}
```

### Update Product
```graphql
mutation {
  updateProduct(id: 1, input: {
    name: "Laptop Pro"
    description: "Dell XPS 15 Pro"
    price: 1599.99
  }) {
    id
    name
    price
  }
}
```

### Delete Product
```graphql
mutation {
  deleteProduct(id: 1)
}
```

---

## 🔧 Troubleshooting

### Error: "Network error"
**Causa:** Backend no está ejecutándose

**Solución:** Iniciar backend Spring Boot en puerto 8080

### Error: "Unauthorized" o 403
**Causa:** Token JWT inválido o expirado

**Solución:** Hacer logout y login nuevamente

### Error: CORS
**Causa:** Backend no permite requests desde `localhost:5173`

**Solución:** Configurar CORS en Spring Boot:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("*")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📚 Recursos

- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Docs](https://graphql.org/)
- [React Router Docs](https://reactrouter.com/)
- [Vite Docs](https://vitejs.dev/)

---

## 👨‍💻 Autor

Proyecto de ejemplo para demostración de React + Apollo Client + GraphQL

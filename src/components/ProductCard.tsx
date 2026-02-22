interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <p className="description">{product.description}</p>

      <div className="price">
        ${product.price.toFixed(2)}
      </div>

      <div className="form-actions">
        <button
          className="primary-btn"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>

        <button
          className="secondary-btn"
          onClick={() => onDelete(product.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
import { Card, CardContent, Typography, Box, Button } from "@mui/material";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardContent sx={{ display: "grid", gap: 1.2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {product.name}
        </Typography>

        {product.description ? (
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            No description
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            ${product.price.toFixed(2)}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => onEdit(product)}>
              Edit
            </Button>

            <Button variant="outlined" onClick={() => onDelete(product.id)}>
              Delete
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
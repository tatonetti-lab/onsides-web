import { useParams } from '@remix-run/react';
import { Typography, Box } from '@mui/material';

export default function ProductDetail() {
  const { id } = useParams();
    console.log("Product ID param:", id); // This should show up in the browser dev tools

  // Placeholder: fetch product description using rxcui
  // You can replace this with a real fetch or loader logic
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Product Details
      </Typography>
      <Typography variant="subtitle1">
        RxCUI: {id}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {/* TODO: Fetch and display product description for this RxCUI */}
        Product description will go here.
      </Typography>
    </Box>
  );
}

import { useParams } from '@remix-run/react';
import { Typography, Box, Paper } from '@mui/material';
import { BasePage } from '~/utils/BasePage';

const ProductDetailPage = () => {
  const { id } = useParams();

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Product Details
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          RxCUI: {id}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Product details for RxCUI {id} will be displayed here.
        </Typography>
        
        {/* TODO: Add actual product details fetching and display */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            This is a placeholder for the product detail page. 
            You'll need to implement the actual data fetching and display logic.
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default function ProductDetailRoute() {
  return (
    <BasePage pageInner={<ProductDetailPage />} />
  );
}

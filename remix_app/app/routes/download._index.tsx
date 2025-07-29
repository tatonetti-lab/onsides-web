import {
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BasePage } from '~/utils/BasePage';
import { getProducts } from '~/utils/getProducts';
import { useNavigate } from '@remix-run/react';

interface ProductProps {
  products: Array<{
    ProductName: string;
    RxCUI: string;
  }>;
}

const ProductPage = () => {
  const [products, setProducts] = useState<ProductProps['products']>([]);
  const [page, setPage] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [rxcuiFilter, setRxcuiFilter] = useState('');
  const [sort, setSort] = useState<{ column: 'ProductName' | 'RxCUI' | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data.products);
    };
    fetchProducts();
  }, []);

  // Filter logic
  const filteredProducts = products.filter(product => {
    const nameMatch = product.ProductName.toLowerCase().includes(nameFilter.toLowerCase());
    const rxcuiMatch = product.RxCUI.toLowerCase().includes(rxcuiFilter.toLowerCase());
    return nameMatch && rxcuiMatch;
  });

  // Sort logic
  const sortedProducts = (() => {
    if (!sort.column || !sort.direction) return filteredProducts;
    const column = sort.column;
    const sorted = [...filteredProducts].sort((a, b) => {
      const aVal = a[column] || '';
      const bVal = b[column] || '';
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sortedProducts.length / rowsPerPage);

  // Reset to first page if filter or sort changes
  useEffect(() => {
    setPage(0);
  }, [nameFilter, rxcuiFilter, sort]);

  // Sort handler
  const handleSort = (column: 'ProductName' | 'RxCUI') => {
    setSort(prev => {
      if (prev.column !== column) return { column, direction: 'asc' };
      if (prev.direction === 'asc') return { column, direction: 'desc' };
      if (prev.direction === 'desc') return { column: null, direction: null };
      return { column, direction: 'asc' };
    });
  };

  // Arrow helper
  const getSortArrow = (column: 'ProductName' | 'RxCUI') => {
    if (sort.column !== column) return '';
    if (sort.direction === 'asc') return ' ▲';
    if (sort.direction === 'desc') return ' ▼';
    return '';
  };

  return (
    <>
    <Typography variant="h4" component="h1" gutterBottom>
      Downloads
    </Typography>
    <div>
    This analysis is updated regularly. The latest data are available for download in our GitHub releases. For more information about the flat files, see the table descriptions.
    </div>
    <div>
      <Button 
        variant="contained" 
        color="primary" 
        href="https://github.com/tatonetti-lab/onsides/releases/latest" 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222', color: '#fff' } }}
      >
        Download Latest Release
      </Button>
    </div>
    <div>
      <strong>Note</strong>
    </div>
    <div>
      The Onsides database is intended for research purposes only. The extraction process is imperfect, side effects will be missed and some identified will be incorrect. Patients seeking health information should not trust these data and instead refer to the FDA's website (fda.gov) and consult their doctor.
    </div>

The project is under active development. Validation of extracted information is yet to be independently verified and the data, methods, and statistics are subject to change at any time. Check back to this page for updates. If you would like to to contribute to the project or have ideas on how the methods, data, or evaluation can be improved please reach out to Prof. Tatonetti via email or Twitter.
    </>
  )
}

export default function ProductRoute() {
  return (
    <BasePage pageInner={<ProductPage />} />
  );
}
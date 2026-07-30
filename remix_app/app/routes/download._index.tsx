import {
  Typography,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BasePage } from '~/utils/BasePage';
import { getProducts } from '~/utils/getProducts';

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
          href="https://github.com/tatonetti-lab/onsides/releases/tag/v3.1.1"
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

      <div>
        <strong>Citation</strong>
      </div>
      <a href="https://www.sciencedirect.com/science/article/abs/pii/S2666634025000698?via%3Dihub" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        View Publication
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
      <br />
      <code style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', display: 'block', marginTop: '8px' }}>
        Tanaka Y, Chen HY, Belloni P, Gisladottir U, Kefeli J, Patterson J, Srinivasan A, Zietz M, Sirdeshmukh G, Berkowitz J, LaRow Brown K, Tatonetti NP. OnSIDES database: Extracting adverse drug events from drug labels using natural language processing models. Med. 2025 Mar 27:100642. doi: 10.1016/j.medj.2025.100642. PMID: 40179876.
      </code>
    </>
  )
}

export default function ProductRoute() {
  return (
    <BasePage pageInner={<ProductPage />} />
  );
}
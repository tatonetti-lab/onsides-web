import {
  Typography,
  Box,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BasePage } from '~/utils/BasePage';
import { getIngredients } from '~/utils/getIngredients';
import { useNavigate } from '@remix-run/react';

interface IngredientProps {
  ingredients: Array<{
    IngredientName: string;
    RxCUI: string;
  }>;
}

const IngredientPage = () => {
  const [ingredients, setIngredients] = useState<IngredientProps['ingredients']>([]);
  const [page, setPage] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [rxcuiFilter, setRxcuiFilter] = useState('');
  const [sort, setSort] = useState<{ column: 'IngredientName' | 'RxCUI' | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIngredients = async () => {
      const data = await getIngredients();
      setIngredients(data.ingredients);
    };
    fetchIngredients();
  }, []);

  // Filter logic
  const filteredIngredients = ingredients.filter(ingredient => {
    const nameMatch = ingredient.IngredientName.toLowerCase().includes(nameFilter.toLowerCase());
    const rxcuiMatch = ingredient.RxCUI.toLowerCase().includes(rxcuiFilter.toLowerCase());
    return nameMatch && rxcuiMatch;
  });

  // Sort logic
  const sortedIngredients = (() => {
    if (!sort.column || !sort.direction) return filteredIngredients;
    const column = sort.column;
    const sorted = [...filteredIngredients].sort((a, b) => {
      const aVal = a[column] || '';
      const bVal = b[column] || '';
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const paginatedIngredients = sortedIngredients.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sortedIngredients.length / rowsPerPage);

  // Reset to first page if filter or sort changes
  useEffect(() => {
    setPage(0);
  }, [nameFilter, rxcuiFilter, sort]);

  // Sort handler
  const handleSort = (column: 'IngredientName' | 'RxCUI') => {
    setSort(prev => {
      if (prev.column !== column) return { column, direction: 'asc' };
      if (prev.direction === 'asc') return { column, direction: 'desc' };
      if (prev.direction === 'desc') return { column: null, direction: null };
      return { column, direction: 'asc' };
    });
  };

  // Arrow helper
  const getSortArrow = (column: 'IngredientName' | 'RxCUI') => {
    if (sort.column !== column) return '';
    if (sort.direction === 'asc') return ' ▲';
    if (sort.direction === 'desc') return ' ▼';
    return '';
  };

  return (
    <>
    <Typography variant="h4" component="h1" gutterBottom>
      Ingredients
    </Typography>
    {/* Search bar */}
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <Box
        className="flex-1"
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 'none' },
          mb: { xs: 2, sm: 0 },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter by Ingredient Name..."
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          InputProps={{
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              height: 48,
            },
          }}
          size="medium"
        />
      </Box>
      <Box
        className="flex-1"
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 'none' },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter by RxCUI..."
          value={rxcuiFilter}
          onChange={e => setRxcuiFilter(e.target.value)}
          InputProps={{
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              height: 48,
            },
          }}
          size="medium"
        />
      </Box>
    </div>
    {/* Table Section */}
    <Box sx={{ width: '100%' }}>
      <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '85%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
              <th
                style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', cursor: 'pointer', userSelect: 'none', width: '80%' }}
                onClick={() => handleSort('IngredientName')}
              >
                Ingredient Name{getSortArrow('IngredientName')}
              </th>
              <th
                style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', cursor: 'pointer', userSelect: 'none', width: '20%' }}
                onClick={() => handleSort('RxCUI')}
              >
                RxCUI{getSortArrow('RxCUI')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedIngredients.map((ingredient, idx) => (
              <tr
                key={ingredient.RxCUI + idx + page * rowsPerPage}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate(`/ingredient/${ingredient.RxCUI}`)}
                onMouseOver={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseOut={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '12px 16px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{ingredient.IngredientName}</td>
                <td style={{ padding: '12px 16px' }}>{ingredient.RxCUI}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: page === 0 ? '#e0e0e0' : '#f5f5f5',
            color: '#333',
            cursor: page === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            marginRight: 8,
          }}
        >
          Previous
        </button>
        <span style={{ fontWeight: 500 }}>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: page >= totalPages - 1 ? '#e0e0e0' : '#f5f5f5',
            color: '#333',
            cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            marginLeft: 8,
          }}
        >
          Next
        </button>
      </Box>
    </Box>
    </>
  )
}

export default function IngredientRoute() {
  return (
    <BasePage pageInner={<IngredientPage />} />
  );
}
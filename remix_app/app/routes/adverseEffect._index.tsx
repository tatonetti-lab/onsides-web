import {
  Typography,
  Box,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BasePage } from '~/utils/BasePage';
import { getAdverseEffects } from '~/utils/getAdverseEffects';
import { useNavigate } from '@remix-run/react';

interface AdverseEffectProps {
  adverseEffects: Array<{
    AdverseEffectId: string;
    AdverseEffectName: string;
    AdverseEffectTermType: string;
  }>;
}

const AdverseEffectPage = () => {
  const [adverseEffects, setAdverseEffects] = useState<AdverseEffectProps['adverseEffects']>([]);
  const [page, setPage] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [sort, setSort] = useState<{ column: 'AdverseEffectName' | 'AdverseEffectId' | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdverseEffects = async () => {
      const data = await getAdverseEffects();
      console.log('Adverse effects data:', data);
      console.log('First item structure:', data.adverseEffects?.[0]);
      // set AdverseEffectId to a string in each item in the array
      if (data.adverseEffects) {
        data.adverseEffects.forEach(effect => {
          if (typeof effect.AdverseEffectId !== 'string') {
            effect.AdverseEffectId = String(effect.AdverseEffectId);
          }
        });
      }
      setAdverseEffects(data.adverseEffects || []);
    };
    fetchAdverseEffects();
  }, []);

  // Filter logic with defensive checks
  const filteredAdverseEffects = adverseEffects.filter(effect => {
    const name = effect?.AdverseEffectName || '';
    const id = effect?.AdverseEffectId || '';
    const nameMatch = name.toLowerCase().includes(nameFilter.toLowerCase());
    const idMatch = id.toLowerCase().includes(idFilter.toLowerCase());
    return nameMatch && idMatch;
  });

  // Sort logic with defensive checks
  const sortedAdverseEffects = (() => {
    if (!sort.column || !sort.direction) return filteredAdverseEffects;
    const column = sort.column;
    const sorted = [...filteredAdverseEffects].sort((a, b) => {
      const aVal = (a?.[column] || '').toString();
      const bVal = (b?.[column] || '').toString();
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  })();

  const paginatedAdverseEffects = sortedAdverseEffects.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sortedAdverseEffects.length / rowsPerPage);

  // Reset to first page if filter or sort changes
  useEffect(() => {
    setPage(0);
  }, [nameFilter, idFilter, sort]);

  // Sort handler
  const handleSort = (column: 'AdverseEffectName' | 'AdverseEffectId') => {
    setSort(prev => {
      if (prev.column !== column) return { column, direction: 'asc' };
      if (prev.direction === 'asc') return { column, direction: 'desc' };
      if (prev.direction === 'desc') return { column: null, direction: null };
      return { column, direction: 'asc' };
    });
  };

  // Arrow helper
  const getSortArrow = (column: 'AdverseEffectName' | 'AdverseEffectId') => {
    if (sort.column !== column) return '';
    if (sort.direction === 'asc') return ' ▲';
    if (sort.direction === 'desc') return ' ▼';
    return '';
  };

  return (
    <>
    <Typography variant="h4" component="h1" gutterBottom>
      Adverse Effects
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
          placeholder="Filter by Adverse Effect Name..."
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
          placeholder="Filter by MedDRA ID..."
          value={idFilter}
          onChange={e => setIdFilter(e.target.value)}
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
            <col style={{ width: '70%' }} />
            <col style={{ width: '30%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
              <th
                style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', cursor: 'pointer', userSelect: 'none', width: '70%' }}
                onClick={() => handleSort('AdverseEffectName')}
              >
                Adverse Effect Name{getSortArrow('AdverseEffectName')}
              </th>
              <th
                style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', cursor: 'pointer', userSelect: 'none', width: '30%' }}
                onClick={() => handleSort('AdverseEffectId')}
              >
                MedDRA ID{getSortArrow('AdverseEffectId')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAdverseEffects.map((effect, idx) => (
              <tr
                key={`${effect?.AdverseEffectId || idx}-${idx}-${page * rowsPerPage}`}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate(`/adverseEffect/${effect?.AdverseEffectId || ''}`)}
                onMouseOver={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseOut={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '12px 16px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {effect?.AdverseEffectName || 'N/A'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {effect?.AdverseEffectId || 'N/A'}
                </td>
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

export default function AdverseEffectRoute() {
  return (
    <BasePage pageInner={<AdverseEffectPage />} />
  );
}
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { getStats } from '~/utils/getStats';
import { useEffect, useState } from 'react';

export const BasicStats = () => {
  const [stats, setStats] = useState<{
    product_count?: number;
    ingredient_count?: number;
    adverse_effect_count?: number;
    product_adverse_effect_count?: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data.stats);
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.15rem', md: '1.25rem' },
          mb: 0,
        }}
      >
        Basic Statistics
      </Typography>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Table size="medium" aria-label="basic statistics table" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <TableCell sx={{
                px: 2,
                py: 1.5,
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '1rem',
                borderBottom: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}>Drug Products</TableCell>
              <TableCell sx={{
                px: 2,
                py: 1.5,
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '1rem',
                borderBottom: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}>Ingredients</TableCell>
              <TableCell sx={{
                px: 2,
                py: 1.5,
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '1rem',
                borderBottom: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}>Adverse Reactions</TableCell>
              <TableCell sx={{
                px: 2,
                py: 1.5,
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '1rem',
                borderBottom: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}>Drug/Adverse Reactions Pairs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <TableCell sx={{ px: 2, py: 1.5 }}>{stats?.product_count != null ? stats.product_count.toLocaleString() : ''}</TableCell>
              <TableCell sx={{ px: 2, py: 1.5 }}>{stats?.ingredient_count != null ? stats.ingredient_count.toLocaleString() : ''}</TableCell>
              <TableCell sx={{ px: 2, py: 1.5 }}>{stats?.adverse_effect_count != null ? stats.adverse_effect_count.toLocaleString() : ''}</TableCell>
              <TableCell sx={{ px: 2, py: 1.5 }}>{stats?.product_adverse_effect_count != null ? stats.product_adverse_effect_count.toLocaleString() : ''}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

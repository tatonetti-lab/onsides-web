import { useParams, useNavigate } from '@remix-run/react';
import { Typography, Box, Paper, Divider, CircularProgress, Button, IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BasePage } from '~/utils/BasePage';
import { useEffect, useState } from 'react';
import { getProductDetails } from '~/utils/getProductDetails';
import { getProductIngredients } from '~/utils/getProductIngredients';
import { getProductAdverseEffects } from '~/utils/getProductAdverseEffects';
import saveAs from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';

interface AdverseEffect {
    section: string;
    id: number;
    name: string;
    termtype: string;
}

interface Ingredient {
    IngredientName: string;
    RxNormCUI: string;
    TermType: string;
}

interface ProductDetails {
    ProductName: string;
    Source: string;
    SourceProductId: string;
    SourceLabelUrl: string;
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
    const [productIngredients, setProductIngredients] = useState<Ingredient[]>([]);
    const [productAdverseEffects, setProductAdverseEffects] = useState<AdverseEffect[]>([]);
    const [ingredientsPage, setIngredientsPage] = useState(0);
    const [adverseEffectsPage, setAdverseEffectsPage] = useState(0);
    const [ingredientsSort, setIngredientsSort] = useState<{ column: keyof Ingredient | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
    const [adverseEffectsSort, setAdverseEffectsSort] = useState<{ column: keyof AdverseEffect | null; direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
    const [adverseEffectsFilter, setAdverseEffectsFilter] = useState('');
    const rowsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            const data = await getProductDetails(id);
            setProductDetails(data.product[0]);
            const ingredients = await getProductIngredients(id);
            setProductIngredients(ingredients.productIngredients || []);
            const adverseEffects = await getProductAdverseEffects(id);
            setProductAdverseEffects(adverseEffects.productAdverseEffects || []);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    // Sort handlers
    const handleIngredientsSort = (column: keyof Ingredient) => {
        setIngredientsSort(prev => {
            if (prev.column !== column) return { column, direction: 'asc' };
            if (prev.direction === 'asc') return { column, direction: 'desc' };
            if (prev.direction === 'desc') return { column: null, direction: null };
            return { column, direction: 'asc' };
        });
        setIngredientsPage(0); // Reset to first page when sorting
    };

    const handleAdverseEffectsSort = (column: keyof AdverseEffect) => {
        setAdverseEffectsSort(prev => {
            if (prev.column !== column) return { column, direction: 'asc' };
            if (prev.direction === 'asc') return { column, direction: 'desc' };
            if (prev.direction === 'desc') return { column: null, direction: null };
            return { column, direction: 'asc' };
        });
        setAdverseEffectsPage(0); // Reset to first page when sorting
    };

    // Sort arrow helpers
    const getIngredientsSortArrow = (column: keyof Ingredient) => {
        if (ingredientsSort.column !== column) return '';
        if (ingredientsSort.direction === 'asc') return ' ▲';
        if (ingredientsSort.direction === 'desc') return ' ▼';
        return '';
    };

    const getAdverseEffectsSortArrow = (column: keyof AdverseEffect) => {
        if (adverseEffectsSort.column !== column) return '';
        if (adverseEffectsSort.direction === 'asc') return ' ▲';
        if (adverseEffectsSort.direction === 'desc') return ' ▼';
        return '';
    };

    // Sort logic for ingredients
    const sortedIngredients = (() => {
        if (!ingredientsSort.column || !ingredientsSort.direction) return productIngredients;
        const column = ingredientsSort.column;
        const sorted = [...productIngredients].sort((a, b) => {
            const aVal = a[column] || '';
            const bVal = b[column] || '';
            if (aVal < bVal) return ingredientsSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return ingredientsSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    })();

    // Filter adverse effects by text query (matches name, term type, or section)
    const filteredAdverseEffects = (() => {
        const query = adverseEffectsFilter.trim().toLowerCase();
        if (!query) return productAdverseEffects;
        return productAdverseEffects.filter(effect =>
            (effect.name || '').toLowerCase().includes(query) ||
            (effect.termtype || '').toLowerCase().includes(query) ||
            (effect.section || '').toLowerCase().includes(query)
        );
    })();

    // Sort logic for adverse effects
    const sortedAdverseEffects = (() => {
        if (!adverseEffectsSort.column || !adverseEffectsSort.direction) return filteredAdverseEffects;
        const column = adverseEffectsSort.column;
        const sorted = [...filteredAdverseEffects].sort((a, b) => {
            const aVal = a[column] || '';
            const bVal = b[column] || '';
            if (aVal < bVal) return adverseEffectsSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return adverseEffectsSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    })();

    // Pagination calculations
    const paginatedIngredients = sortedIngredients.slice(
        ingredientsPage * rowsPerPage, 
        (ingredientsPage + 1) * rowsPerPage
    );
    const ingredientsTotalPages = Math.ceil(sortedIngredients.length / rowsPerPage);

    const paginatedAdverseEffects = sortedAdverseEffects.slice(
        adverseEffectsPage * rowsPerPage,
        (adverseEffectsPage + 1) * rowsPerPage
    );
    const adverseEffectsTotalPages = Math.ceil(sortedAdverseEffects.length / rowsPerPage);

    // Download handlers
    const handleDownloadIngredients = () => {
        if (!sortedIngredients.length) return;
        
        const csvLines: string[] = [];
        
        // Header row
        const header = 'Name,RxNorm CUI,Term Type';
        csvLines.push(header);
        
        // Data rows
        sortedIngredients.forEach(ingredient => {
            const name = ingredient.IngredientName ? `"${ingredient.IngredientName.replace(/"/g, '""')}"` : '';
            const rxNormCUI = ingredient.RxNormCUI || '';
            const termType = ingredient.TermType || '';
            
            csvLines.push(`${name},${rxNormCUI},${termType}`);
        });
        
        const csv = csvLines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `product-${id}-ingredients.csv`);
    };
    
    const handleDownloadAdverseEffects = () => {
        if (!sortedAdverseEffects.length) return;
        
        const csvLines: string[] = [];
        
        // Header row
        const header = 'ID,Name,Term Type,Section';
        csvLines.push(header);
        
        // Data rows
        sortedAdverseEffects.forEach(effect => {
            const id = effect.id || '';
            const name = effect.name ? `"${effect.name.replace(/"/g, '""')}"` : '';
            const termType = effect.termtype || '';
            const section = effect.section || 'N/A';
            
            csvLines.push(`${id},${name},${termType},${section}`);
        });
        
        const csv = csvLines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `product-${id}-adverse-effects.csv`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Preparing product details...</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                </Box>
            </Box>
        );
    }

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom>
                Product Details
            </Typography>

            <Box>
                <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, background: '#fafcff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'black' }}>
                        {productDetails?.ProductName || 'Product'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: 120, color: '#555' }}><strong>RxCUI:</strong></Typography>
                        <Typography variant="body1" sx={{ color: '#222', fontWeight: 500 }}>{id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: 120, color: '#555' }}><strong>Label Source:</strong></Typography>
                        <Typography variant="body1" sx={{ color: '#222', fontWeight: 500 }}>{productDetails?.Source || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: 120, color: '#555' }}><strong>Source ID:</strong></Typography>
                        <Typography variant="body1" sx={{ color: '#222', fontWeight: 500 }}>{productDetails?.SourceProductId || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ minWidth: 120, color: '#555' }}><strong>Label URL:</strong></Typography>
                        {productDetails?.SourceLabelUrl ? (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                href={productDetails.SourceLabelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 4 }}><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14L21 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3V3h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                sx={{ textTransform: 'none', fontWeight: 500, backgroundColor: 'black' }}
                            >
                                View Label
                            </Button>
                        ) : (
                            <Typography variant="body1" sx={{ color: '#888' }}>N/A</Typography>
                        )}
                    </Box>
                </Paper>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6">Ingredients</Typography>
                    {productIngredients.length > 0 && (
                        <Tooltip title="Download ingredients as CSV">
                            <DownloadIcon onClick={handleDownloadIngredients} color="primary" size="large" />
                        </Tooltip>
                    )}
                </Box>

                {productIngredients.length > 0 ? (
                    <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%', mt: 2 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '50%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleIngredientsSort('IngredientName')}
                                    >
                                        Name{getIngredientsSortArrow('IngredientName')}
                                    </th>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '25%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleIngredientsSort('RxNormCUI')}
                                    >
                                        RxNorm CUI{getIngredientsSortArrow('RxNormCUI')}
                                    </th>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '25%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleIngredientsSort('TermType')}
                                    >
                                        Term Type{getIngredientsSortArrow('TermType')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedIngredients.map((ingredient, idx) => (
                                    <tr
                                        key={ingredient.RxNormCUI + idx}
                                        style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onClick={() => navigate(`/ingredient/${ingredient.RxNormCUI}`)}
                                        onMouseOver={e => (e.currentTarget.style.background = '#f5f5f5')}
                                        onMouseOut={e => (e.currentTarget.style.background = '')}
                                    >
                                        <td style={{ padding: '12px 16px', wordBreak: 'break-word' }}>{ingredient.IngredientName}</td>
                                        <td style={{ padding: '12px 16px' }}>{ingredient.RxNormCUI}</td>
                                        <td style={{ padding: '12px 16px' }}>{ingredient.TermType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No ingredients available.
                    </Typography>
                )}

                {/* Ingredients Pagination Controls */}
                {sortedIngredients.length > rowsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                        <button
                            onClick={() => setIngredientsPage(p => Math.max(0, p - 1))}
                            disabled={ingredientsPage === 0}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                background: ingredientsPage === 0 ? '#e0e0e0' : '#f5f5f5',
                                color: '#333',
                                cursor: ingredientsPage === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                marginRight: 8,
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ fontWeight: 500 }}>
                            Page {ingredientsTotalPages === 0 ? 0 : ingredientsPage + 1} of {ingredientsTotalPages || 1}
                        </span>
                        <button
                            onClick={() => setIngredientsPage(p => Math.min(ingredientsTotalPages - 1, p + 1))}
                            disabled={ingredientsPage >= ingredientsTotalPages - 1}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                background: ingredientsPage >= ingredientsTotalPages - 1 ? '#e0e0e0' : '#f5f5f5',
                                color: '#333',
                                cursor: ingredientsPage >= ingredientsTotalPages - 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                marginLeft: 8,
                            }}
                        >
                            Next
                        </button>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6">Adverse Effects</Typography>
                    {productAdverseEffects.length > 0 && (
                        <Tooltip title="Download adverse effects as CSV">
                            <DownloadIcon onClick={handleDownloadAdverseEffects} color="primary" size="large" />
                        </Tooltip>
                    )}
                </Box>

                {productAdverseEffects.length > 0 && (
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Filter adverse effects by name, term type, or section..."
                        value={adverseEffectsFilter}
                        onChange={e => { setAdverseEffectsFilter(e.target.value); setAdverseEffectsPage(0); }}
                        sx={{ mt: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}

                {sortedAdverseEffects.length > 0 ? (
                    <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%', mt: 2 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                    <th
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '15%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleAdverseEffectsSort('id')}
                                    >
                                        ID{getAdverseEffectsSortArrow('id')}
                                    </th>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '40%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleAdverseEffectsSort('name')}
                                    >
                                        Name{getAdverseEffectsSortArrow('name')}
                                    </th>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '20%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleAdverseEffectsSort('termtype')}
                                    >
                                        Term Type{getAdverseEffectsSortArrow('termtype')}
                                    </th>
                                    <th 
                                        style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575', width: '25%', cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleAdverseEffectsSort('section')}
                                    >
                                        Section{getAdverseEffectsSortArrow('section')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAdverseEffects.map((effect, idx) => (
                                    <tr
                                        key={effect.id + idx}
                                        style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onClick={() => navigate(`/adverseEffect/${effect.id}`)}
                                        onMouseOver={e => (e.currentTarget.style.background = '#f5f5f5')}
                                        onMouseOut={e => (e.currentTarget.style.background = '')}
                                    >
                                        <td style={{ padding: '12px 16px' }}>{effect.id}</td>
                                        <td style={{ padding: '12px 16px', wordBreak: 'break-word' }}>{effect.name}</td>
                                        <td style={{ padding: '12px 16px' }}>{effect.termtype}</td>
                                        <td style={{ padding: '12px 16px' }}>{effect.section || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {productAdverseEffects.length > 0
                            ? 'No adverse effects match your filter.'
                            : 'No adverse effects available.'}
                    </Typography>
                )}

                {/* Adverse Effects Pagination Controls */}
                {sortedAdverseEffects.length > rowsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                        <button
                            onClick={() => setAdverseEffectsPage(p => Math.max(0, p - 1))}
                            disabled={adverseEffectsPage === 0}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                background: adverseEffectsPage === 0 ? '#e0e0e0' : '#f5f5f5',
                                color: '#333',
                                cursor: adverseEffectsPage === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                marginRight: 8,
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ fontWeight: 500 }}>
                            Page {adverseEffectsTotalPages === 0 ? 0 : adverseEffectsPage + 1} of {adverseEffectsTotalPages || 1}
                        </span>
                        <button
                            onClick={() => setAdverseEffectsPage(p => Math.min(adverseEffectsTotalPages - 1, p + 1))}
                            disabled={adverseEffectsPage >= adverseEffectsTotalPages - 1}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: 'none',
                                background: adverseEffectsPage >= adverseEffectsTotalPages - 1 ? '#e0e0e0' : '#f5f5f5',
                                color: '#333',
                                cursor: adverseEffectsPage >= adverseEffectsTotalPages - 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                marginLeft: 8,
                            }}
                        >
                            Next
                        </button>
                    </Box>
                )}
            </Box>
        </>
    );
};

export default function ProductDetailRoute() {
    return (
        <BasePage pageInner={<ProductDetailPage />} />
    );
}

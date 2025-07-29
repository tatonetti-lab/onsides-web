import { useParams, useNavigate } from '@remix-run/react';
import { Typography, Box, Paper, Divider } from '@mui/material';
import { BasePage } from '~/utils/BasePage';
import { useEffect, useState } from 'react';
import { getProductDetails } from '~/utils/getProductDetails';
import { getProductIngredients } from '~/utils/getProductIngredients';
import { getProductAdverseEffects } from '~/utils/getProductAdverseEffects';

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
    const rowsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            
            const data = await getProductDetails(id);
            setProductDetails(data.product[0]);

            const ingredients = await getProductIngredients(id);
            console.log(ingredients);
            setProductIngredients(ingredients.productIngredients || []);
            const adverseEffects = await getProductAdverseEffects(id);
            setProductAdverseEffects(adverseEffects.productAdverseEffects || []);
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

    // Sort logic for adverse effects
    const sortedAdverseEffects = (() => {
        if (!adverseEffectsSort.column || !adverseEffectsSort.direction) return productAdverseEffects;
        const column = adverseEffectsSort.column;
        const sorted = [...productAdverseEffects].sort((a, b) => {
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

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom>
                Product Details
            </Typography>

            <Box>

                <Typography variant="h6" gutterBottom>
                    {productDetails?.ProductName}
                </Typography>

                <Typography variant="h6" gutterBottom>
                    RxCUI: {id}
                </Typography>



                <Typography variant="h6" gutterBottom>
                    Label source: {productDetails?.Source || 'N/A'}
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Label source ID: {productDetails?.SourceProductId || 'N/A'}
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Label URL: {productDetails?.SourceLabelUrl || 'N/A'}
                </Typography>

                <Divider />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Ingredients
                </Typography>

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

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Adverse Effects
                </Typography>
                
                {productAdverseEffects.length > 0 ? (
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
                        No adverse effects available.
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

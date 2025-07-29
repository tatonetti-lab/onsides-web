import { useParams, useNavigate } from '@remix-run/react';
import { Typography, Box, Button, IconButton, Tooltip, TextField, Divider } from '@mui/material';
import { BasePage } from '~/utils/BasePage';
import { useEffect, useState } from 'react';
import { getAdverseEffectIngredients } from '~/utils/getAdverseEffectIngredients';
import { getAdverseEffect } from '~/utils/getAdverseEffect';

interface AdverseEffectDetails {
    AdverseEffectName: string;
    [key: string]: any;
}
interface IngredientRow {
    ingredient_id: string;
    ingredient_name: string;
    source: string;
    label_section: string;
}
interface ProductRow {
    product_id: string;
    product_name: string;
    source: string;
    label_section: string;
}

const SectionMapping: Record<string, string> = {
    'AR': 'Adverse Reactions',
    'WP': 'Warnings and Precautions',
    'BW': 'Boxed Warning',
}

const rowsPerPage = 10;

const AdverseEffectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [adverseEffectDetails, setAdverseEffectDetails] = useState<AdverseEffectDetails | null>(null);
    const [adverseEffectIngredients, setAdverseEffectIngredients] = useState<(IngredientRow & ProductRow)[]>([]);
    const [viewType, setViewType] = useState<'ingredients' | 'products'>('ingredients');
    const [sources, setSources] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [selectedSource, setSelectedSource] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All');
    const [ingredientsPage, setIngredientsPage] = useState(0);
    const [productsPage, setProductsPage] = useState(0);
    const [ingredientNameFilter, setIngredientNameFilter] = useState('');
    const [ingredientIdFilter, setIngredientIdFilter] = useState('');
    const [productNameFilter, setProductNameFilter] = useState('');
    const [productIdFilter, setProductIdFilter] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const data = await getAdverseEffect(id);
            setAdverseEffectDetails(data.adverseEffect[0] as AdverseEffectDetails);
            const ingredients = await getAdverseEffectIngredients(id);
            setAdverseEffectIngredients(ingredients.adverseEffects || []);
            const sources = (ingredients.adverseEffects || []).map((effect: IngredientRow & ProductRow) => effect.source).filter(Boolean);
            setSources(['All', ...Array.from(new Set(sources)) as string[]]);
            const sections = (ingredients.adverseEffects || []).map((effect: IngredientRow & ProductRow) => effect.label_section).filter(Boolean);
            setSections(['All', ...Array.from(new Set(sections)).filter(section => section !== 'NA') as string[]]);
        };
        fetchData();
    }, [id]);

    // Deduplicate ingredients and products by their IDs
    const uniqueIngredientsMap = new Map<string, IngredientRow>();
    adverseEffectIngredients.forEach(effect => {
        if (effect.ingredient_id && !uniqueIngredientsMap.has(effect.ingredient_id)) {
            uniqueIngredientsMap.set(effect.ingredient_id, effect);
        }
    });
    const uniqueIngredients = Array.from(uniqueIngredientsMap.values());

    const uniqueProductsMap = new Map<string, ProductRow>();
    adverseEffectIngredients.forEach(effect => {
        if (effect.product_id && !uniqueProductsMap.has(effect.product_id)) {
            uniqueProductsMap.set(effect.product_id, effect);
        }
    });
    const uniqueProducts = Array.from(uniqueProductsMap.values());

    // Filter logic
    const filteredIngredients = uniqueIngredients.filter(effect => {
        if (viewType !== 'ingredients') return false;
        if (selectedSource !== 'All' && effect.source !== selectedSource) return false;
        if (selectedSection !== 'All' && effect.label_section !== selectedSection) return false;
        if (ingredientNameFilter && !effect.ingredient_name?.toLowerCase().includes(ingredientNameFilter.toLowerCase())) return false;
        if (ingredientIdFilter && !effect.ingredient_id?.toString().includes(ingredientIdFilter)) return false;
        return true;
    });
    const filteredProducts = uniqueProducts.filter(effect => {
        if (viewType !== 'products' ) return false;
        if (selectedSource !== 'All' && effect.source !== selectedSource) return false;
        if (selectedSection !== 'All' && effect.label_section !== selectedSection) return false;
        if (productNameFilter && !effect.product_name?.toLowerCase().includes(productNameFilter.toLowerCase())) return false;
        if (productIdFilter && !effect.product_id?.toString().includes(productIdFilter)) return false;
        return true;
    });

    // Pagination
    const paginatedIngredients = filteredIngredients.slice(
        ingredientsPage * rowsPerPage,
        (ingredientsPage + 1) * rowsPerPage
    );
    const ingredientsTotalPages = Math.ceil(filteredIngredients.length / rowsPerPage);
    const paginatedProducts = filteredProducts.slice(
        productsPage * rowsPerPage,
        (productsPage + 1) * rowsPerPage
    );
    const productsTotalPages = Math.ceil(filteredProducts.length / rowsPerPage);

    // Reset page on filter change
    useEffect(() => { setIngredientsPage(0); }, [selectedSource, selectedSection, ingredientNameFilter, ingredientIdFilter]);
    useEffect(() => { setProductsPage(0); }, [selectedSource, selectedSection, productNameFilter, productIdFilter]);

    return (
        <>
            <Typography variant="h4" component="h1" gutterBottom>
                {adverseEffectDetails?.AdverseEffectName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                    variant={viewType === 'ingredients' ? 'contained' : 'outlined'}
                    onClick={() => setViewType('ingredients')}
                    sx={viewType === 'ingredients' ? { backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222' } } : {}}
                >Ingredients</Button>
                <Button
                    variant={viewType === 'products' ? 'contained' : 'outlined'}
                    onClick={() => setViewType('products')}
                    sx={viewType === 'products' ? { backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222' } } : {}}
                >Products</Button>
            </Box>
            {/* Source Filter Buttons */}
            <Typography variant="h5" >Source</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sources.map(source => (
                    <Button
                        key={source}
                        variant={selectedSource === source ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSource(source)}
                        size="small"
                        sx={selectedSource === source ? { backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222' } } : {}}
                    >
                        {source}
                    </Button>
                ))}
            </Box>
            {/* Section Filter Buttons */}
            <Typography variant="h5" >Label Sections</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sections.map(section => (
                    <Button
                        key={section}
                        variant={selectedSection === section ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSection(section)}
                        size="small"
                        sx={selectedSection === section ? { backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#222' } } : {}}
                    >
                        {SectionMapping[section] || section}
                    </Button>
                ))}
            </Box>
            <Divider />
            {/* Text Filters - always shown above the table, depending on viewType */}
            <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 2 }}>
                {viewType === 'ingredients' ? (
                    <>
                        <TextField
                            label="Filter by Ingredient Name..."
                            value={ingredientNameFilter}
                            onChange={e => setIngredientNameFilter(e.target.value)}
                            size="small"
                            sx={{ flexBasis: '70%', flexGrow: 1 }}
                        />
                        <TextField
                            label="Filter by Ingredient ID..."
                            value={ingredientIdFilter}
                            onChange={e => setIngredientIdFilter(e.target.value)}
                            size="small"
                            sx={{ flexBasis: '30%' }}
                        />
                    </>
                ) : (
                    <>
                        <TextField
                            label="Filter by Product Name..."
                            value={productNameFilter}
                            onChange={e => setProductNameFilter(e.target.value)}
                            size="small"
                            sx={{ flexBasis: '70%', flexGrow: 1 }}
                        />
                        <TextField
                            label="Filter by Product ID..."
                            value={productIdFilter}
                            onChange={e => setProductIdFilter(e.target.value)}
                            size="small"
                            sx={{ flexBasis: '30%' }}
                        />
                    </>
                )}
            </Box>
            
            {/* </Box> */}

            {viewType === 'ingredients' ? (
                <>
                    <Typography variant="h6" gutterBottom>Ingredients</Typography>
                    {filteredIngredients.length > 0 ? (
                        <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%', mt: 2 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Source</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Section</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedIngredients.map((ingredient, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                            <td style={{ padding: '12px 16px', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/ingredient/${ingredient.ingredient_id}`)}>{ingredient.ingredient_name}</td>
                                            <td style={{ padding: '12px 16px' }}>{ingredient.ingredient_id}</td>
                                            <td style={{ padding: '12px 16px' }}>{ingredient.source}</td>
                                            <td style={{ padding: '12px 16px' }}>{ingredient.label_section}</td>
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
                    {/* Pagination Controls */}
                    {filteredIngredients.length > rowsPerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                            <button onClick={() => setIngredientsPage(p => Math.max(0, p - 1))} disabled={ingredientsPage === 0} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: ingredientsPage === 0 ? '#e0e0e0' : '#f5f5f5', color: '#333', cursor: ingredientsPage === 0 ? 'not-allowed' : 'pointer', fontWeight: 500, marginRight: 8 }}>Previous</button>
                            <span style={{ fontWeight: 500 }}>Page {ingredientsTotalPages === 0 ? 0 : ingredientsPage + 1} of {ingredientsTotalPages || 1}</span>
                            <button onClick={() => setIngredientsPage(p => Math.min(ingredientsTotalPages - 1, p + 1))} disabled={ingredientsPage >= ingredientsTotalPages - 1} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: ingredientsPage >= ingredientsTotalPages - 1 ? '#e0e0e0' : '#f5f5f5', color: '#333', cursor: ingredientsPage >= ingredientsTotalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 500, marginLeft: 8 }}>Next</button>
                        </Box>
                    )}
                </>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>Products</Typography>
                    {filteredProducts.length > 0 ? (
                        <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%', mt: 2 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Source</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#757575' }}>Section</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProducts.map((product, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                            <td style={{ padding: '12px 16px', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/product/${product.product_id}`)}>{product.product_name}</td>
                                            <td style={{ padding: '12px 16px' }}>{product.product_id}</td>
                                            <td style={{ padding: '12px 16px' }}>{product.source}</td>
                                            <td style={{ padding: '12px 16px' }}>{product.label_section}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No products available.
                        </Typography>
                    )}
                    {/* Pagination Controls */}
                    {filteredProducts.length > rowsPerPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                            <button onClick={() => setProductsPage(p => Math.max(0, p - 1))} disabled={productsPage === 0} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: productsPage === 0 ? '#e0e0e0' : '#f5f5f5', color: '#333', cursor: productsPage === 0 ? 'not-allowed' : 'pointer', fontWeight: 500, marginRight: 8 }}>Previous</button>
                            <span style={{ fontWeight: 500 }}>Page {productsTotalPages === 0 ? 0 : productsPage + 1} of {productsTotalPages || 1}</span>
                            <button onClick={() => setProductsPage(p => Math.min(productsTotalPages - 1, p + 1))} disabled={productsPage >= productsTotalPages - 1} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: productsPage >= productsTotalPages - 1 ? '#e0e0e0' : '#f5f5f5', color: '#333', cursor: productsPage >= productsTotalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 500, marginLeft: 8 }}>Next</button>
                        </Box>
                    )}
                </>
            )}
        </>
    );
};

export default function AdverseEffectDetailRoute() {
    return (
        <BasePage pageInner={<AdverseEffectDetailPage />} />
    );
}

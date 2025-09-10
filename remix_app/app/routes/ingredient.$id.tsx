import { useParams } from '@remix-run/react';
import { Typography, Box, Paper, Divider, CircularProgress } from '@mui/material';
import { BasePage } from '~/utils/BasePage';
import { useEffect, useState, useMemo } from 'react';
import { getIngredientAdverseEffects } from '~/utils/getIngredientAdverseEffects';
import { getIngredientDetails } from '~/utils/getIngredientDetails';
import saveAs  from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

interface IngredientDetails {
  rxnorm_product_id: string;
  label_id: number;
  source: string;
  source_product_name: string;
  source_product_id: string;
  source_label_url: string;
  label_section: string;
  meddra_name: string;
}

const SectionMapping: Record<string, string> = {
    'AR': 'Adverse Reactions',
    'WP': 'Warnings and Precautions',
    'BW': 'Boxed Warning',
}

const IngredientDetailPage = () => {
    const { id } = useParams();
    const [ingredient, setIngredient] = useState<{ IngredientName?: string } | null>(null);
    const [ingredientDetails, setIngredientDetails] = useState<IngredientDetails[]>([]);
    const [sources, setSources] = useState<string[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>('All');
    const [labelSections, setLabelSections] = useState<string[]>([]);
    const [selectedLabelSection, setSelectedLabelSection] = useState<string>('All');
    const [sourceLabelSections, setSourceLabelSections] = useState<string[]>([]);
    const [adverseEffects, setAdverseEffects] = useState<string[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [matrixPage, setMatrixPage] = useState(0);
    const matrixRowsPerPage = 20;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
            if (!id) return;
            
            const ingredient = await getIngredientDetails(id);
            setIngredient(ingredient.ingredient[0] || null);

            const data = await getIngredientAdverseEffects(id);
            setIngredientDetails(data.ingredient);
            const sources: string[] = [];
            for (const ingredient of data.ingredient as IngredientDetails[]) {
                sources.push(ingredient.source);
            }
            const uniqueSources = [...new Set(sources)];
            const sortedSources = uniqueSources.sort((a: string, b: string) => a.localeCompare(b));
            setSources(sortedSources);

            const sections = (data.ingredient as IngredientDetails[]).map((ingredient) => ingredient.label_section);
            const uniqueSections = [...new Set(sections)];
            const sortedSections = uniqueSections.sort((a: string, b: string) => a.localeCompare(b));
            // Remove "NA" from sections
            setLabelSections(sortedSections.filter((section: string) => section !== 'NA'));

            setAdverseEffects((data.ingredient as IngredientDetails[]).map((ingredient) => ingredient.meddra_name));
            setLabels((data.ingredient as IngredientDetails[]).map((ingredient) => ingredient.label_section));
            setLoading(false); // End loading after all data is set
        };
        fetchData();
    }, [id]);

    // Filter ingredient details based on selected source
    const filteredIngredientDetails = useMemo(() => {
        return selectedSource === 'All' 
            ? ingredientDetails 
            : ingredientDetails.filter(ingredient => ingredient.source === selectedSource);
    }, [selectedSource, ingredientDetails]);

    useEffect(() => {
        const sections = filteredIngredientDetails.map(ingredient => ingredient.label_section);
        const uniqueSections = [...new Set(sections)];
        const sortedSections = uniqueSections.sort((a, b) => a.localeCompare(b));
        setSourceLabelSections(sortedSections.filter(section => section !== 'NA'));
        // Reset label section selection when source changes
        console.log('sortedSections', sortedSections);
        if (sortedSections.length === 1 || !sortedSections.includes(selectedLabelSection)) {
            setSelectedLabelSection('All');
        }
        // Reset matrix page when source changes
        setMatrixPage(0);
    }, [selectedSource, filteredIngredientDetails]);

    // Filter by both source and label section
    const finalFilteredDetails = selectedLabelSection === 'All' 
        ? filteredIngredientDetails
        : filteredIngredientDetails.filter(ingredient => ingredient.label_section === selectedLabelSection);

    // Create matrix data
    const createMatrix = () => {
        // Get unique adverse effects and labels
        const uniqueAdverseEffects = [...new Set(finalFilteredDetails.map(item => item.meddra_name))].sort();
        const uniqueLabels = [...new Set(finalFilteredDetails.map(item => item.label_id))];
        
        // Sort labels by number of effects (most to least)
        const labelEffectCounts = uniqueLabels.map(labelId => {
            const effectCount = finalFilteredDetails.filter(item => item.label_id === labelId).length;
            const labelInfo = finalFilteredDetails.find(item => item.label_id === labelId);
            return {
                labelId,
                effectCount,
                url: labelInfo?.source_label_url || '',
                productName: labelInfo?.source_product_name || ''
            };
        }).sort((a, b) => b.effectCount - a.effectCount);

        // Create matrix
        const matrix = uniqueAdverseEffects.map(effect => {
            const row = { effect, percentage: 0, labels: {} as Record<number, boolean> };
            
            let labelsWithEffect = 0;
            labelEffectCounts.forEach(({ labelId }) => {
                const hasEffect = finalFilteredDetails.some(item => 
                    item.meddra_name === effect && item.label_id === labelId
                );
                row.labels[labelId] = hasEffect;
                if (hasEffect) labelsWithEffect++;
            });
            
            row.percentage = uniqueLabels.length > 0 ? 
                Math.round((labelsWithEffect / uniqueLabels.length) * 100) : 0;
            
            return row;
        }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

        return { matrix, labelEffectCounts };
    };

    const { matrix, labelEffectCounts } = createMatrix();

    // Pagination for matrix
    const paginatedMatrix = matrix.slice(matrixPage * matrixRowsPerPage, (matrixPage + 1) * matrixRowsPerPage);
    const matrixTotalPages = Math.ceil(matrix.length / matrixRowsPerPage);

    // Reset matrix page when filters change
    useEffect(() => {
        setMatrixPage(0);
    }, [selectedLabelSection]);


    // Show loading spinner until matrix is ready
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Preparing ingredient details...</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                </Box>
            </Box>
        );
    }

    // Download matrix as CSV (all filtered rows, not just paginated)
    const handleDownloadMatrix = () => {
        // Use the full matrix, not just paginatedMatrix
        if (!matrix.length) return;
        let csv = 'Adverse Effect,Percentage';
        labelEffectCounts.forEach((label) => {
            // Use productName if available, else labelId
            let colName = label.productName ? label.productName.replace(/"/g, '""') : label.labelId;
            csv += `,"${colName}"`;
        });
        csv += '\n';
        matrix.forEach(row => {
            let line = `"${row.effect.replace(/"/g, '""')}",${row.percentage}`;
            labelEffectCounts.forEach(label => {
                line += ',' + (row.labels[label.labelId] ? 'Yes' : '');
            });
            csv += line + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'ingredient-matrix.csv');
    };

    return (
        <>
            <Typography variant='h4' component="h1" gutterBottom>
                {ingredient?.IngredientName || 'Ingredient Details'}
            </Typography>

            <Typography variant="h6" gutterBottom>
                Source
            </Typography>

            {/* Source Filter Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1}}>
                <button
                    onClick={() => setSelectedSource('All')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: selectedSource === 'All' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        background: selectedSource === 'All' ? '#1976d2' : '#fff',
                        color: selectedSource === 'All' ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s',
                    }}
                >
                    All
                </button>
                {sources.map((source) => {
                    return (
                        <button
                            key={source}
                            onClick={() => setSelectedSource(source)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: selectedSource === source ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                background: selectedSource === source ? '#1976d2' : '#fff',
                                color: selectedSource === source ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '14px',
                                transition: 'all 0.2s',
                            }}
                        >
                            {source}
                        </button>
                    );
                })}
            </Box>

            <Typography variant="h6" gutterBottom>
                Label Section
            </Typography>

            {/* Label Section Filter Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1}}>
                <button
                    onClick={() => setSelectedLabelSection('All')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: selectedLabelSection === 'All' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        background: selectedLabelSection === 'All' ? '#1976d2' : '#fff',
                        color: selectedLabelSection === 'All' ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s',
                    }}
                >
                    All
                </button>
                {sourceLabelSections.map((section) => {
                    return (
                        <button
                            key={section}
                            onClick={() => setSelectedLabelSection(section)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: selectedLabelSection === section ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                background: selectedLabelSection === section ? '#1976d2' : '#fff',
                                color: selectedLabelSection === section ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '14px',
                                transition: 'all 0.2s',
                            }}
                        >
                            {SectionMapping[section] || section}
                        </button>
                    );
                })}
            </Box>

            {/* Download Matrix Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
                <Tooltip title="Download matrix as CSV">
                    <IconButton onClick={handleDownloadMatrix} color="primary" size="large">
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Matrix Table */}
            {finalFilteredDetails.length > 0 ? (
                <Box sx={{ overflowX: 'auto', borderRadius: 2, boxShadow: 1, width: '100%'}}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e0e0e0', background: '#fafafa' }}>
                                <th style={{ 
                                    textAlign: 'left', 
                                    padding: '12px 16px', 
                                    fontWeight: 600, 
                                    color: '#757575',
                                    position: 'sticky',
                                    left: 0,
                                    background: '#fafafa',
                                    zIndex: 10,
                                    minWidth: '200px'
                                }}>
                                    Adverse Effect
                                </th>
                                <th style={{ 
                                    textAlign: 'center', 
                                    padding: '12px 16px', 
                                    fontWeight: 600, 
                                    color: '#757575',
                                    width: '80px',
                                    position: 'sticky',
                                    left: '200px',
                                    background: '#fafafa',
                                    zIndex: 10
                                }}>
                                    %
                                </th>
                                {labelEffectCounts.map((labelInfo, index) => (
                                    <th 
                                        key={labelInfo.labelId}
                                        style={{ 
                                            textAlign: 'center', 
                                            padding: '12px 8px', 
                                            fontWeight: 600, 
                                            color: '#1976d2',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            width: '60px',
                                            borderLeft: '1px solid #e0e0e0'
                                        }}
                                        onClick={() => window.open(labelInfo.url, '_blank')}
                                        title={`${labelInfo.productName} (${labelInfo.effectCount} effects)`}
                                    >
                                        {index + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMatrix.map((row, rowIndex) => (
                                <tr
                                    key={row.effect}
                                    style={{
                                        borderBottom: '1px solid #e0e0e0',
                                        backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                                    }}
                                >
                                    <td style={{ 
                                        padding: '12px 16px', 
                                        wordBreak: 'break-word',
                                        position: 'sticky',
                                        left: 0,
                                        background: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                                        zIndex: 5,
                                        borderRight: '1px solid #e0e0e0'
                                    }}>
                                        {row.effect}
                                    </td>
                                    <td style={{ 
                                        padding: '12px 16px', 
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        color: row.percentage > 75 ? '#2e7d32' : row.percentage > 50 ? '#f57f17' : row.percentage > 25 ? '#ed6c02' : '#d32f2f',
                                        position: 'sticky',
                                        left: '200px',
                                        background: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                                        zIndex: 5,
                                        borderRight: '1px solid #e0e0e0'
                                    }}>
                                        {row.percentage}%
                                    </td>
                                    {labelEffectCounts.map((labelInfo) => (
                                        <td 
                                            key={labelInfo.labelId}
                                            style={{ 
                                                padding: '12px 8px', 
                                                textAlign: 'center',
                                                borderLeft: '1px solid #e0e0e0'
                                            }}
                                        >
                                            {row.labels[labelInfo.labelId] ? (
                                                <span style={{ color: '#2e7d32', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
                                            ) : (
                                                <span style={{ color: '#ccc', fontSize: '18px' }}>○</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No data available for the selected filters.
                </Typography>
            )}

            {/* Matrix Pagination Controls */}
            {matrix.length > matrixRowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    <button
                        onClick={() => setMatrixPage(p => Math.max(0, p - 1))}
                        disabled={matrixPage === 0}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: matrixPage === 0 ? '#e0e0e0' : '#f5f5f5',
                            color: '#333',
                            cursor: matrixPage === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            marginRight: 8,
                        }}
                    >
                        Previous
                    </button>
                    <span style={{ fontWeight: 500 }}>
                        Page {matrixTotalPages === 0 ? 0 : matrixPage + 1} of {matrixTotalPages || 1}
                    </span>
                    <span style={{ color: '#757575', fontSize: '14px', marginLeft: 8 }}>
                        ({matrix.length} total adverse effects)
                    </span>
                    <button
                        onClick={() => setMatrixPage(p => Math.min(matrixTotalPages - 1, p + 1))}
                        disabled={matrixPage >= matrixTotalPages - 1}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: matrixPage >= matrixTotalPages - 1 ? '#e0e0e0' : '#f5f5f5',
                            color: '#333',
                            cursor: matrixPage >= matrixTotalPages - 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            marginLeft: 8,
                        }}
                    >
                        Next
                    </button>
                </Box>
            )}

            {/* Legend */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                    <strong>Legend:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                    • <span style={{ color: '#2e7d32', fontSize: '16px', fontWeight: 'bold' }}>✓</span> = Adverse effect present in this label
                </Typography>
                <Typography variant="body2" component="div">
                    • <span style={{ color: '#ccc', fontSize: '16px' }}>○</span> = Adverse effect not present in this label
                </Typography>
                <Typography variant="body2" component="div">
                    • Column numbers (1, 2, 3...) are clickable and link to the label URL
                </Typography>
                <Typography variant="body2" component="div">
                    • Labels are ordered by number of adverse effects (most to least)
                </Typography>
            </Box>
        </>
    );
};

export default function IngredientDetailRoute() {
    return (
        <BasePage pageInner={<IngredientDetailPage />} />
    );
}

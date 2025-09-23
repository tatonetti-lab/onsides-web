import { useParams, useNavigate } from '@remix-run/react';
import { Typography, Box, Paper, Divider, CircularProgress } from '@mui/material';
import { BasePage } from '~/utils/BasePage';
import { useEffect, useState, useMemo } from 'react';
import { getIngredientComplete } from '~/utils/getIngredientComplete';
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
  meddra_id: string;
}

const SectionMapping: Record<string, string> = {
    'AR': 'Adverse Reactions',
    'WP': 'Warnings and Precautions',
    'BW': 'Boxed Warning',
}

const IngredientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            if (!id) return;
            
            try {
                // Use the new optimized API that combines both calls
                const data = await getIngredientComplete(id);
                
                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch ingredient data');
                }
                
                // Set ingredient details
                setIngredient(data.ingredient[0] || null);
                
                // Set adverse effects data
                setIngredientDetails(data.adverseEffects);
                
                // Process sources more efficiently
                const sourcesSet = new Set<string>();
                const sectionsSet = new Set<string>();
                const adverseEffectsArray: string[] = [];
                const labelsArray: string[] = [];
                
                for (const item of data.adverseEffects as IngredientDetails[]) {
                    sourcesSet.add(item.source);
                    if (item.label_section !== 'NA') {
                        sectionsSet.add(item.label_section);
                    }
                    adverseEffectsArray.push(item.meddra_name);
                    labelsArray.push(item.label_section);
                }
                
                // Convert sets to sorted arrays
                setSources(Array.from(sourcesSet).sort());
                setLabelSections(Array.from(sectionsSet).sort());
                setAdverseEffects(adverseEffectsArray);
                setLabels(labelsArray);
            } catch (err) {
                console.error('Error fetching ingredient data:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
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

    // Create matrix data - memoized for better performance
    const { matrix, labelEffectCounts } = useMemo(() => {
        if (!finalFilteredDetails.length) {
            return { matrix: [], labelEffectCounts: [] };
        }
        
        // Pre-process data for faster lookups
        const effectsMap = new Map<string, { id: string, labelIds: Set<number> }>();
        const labelInfoMap = new Map<number, { url: string, productName: string }>();
        
        // Single pass through the data to build maps
        finalFilteredDetails.forEach(item => {
            // Build effects map
            if (!effectsMap.has(item.meddra_name)) {
                effectsMap.set(item.meddra_name, {
                    id: item.meddra_id,
                    labelIds: new Set()
                });
            }
            effectsMap.get(item.meddra_name)!.labelIds.add(item.label_id);
            
            // Build label info map
            if (!labelInfoMap.has(item.label_id)) {
                labelInfoMap.set(item.label_id, {
                    url: item.source_label_url || '',
                    productName: item.source_product_name || ''
                });
            }
        });
        
        const uniqueLabels = Array.from(labelInfoMap.keys());
        
        // Sort labels by number of effects (most to least)
        const labelEffectCounts = uniqueLabels.map(labelId => {
            const effectCount = finalFilteredDetails.filter(item => item.label_id === labelId).length;
            const labelInfo = labelInfoMap.get(labelId)!;
            return {
                labelId,
                effectCount,
                url: labelInfo.url,
                productName: labelInfo.productName
            };
        }).sort((a, b) => b.effectCount - a.effectCount);
        
        // Create matrix more efficiently
        const matrix = Array.from(effectsMap.entries()).map(([effect, effectData]) => {
            const row = { 
                effect, 
                effectId: effectData.id, 
                percentage: 0, 
                labels: {} as Record<number, boolean> 
            };
            
            let labelsWithEffect = 0;
            labelEffectCounts.forEach(({ labelId }) => {
                const hasEffect = effectData.labelIds.has(labelId);
                row.labels[labelId] = hasEffect;
                if (hasEffect) labelsWithEffect++;
            });
            
            row.percentage = uniqueLabels.length > 0 ? 
                Math.round((labelsWithEffect / uniqueLabels.length) * 100) : 0;
            
            return row;
        }).sort((a, b) => b.percentage - a.percentage);

        return { matrix, labelEffectCounts };
    }, [finalFilteredDetails]);

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

    // Show error state
    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', width: '100%' }}>
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>Error Loading Ingredient Data</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{error}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={() => window.location.reload()} 
                            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                        Retry
                    </button>
                </Box>
            </Box>
        );
    }

    // Download matrix as CSV (all filtered rows, not just paginated)
    const handleDownloadMatrix = () => {
        // Use the full matrix, not just paginatedMatrix (optimized for better performance)
        if (!matrix.length) return;
        
        const csvLines: string[] = [];
        
        // Header row
        let header = 'Adverse Effect,Percentage';
        labelEffectCounts.forEach((label) => {
            const colName = label.productName ? label.productName.replace(/"/g, '""') : label.labelId;
            header += `,"${colName}"`;
        });
        csvLines.push(header);
        
        // Data rows
        matrix.forEach(row => {
            let line = `"${row.effect.replace(/"/g, '""')}",${row.percentage}`;
            labelEffectCounts.forEach(label => {
                line += ',' + (row.labels[label.labelId] ? 'Yes' : '');
            });
            csvLines.push(line);
        });
        
        const csv = csvLines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `ingredient-${id}-matrix.csv`);
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
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => navigate(`/adverseEffect/${row.effectId}`)}
                                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                    onMouseOut={e => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fff' : '#f9f9f9')}
                                >
                                    <td style={{ 
                                        padding: '12px 16px', 
                                        wordBreak: 'break-word',
                                        position: 'sticky',
                                        left: 0,
                                        background: 'inherit',
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
                                        background: 'inherit',
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

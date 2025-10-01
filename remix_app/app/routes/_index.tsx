import React, { useEffect, useState } from 'react';
import { Typography, TextField, InputAdornment, Box, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MetaFunction } from "@remix-run/node";
import { BasePage } from '~/utils/BasePage';
import { BasicStats } from '~/components/BasicStats';
import { getAllTerms } from '~/utils/getAllTerms';
import { useNavigate } from '@remix-run/react';

export const meta: MetaFunction = () => ([
  { title: "OnSIDES" },
]);

interface TermProps {
  terms: Array<{
    term_name: string;
    term_id: string;
    term_type: string;
  }>;
}

const Home = () => {
  const [terms, setTerms] = useState<TermProps['terms']>([]);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerms = async () => {
      const data = await getAllTerms();
      setTerms(data.terms);
    };
    fetchTerms();
  }, []);

  // Debounce search input with longer delay for better performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300); // Increased to 300ms for better performance with large dataset
    return () => clearTimeout(handler);
  }, [searchValue]);

  const filteredTerms = React.useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      return []; // Don't search until at least 2 characters
    }

    const searchLower = debouncedSearch.toLowerCase();
    const results = [];

    // Limit results to prevent UI lag
    const MAX_RESULTS = 50;

    for (let i = 0; i < terms.length && results.length < MAX_RESULTS; i++) {
      const term = terms[i];
      if (term.term_name.toLowerCase().includes(searchLower) ||
        term.term_id?.toString().toLowerCase().includes(searchLower)) {
        results.push(term);
      }
    }

    return results;
  }, [debouncedSearch, terms]);

  return (<>
    <Typography variant="h3" component="h1" gutterBottom>
      OnSIDES
    </Typography>
    <Typography variant='body1' gutterBottom>
      A resource of adverse drug effects extracted from FDA structured product labels.
    </Typography>
    <Divider />

    {/* Search bar */}
    <Box sx={{ width: '100%', maxWidth: 480, position: 'relative' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search drugs or adverse reactions..."
        value={searchValue}
        onChange={e => { setSearchValue(e.target.value); setDropdownOpen(true); }}
        onFocus={() => { setFocused(true); setDropdownOpen(true); }}
        onBlur={() => { setFocused(false); setTimeout(() => setDropdownOpen(false), 150); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary', opacity: 0.5 }} />
            </InputAdornment>
          ),
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
      {dropdownOpen && filteredTerms.length > 0 && (
        <Box sx={{
          position: 'absolute',
          top: 56,
          left: 0,
          width: '100%',
          zIndex: 10,
        }}>
          <Box sx={{ boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', maxHeight: 320, overflowY: 'auto', border: '1px solid #eee' }}>
            {filteredTerms.map(term => (
              <Box
                key={`${term.term_id}-${term.term_type}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                onMouseDown={() => {
                  let route = '';
                  if (term.term_type === 'product') route = `/product/${term.term_id}`;
                  else if (term.term_type === 'ingredient') route = `/ingredient/${term.term_id}`;
                  else if (term.term_type === 'adverseEffect') route = `/adverseEffect/${term.term_id}`;
                  if (route) navigate(route);
                }}
              >
                <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>{term.term_name}</Typography>
                <Typography variant="caption" sx={{ ml: 2, px: 1, py: 0.5, bgcolor: '#eee', borderRadius: 1 }}>{term.term_id}</Typography>
                <Typography variant="caption" sx={{ ml: 1, px: 1, py: 0.5, bgcolor: '#222', color: '#fff', borderRadius: 1 }}>{term.term_type}</Typography>
              </Box>
            ))}
            {debouncedSearch && debouncedSearch.length >= 2 && filteredTerms.length === 50 && (
              <Box sx={{ px: 2, py: 1, borderTop: '1px solid #f0f0f0', bgcolor: '#f9f9f9' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Showing first 50 results. Type more characters to narrow search.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
    <BasicStats />

    <Typography variant="h4" component="h1" gutterBottom>
      About
    </Typography>
    <Typography variant="body1" gutterBottom>

      OnSIDES is a database of adverse drug events extracted from drug labels created by fine-tuning a PubMedBERT language model on 200 manually curated labels available from Denmer-Fushman et al.. This comprehensive database will be updated quarterly, and currently contains more than 3.6 million drug-ADE pairs for 2,793 drug ingredients extracted from 46,686 labels, processed from all of the labels available to download from DailyMed as of November 2023. Additionally, we now provide a number of complementary databases constructed using a similar method - OnSIDES-INTL, adverse drug events extracted from drug labels of other nations/regions (Japan, UK, EU), and OnSIDES-PED, adverse drug events specifically noted for pediatric patients in drug labels. We have recently released a preprint on medRxiv with a full description of the data, methods and analyses.
    </Typography>
    <Typography variant="h4" component="h1" gutterBottom>
      Model Accuracy
    </Typography>
    <Typography variant="body1" gutterBottom>
      Our fine-tuned language model achieves an F1 score of 0.90, AUROC of 0.92, and AUPR of 0.95 at extracting effects from the ADVERSE REACTIONS section of the FDA drug label. For the BOXED WARNINGS section, the model achieves an F1 score of 0.71, AUROC of 0.85, and AUPR of 0.72. For the WARNINGS AND PRECUATIONS section, the model achieves an F1 score of 0.68, AUROC of 0.66, and AUPR of 0.68. Compared against the reference standard using the official evaluation script for TAC 2017, the model achieves a Micro-F1 score of 0.87 and a Macro-F1 of 0.85.
    </Typography>
    <Typography variant="h4" component="h1" gutterBottom>
      Citation
    </Typography>
    <Typography variant="body1">
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
      <code style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', display: 'block', marginTop: '8px' }}>
        Tanaka Y, Chen HY, Belloni P, Gisladottir U, Kefeli J, Patterson J, Srinivasan A, Zietz M, Sirdeshmukh G, Berkowitz J, LaRow Brown K, Tatonetti NP. OnSIDES database: Extracting adverse drug events from drug labels using natural language processing models. Med. 2025 Mar 27:100642. doi: 10.1016/j.medj.2025.100642. PMID: 40179876.
      </code>
    </Typography>
  </>)
};

export default function Index() {
  return (
    <BasePage pageInner={<Home />} />
  );
}
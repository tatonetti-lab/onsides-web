import { Typography, TextField, InputAdornment, Box, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MetaFunction } from "@remix-run/node";
import { BasePage } from '~/utils/BasePage';
import { BasicStats } from '~/components/BasicStats';

export const meta: MetaFunction = () => ([
  { title: "OnSIDES" },
]);

const Home = () => {
  return (<>
    <Typography variant="h3" component="h1" gutterBottom>
      OnSIDES
    </Typography>
    <Typography variant='body1' gutterBottom>
      A resource of adverse drug effects extracted from FDA structured product labels.
    </Typography>
    <Divider/>

    {/* Search bar */}
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search drugs or adverse reactions..."
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
  </>)
};

export default function Index() {
  return (
    <BasePage pageInner={<Home />} />
  );
}
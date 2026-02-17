import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess, Clear } from '@mui/icons-material';

const BUILDING_TYPES = [
  { value: 'power', label: 'Kraftwerke' },
  { value: 'airport', label: 'Flughäfen' },
  { value: 'server', label: 'Rechenzentren' },
  { value: 'gov', label: 'Behörden' },
  { value: 'water', label: 'Wasserwerke' },
  { value: 'base', label: 'Militärbasen' },
  { value: 'hospital', label: 'Krankenhäuser' },
  { value: 'fire', label: 'Feuerwachen' },
  { value: 'police', label: 'Polizei' },
  { value: 'school', label: 'Schulen' },
  { value: 'cityhall', label: 'Rathäuser' },
  { value: 'bridge', label: 'Brücken' },
  { value: 'port', label: 'Häfen' },
  { value: 'energy', label: 'Umspannwerke' },
  { value: 'metro', label: 'U-Bahn' },
  { value: 'university', label: 'Universitäten' },
  { value: 'control', label: 'Leitstellen' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'critical', label: 'Kritisch' },
  { value: 'offline', label: 'Offline' }
];

const COUNTRY_OPTIONS = [
  { value: 'DE', label: 'Deutschland' },
  { value: 'AT', label: 'Österreich' },
  { value: 'CH', label: 'Schweiz' },
  { value: 'NL', label: 'Niederlande' },
  { value: 'FR', label: 'Frankreich' },
  { value: 'UK', label: 'Vereinigtes Königreich' },
  { value: 'IT', label: 'Italien' },
  { value: 'ES', label: 'Spanien' },
  { value: 'PL', label: 'Polen' },
  { value: 'NO', label: 'Norwegen' },
  { value: 'SE', label: 'Schweden' },
  { value: 'DK', label: 'Dänemark' },
  { value: 'RU', label: 'Russland' },
  { value: 'KR', label: 'Südkorea' }
];

export function FilterPanel({ filters, onFilterChange, totalCount, filteredCount }) {
  const [expanded, setExpanded] = useState(true);

  const handleTypeChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, types: typeof value === 'string' ? value.split(',') : value });
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, statuses: typeof value === 'string' ? value.split(',') : value });
  };

  const handleCountryChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, countries: typeof value === 'string' ? value.split(',') : value });
  };

  const handleSearchChange = (event) => {
    onFilterChange({ ...filters, search: event.target.value });
  };

  const handleClearAll = () => {
    onFilterChange({ types: [], statuses: [], countries: [], search: '' });
  };

  const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0 || 
                          filters.countries.length > 0 || filters.search !== '';

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2, 
        overflow: 'hidden',
        border: '1px solid #CCCCCC',
        borderRadius: 0,
        backgroundColor: '#FFFFFF'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: '#003366',
          color: 'white',
          cursor: 'pointer',
          borderBottom: '1px solid #CCCCCC'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="h6" sx={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'Arial, Tahoma, sans-serif', textTransform: 'uppercase' }}>
          Facility Filter
        </Typography>
        <IconButton size="small" sx={{ color: 'white', width: 20, height: 20 }}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
          {/* Search Field */}
          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
            Search:
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={filters.search}
            onChange={handleSearchChange}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'Arial, Tahoma, sans-serif',
                backgroundColor: '#FFFFFF'
              }
            }}
            placeholder="e.g. Berlin, Munich..."
          />

          {/* Building Type Filter */}
          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
            Building Type:
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              multiple
              value={filters.types}
              onChange={handleTypeChange}
              displayEmpty
              sx={{
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'Arial, Tahoma, sans-serif',
                backgroundColor: '#FFFFFF'
              }}
              renderValue={(selected) => {
                if (selected.length === 0) return <em style={{ color: '#666666' }}>All Types</em>;
                return selected.map(value => 
                  BUILDING_TYPES.find(t => t.value === value)?.label || value
                ).join(', ');
              }}
            >
              {BUILDING_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value} sx={{ fontSize: '11px' }}>
                  <Checkbox checked={filters.types.indexOf(type.value) > -1} size="small" />
                  <ListItemText primary={type.label} sx={{ '& .MuiTypography-root': { fontSize: '11px' } }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
            Operational Status:
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              multiple
              value={filters.statuses}
              onChange={handleStatusChange}
              displayEmpty
              sx={{
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'Arial, Tahoma, sans-serif',
                backgroundColor: '#FFFFFF'
              }}
              renderValue={(selected) => {
                if (selected.length === 0) return <em style={{ color: '#666666' }}>All Status</em>;
                return selected.map(value => 
                  STATUS_OPTIONS.find(s => s.value === value)?.label || value
                ).join(', ');
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value} sx={{ fontSize: '11px' }}>
                  <Checkbox checked={filters.statuses.indexOf(status.value) > -1} size="small" />
                  <ListItemText primary={status.label} sx={{ '& .MuiTypography-root': { fontSize: '11px' } }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Country Filter */}
          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
            Region:
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              multiple
              value={filters.countries}
              onChange={handleCountryChange}
              displayEmpty
              sx={{
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'Arial, Tahoma, sans-serif',
                backgroundColor: '#FFFFFF'
              }}
              renderValue={(selected) => {
                if (selected.length === 0) return <em style={{ color: '#666666' }}>All Regions</em>;
                return selected.map(value => 
                  COUNTRY_OPTIONS.find(c => c.value === value)?.label || value
                ).join(', ');
              }}
            >
              {COUNTRY_OPTIONS.map((country) => (
                <MenuItem key={country.value} value={country.value} sx={{ fontSize: '11px' }}>
                  <Checkbox checked={filters.countries.indexOf(country.value) > -1} size="small" />
                  <ListItemText primary={country.label} sx={{ '& .MuiTypography-root': { fontSize: '11px' } }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={handleClearAll}
              sx={{ 
                color: '#003366', 
                borderColor: '#CCCCCC',
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'Arial, Tahoma, sans-serif',
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#E6F2FF',
                  borderColor: '#0066CC'
                }
              }}
            >
              Reset All
            </Button>
          )}

          {/* Results Counter */}
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid #CCCCCC',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#003366' }}>
              Results: {filteredCount} of {totalCount} shown
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

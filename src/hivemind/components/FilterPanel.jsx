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
  // ...weitere Typen
];

export function FilterPanel({ filters, onFilterChange, totalCount, filteredCount }) {
  // ...Implementierung aus HIVE-MIND übernehmen...
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2">Filter</Typography>
      {/* Filter Controls folgen */}
      <Typography variant="caption">{filteredCount} von {totalCount} Standorten</Typography>
    </Paper>
  );
}

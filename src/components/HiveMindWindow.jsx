import { useState, useEffect } from 'react';
import axios from 'axios';
import { useHiveStore } from '../state/hive';
import { Button, Paper, Checkbox, FormControlLabel, Typography, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MapContainer, TileLayer } from 'react-leaflet';
import { LocationMarkers } from './hive/LocationMarkers';
import { HeatmapOverlay } from './hive/HeatmapOverlay';
import { LocationConnections } from './hive/LocationConnections';
import { StationMarkers } from './hive/StationMarkers';
import { FilterPanel } from './hive/FilterPanel';

import 'leaflet/dist/leaflet.css';
import './hive/HiveMindApp.css';

// Helper function: JSON to CSV
function jsonToCsv(data) {
  if (!data || !data.length) return '';
  const replacer = (key, value) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  return [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
}

function downloadCsv(data, filename = 'standorte.csv') {
  const csv = jsonToCsv(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function HiveMindWindow() {
  const showConnections = useHiveStore(s => s.showConnections);
  const setShowConnections = useHiveStore(s => s.setShowConnections);
  const showRailLayer = useHiveStore(s => s.showRailLayer);
  const setShowRailLayer = useHiveStore(s => s.setShowRailLayer);
  const showEsriBoundaries = useHiveStore(s => s.showEsriBoundaries);
  const setShowEsriBoundaries = useHiveStore(s => s.setShowEsriBoundaries);
  const showEsriTransportation = useHiveStore(s => s.showEsriTransportation);
  const setShowEsriTransportation = useHiveStore(s => s.setShowEsriTransportation);
  const showEsriTopo = useHiveStore(s => s.showEsriTopo);
  const setShowEsriTopo = useHiveStore(s => s.setShowEsriTopo);
  const esriOverlayOpacity = useHiveStore(s => s.esriOverlayOpacity);
  const setEsriOverlayOpacity = useHiveStore(s => s.setEsriOverlayOpacity);
  const selectedLocation = useHiveStore(s => s.selectedLocation);
  const setSelectedLocation = useHiveStore(s => s.setSelectedLocation);
  
  // Filter state
  const [filters, setFilters] = useState({
    types: [],
    statuses: [],
    countries: [],
    search: ''
  });
  
  // Location data
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  
  // Heatmap
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    setLoadingLocations(true);
    axios.get('/locations.json')
      .then(res => {
        setLocations(res.data);
        setLoadingLocations(false);
      })
      .catch(() => {
        setLocationsError('Error loading locations');
        setLoadingLocations(false);
      });
  }, []);

  // Calculate filtered locations
  const getFilteredLocations = () => {
    return (locations || []).filter(loc => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(loc.type)) {
        return false;
      }
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(loc.status)) {
        return false;
      }
      // Country filter
      if (filters.countries.length > 0 && !filters.countries.includes(loc.country)) {
        return false;
      }
      // Search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(searchLower);
        const matchesDescription = loc.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredLocations = getFilteredLocations();

  // Control panel for selected location
  function renderControlPanel() {
    if (!selectedLocation) {
      return <Typography sx={{ fontSize: '11px', color: '#666666', fontStyle: 'italic' }}>Select a facility on the map…</Typography>;
    }
    
    const fakeData = selectedLocation.type === 'power' ? {
      leistung: '1200 MW',
      temperatur: '320 °C',
      druck: '155 bar',
      status: selectedLocation.status === 'active' ? 'Online' : (selectedLocation.status === 'critical' ? 'Warning' : 'Offline'),
      letzteWartung: '12.01.2026',
    } : null;
    
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 2, position: 'relative', border: '1px solid #CCCCCC', borderRadius: 0, backgroundColor: '#FFFFFF' }}>
        <IconButton size="small" onClick={() => setSelectedLocation(null)} sx={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '12px', fontWeight: 'bold', color: '#003366' }}>{selectedLocation.name}</Typography>
        <Typography sx={{ fontSize: '11px', color: '#000000' }}>Status: <b style={{ color: selectedLocation.status === 'critical' ? '#CC0000' : '#006600' }}>{selectedLocation.status.toUpperCase()}</b></Typography>
        <Typography sx={{ my: 1, fontSize: '11px' }}>{selectedLocation.description}</Typography>
        {fakeData && (
          <>
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5, fontSize: '11px' }}>Leistung: <b>{fakeData.leistung}</b></Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>Temperatur: <b>{fakeData.temperatur}</b></Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>Druck: <b>{fakeData.druck}</b></Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>Status: <b style={{ color: '#003366' }}>{fakeData.status}</b></Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>Letzte Wartung: <b>{fakeData.letzteWartung}</b></Typography>
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => alert('Control panel opening...')}
            sx={{
              backgroundColor: '#003366',
              color: '#FFFFFF',
              borderRadius: 0,
              fontSize: '11px',
              fontFamily: 'Arial, Tahoma, sans-serif',
              textTransform: 'none',
              boxShadow: '1px 1px 0 rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: '#0066CC'
              }
            }}
          >
            Open Control Panel
          </Button>
        </div>
      </Paper>
    );
  }

  return (
    <div className="hive-mind-app" style={{ width: '100%', height: '100%', backgroundColor: '#f4f4f4', padding: '16px' }}>
      <div className="modal-header" style={{ marginBottom: '16px' }}>
        <div className="modal-header-title">
          <h2 style={{ fontSize: '16px', margin: 0 }}>
            🏛️ INFRASTRUCTURE MONITORING SYSTEM - v2.1
          </h2>
        </div>
        <div className="modal-header-subtitle" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          Department of Infrastructure & Public Works
        </div>
      </div>
      
      {/* Critical alert */}
      {Array.isArray(locations) && locations.some(l => l.status === 'critical') && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Critical Warning: At least one location is in <b>Critical</b> status!
        </Alert>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Button variant="outlined" size="small" onClick={() => downloadCsv(locations)}>
          Export Locations as CSV
        </Button>
      </div>
      
      <div style={{ display: 'flex', gap: 32, height: 'calc(100% - 120px)', minHeight: 400, width: '100%' }}>
        <div className="map-wrapper" style={{ flex: 2.5, height: '100%', minWidth: 0 }}>
          <FilterPanel 
            filters={filters}
            onFilterChange={setFilters}
            totalCount={locations.length}
            filteredCount={filteredLocations.length}
          />
          {loadingLocations ? (
            <div style={{ padding: 16 }}>Loading locations…</div>
          ) : locationsError ? (
            <div style={{ color: 'red', padding: 16 }}>{locationsError}</div>
          ) : (
            <MapContainer
              center={[50, 10]}
              zoom={4}
              minZoom={2}
              maxZoom={19}
              style={{ height: 'calc(100% - 240px)', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={true}
              zoomControl={true}
              attributionControl={false}
            >
              {/* Base: Satellite imagery */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
              {/* Esri Overlays */}
              {showEsriBoundaries && (
                <TileLayer
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  opacity={esriOverlayOpacity}
                />
              )}
              {showEsriTransportation && (
                <TileLayer
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                  opacity={esriOverlayOpacity}
                />
              )}
              {showEsriTopo && (
                <TileLayer
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  opacity={esriOverlayOpacity}
                />
              )}
              {showRailLayer && (
                <TileLayer
                  url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                  opacity={0.7}
                />
              )}
              {showConnections && <LocationConnections locations={locations} />}
              {showHeatmap && (
                <HeatmapOverlay
                  points={filteredLocations.map(l => ({
                    position: l.position,
                    intensity: l.status === 'critical' ? 1 : 0.3
                  }))}
                />
              )}
              <LocationMarkers onSelect={setSelectedLocation} locations={locations} filters={filters} />
              <StationMarkers />
            </MapContainer>
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 260, background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: 0, padding: 16, height: '100%', overflowY: 'auto' }}>
          {renderControlPanel()}
          <FormControlLabel
            control={<Checkbox checked={showConnections} onChange={e => setShowConnections(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Show Connections</Typography>}
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showRailLayer} onChange={e => setShowRailLayer(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Show Rail Network</Typography>}
            sx={{ mt: 0.5 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Show Heatmap</Typography>}
            sx={{ mt: 0.5 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showEsriBoundaries} onChange={e => setShowEsriBoundaries(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Boundaries & Places</Typography>}
            sx={{ mt: 0.5 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showEsriTransportation} onChange={e => setShowEsriTransportation(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Roads & Railways</Typography>}
            sx={{ mt: 0.5 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showEsriTopo} onChange={e => setShowEsriTopo(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Topography</Typography>}
            sx={{ mt: 0.5 }}
          />
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #CCCCCC' }}>
            <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', mb: 0.5 }}>Overlay Transparency</Typography>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={esriOverlayOpacity}
              onChange={e => setEsriOverlayOpacity(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#666666' }}>{Math.round(esriOverlayOpacity * 100)}%</Typography>
          </div>
        </div>
      </div>
      
      <div className="modal-status-bar" style={{ marginTop: '8px', padding: '4px 8px', background: '#f0f0f0', border: '1px solid #ccc', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>User: Administrator | Status: CONNECTED</span>
        <span>{filteredLocations.length} Facilities | {new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

import { create } from 'zustand';

export const useHiveStore = create(set => ({
  selectedLocation: null,
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  showConnections: true,
  setShowConnections: (val) => set({ showConnections: val }),
  showRailLayer: false,
  setShowRailLayer: (val) => set({ showRailLayer: val }),
  showEsriBoundaries: false,
  setShowEsriBoundaries: (val) => set({ showEsriBoundaries: val }),
  showEsriTransportation: false,
  setShowEsriTransportation: (val) => set({ showEsriTransportation: val }),
  showEsriTopo: false,
  setShowEsriTopo: (val) => set({ showEsriTopo: val }),
  esriOverlayOpacity: 0.7,
  setEsriOverlayOpacity: (val) => set({ esriOverlayOpacity: val }),
  // Weitere globale States können hier ergänzt werden
}));

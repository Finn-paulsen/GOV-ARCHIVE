import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // ggf. anpassen
  timeout: 10000,
});

// Beispiel: Standorte abrufen
export async function fetchLocations() {
  const res = await api.get('/locations');
  return res.data;
}

// Beispiel: Standort steuern
export async function controlLocation(id, action) {
  const res = await api.post(`/locations/${id}/control`, { action });
  return res.data;
}

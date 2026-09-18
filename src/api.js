// Thin fetch wrapper around the Node.js/Express backend (../backend).
// Set VITE_API_BASE in a .env file if the backend runs somewhere other than localhost:4000.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function request(path, options) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error('API error ' + res.status + ' on ' + path);
  return res.json();
}

export const api = {
  getUsers: () => request('/users'),
  getTasks: () => request('/tasks'),
  updateTask: (id, patch) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getSongs: () => request('/songs'),
  addSong: (song) => request('/songs', { method: 'POST', body: JSON.stringify(song) }),
  deleteSong: (id) => request(`/songs/${id}`, { method: 'DELETE' }),
  getPlaylists: () => request('/playlists'),
  addPlaylist: (playlist) => request('/playlists', { method: 'POST', body: JSON.stringify(playlist) }),
  getWhatsappStatus: () => request('/whatsapp/status'),
  getWhatsappQR: () => request('/whatsapp/qr'),
  connectWhatsapp: () => request('/whatsapp/connect', { method: 'POST' }),
  disconnectWhatsapp: () => request('/whatsapp/disconnect', { method: 'POST' }),
};

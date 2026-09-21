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
  updateUser: (id, patch) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  getTasks: () => request('/tasks'),
  addTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, patch) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getFeed: () => request('/feed'),
  addFeedItem: (item) => request('/feed', { method: 'POST', body: JSON.stringify(item) }),
  addFeedComment: (feedId, comment) => request(`/feed/${feedId}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
  deleteFeedComment: (feedId, commentId) => request(`/feed/${feedId}/comments/${commentId}`, { method: 'DELETE' }),
  getContacts: () => request('/contacts'),
  addContact: (contact) => request('/contacts', { method: 'POST', body: JSON.stringify(contact) }),
  updateContact: (id, patch) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  getSongs: () => request('/songs'),
  addSong: (song) => request('/songs', { method: 'POST', body: JSON.stringify(song) }),
  updateSong: (id, patch) => request(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteSong: (id) => request(`/songs/${id}`, { method: 'DELETE' }),
  getPlaylists: () => request('/playlists'),
  addPlaylist: (playlist) => request('/playlists', { method: 'POST', body: JSON.stringify(playlist) }),
  updatePlaylist: (id, patch) => request(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
  getWhatsappStatus: () => request('/whatsapp/status'),
  getWhatsappQR: () => request('/whatsapp/qr'),
  connectWhatsapp: () => request('/whatsapp/connect', { method: 'POST' }),
  disconnectWhatsapp: () => request('/whatsapp/disconnect', { method: 'POST' }),
  getChats: (userId) => request(`/chats?userId=${encodeURIComponent(userId)}`),
  getChatMessages: (chatId) => request(`/chats/${chatId}/messages`),
  sendChatMessage: (chatId, senderId, text) => request(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ senderId, text }) }),
};

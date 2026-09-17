import { useEffect, useRef, useState } from 'react';
import { s } from './style';
import Hoverable from './Hoverable';
import {
  STRINGS,
  APP_STRINGS,
  USERS,
  STATUS_DEFS,
  TASKS_SEED,
  SONGS_SEED,
  PLAYLISTS_SEED,
  WHATSAPP_CHATS_SEED,
  extractYouTubeId,
  THEMES,
} from './data';
import { api } from './api';

const FONT = "'Domine', serif";

function QRCodeSVG({ data, size = 200 }) {
  const matrixSize = 25;
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));

  const addFinder = (startX, startY) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
          matrix[startY + y][startX + x] = 1;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(matrixSize - 7, 0);
  addFinder(0, matrixSize - 7);

  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = 1;
      matrix[i][6] = 1;
    }
  }

  let hash = 0;
  const str = String(data || 'WAHA_SINGULAR_AUTH');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  for (let y = 0; y < matrixSize; y++) {
    for (let x = 0; x < matrixSize; x++) {
      if ((x < 8 && y < 8) || (x >= matrixSize - 8 && y < 8) || (x < 8 && y >= matrixSize - 8)) continue;
      if (x >= 10 && x <= 14 && y >= 10 && y <= 14) continue;
      const seed = Math.sin(hash + y * matrixSize + x) * 10000;
      matrix[y][x] = (seed - Math.floor(seed)) > 0.46 ? 1 : 0;
    }
  }

  const cellSize = size / matrixSize;

  return (
    <div style={{ position: 'relative', width: size, height: size, background: '#ffffff', padding: 12, borderRadius: 12, display: 'inline-block', boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize - 0.25}
                height={cellSize - 0.25}
                rx={cellSize * 0.2}
                fill="#0b141a"
              />
            ) : null
          )
        )}
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#25D366',
        border: '3px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.181 8.181 0 012.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
        </svg>
      </div>
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #25D366 50%, transparent 100%)',
        boxShadow: '0 0 10px #25D366',
        animation: 'scanLine 2.2s ease-in-out infinite alternate',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

const initialState = {
  login: '',
  password: '',
  showPassword: false,
  remember: false,
  lang: 'pt',
  fadeOpacity: 1,
  view: 'login',
  route: 'caio-marques',
  isMobile: false,
  mobileSidebarOpen: false,
  contentOpacity: 1,
  contentTransform: 'translateY(0)',
  contentTransition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  mainTheme: 'dark',
  boardView: 'kanban',
  userMenuOpen: false,
  userMenuMounted: false,
  userMenuClosing: false,
  settingsModalOpen: false,
  logoutModalOpen: false,
  notifications: true,
  users: USERS.map((u) => ({ ...u })),
  tasks: TASKS_SEED.map((t) => ({ ...t })),
  detailsTaskId: null,
  actionTaskId: null,
  searchQuery: '',
  filterProjeto: '',
  filterDateFrom: '',
  filterDateTo: '',
  draftTitulo: '',
  draftPrazo: '',
  draftStatus: '',
  draftUserId: '',
  draftConcluida: false,
  songs: SONGS_SEED.map((sg) => ({ ...sg })),
  playlists: PLAYLISTS_SEED.map((p) => ({ ...p, songIds: [...p.songIds] })),
  redirectModalOpen: false,
  addFormOpen: false,
  redirectSearch: '',
  redirectPage: 0,
  newTitulo: '',
  newLink: '',
  newAddedBy: '',
  currentSongId: null,
  currentPlaylistId: null,
  isPlaying: false,
  repeat: false,
  shuffle: false,
  videoModalOpen: false,
  playerUnavailable: false,
  volume: 80,
  isMuted: false,
  volumeHover: false,
  playlistModalOpen: false,
  newPlaylistName: '',
  newPlaylistSongIds: [],
  toasts: [],
  whatsappConnected: false,
  whatsappQrModalOpen: false,
  whatsappChatModalOpen: false,
  whatsappQrLoading: false,
  whatsappQrData: '',
  whatsappChats: WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] })),
  whatsappActiveChatId: 'c1',
  whatsappMessageDraft: '',
  whatsappSearch: '',
  whatsappFilter: 'all',
  whatsappEmojiPickerOpen: false,
  wahaServerUrl: 'http://localhost:3000',
};

export default function App() {
  const [state, setStateRaw] = useState(initialState);
  const setState = (patch) =>
    setStateRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));

  const bgCanvasRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const pendingVideoIdRef = useRef(null);
  const ytInitAttemptedRef = useRef(false);
  const ytReadyRef = useRef(false);
  const ytReadyTimeoutRef = useRef(null);
  const ytScriptLoadingRef = useRef(false);
  const bgRafRef = useRef(null);
  const bgResizeRef = useRef(null);
  const toastIdRef = useRef(0);

  const {
    login, password, showPassword, remember, lang, fadeOpacity, view, route, isMobile, mobileSidebarOpen,
    contentOpacity, contentTransform, contentTransition, mainTheme, boardView, userMenuOpen, userMenuMounted, userMenuClosing,
    settingsModalOpen, logoutModalOpen, notifications, users, tasks, detailsTaskId, actionTaskId,
    draftTitulo, draftPrazo, draftStatus, draftUserId, draftConcluida,
    searchQuery, filterProjeto, filterDateFrom, filterDateTo,
    songs, playlists, redirectModalOpen, addFormOpen, redirectSearch, redirectPage,
    newTitulo, newLink, newAddedBy, currentSongId, currentPlaylistId, isPlaying, repeat, shuffle,
    videoModalOpen, playerUnavailable, volume, isMuted, volumeHover, playlistModalOpen, newPlaylistName, newPlaylistSongIds, toasts,
    whatsappConnected, whatsappQrModalOpen, whatsappChatModalOpen, whatsappQrLoading, whatsappQrData,
    whatsappChats, whatsappActiveChatId, whatsappMessageDraft, whatsappSearch, whatsappFilter, whatsappEmojiPickerOpen, wahaServerUrl,
  } = state;

  // ---------- helpers ----------
  function addToast(toast) {
    const id = (toastIdRef.current += 1);
    setState((s2) => ({ toasts: [...s2.toasts, { ...toast, id }] }));
    setTimeout(() => setState((s2) => ({ toasts: s2.toasts.filter((t) => t.id !== id) })), 4200);
  }

  function closeUserMenu() {
    if (!userMenuOpen) return;
    setState({ userMenuClosing: true });
    setTimeout(() => setState({ userMenuOpen: false, userMenuMounted: false, userMenuClosing: false }), 180);
  }

  function changeLang(newLang) {
    if (newLang === lang) return;
    setState({ fadeOpacity: 0 });
    setTimeout(() => setState({ lang: newLang, fadeOpacity: 1 }), 250);
  }

  function doLogout() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
    } catch (e) {}
    setState({ logoutModalOpen: false, userMenuOpen: false, view: 'login', route: 'caio-marques', boardView: 'kanban' });
  }

  // ---------- pixel background animation (login screen) ----------
  function startBgAnim() {
    const canvas = bgCanvasRef.current;
    if (!canvas || bgRafRef.current) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    bgResizeRef.current = resize;
    const cell = 14;
    let t = 0;
    const draw = () => {
      const canvasEl = bgCanvasRef.current;
      if (!canvasEl) { bgRafRef.current = null; return; }
      t += 0.012;
      ctx.fillStyle = '#050f13';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / cell);
      const rows = Math.ceil(canvas.height / cell);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n = Math.sin(x * 0.32 + t) * Math.cos(y * 0.32 - t * 0.8) + Math.sin((x + y) * 0.11 + t * 1.2);
          const v = (n + 2) / 4;
          if (v > 0.6) {
            const alpha = (v - 0.6) / 0.4;
            ctx.fillStyle = `rgba(79,209,222,${(alpha * 0.5).toFixed(3)})`;
            ctx.fillRect(x * cell, y * cell, cell - 3, cell - 3);
          }
        }
      }
      bgRafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }

  // ---------- YouTube player (mini player + video modal) ----------
  function markPlayerUnavailable() {
    if (playerUnavailable) return;
    clearTimeout(ytReadyTimeoutRef.current);
    ytPlayerRef.current = null;
    setState({ playerUnavailable: true, isPlaying: false });
  }

  function initYTPlayer() {
    if (ytInitAttemptedRef.current || !document.getElementById('yt-player-mount')) return;
    ytInitAttemptedRef.current = true;
    try {
      const savedVol = Number(localStorage.getItem('singular_player_volume'));
      const initialVol = !isNaN(savedVol) && savedVol !== null && savedVol >= 0 ? savedVol : 80;
      ytPlayerRef.current = new window.YT.Player('yt-player-mount', {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 0, rel: 0 },
        events: {
          onReady: () => {
            clearTimeout(ytReadyTimeoutRef.current);
            ytReadyRef.current = true;
            try {
              if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
                ytPlayerRef.current.setVolume(initialVol);
              }
            } catch (err) {}
            if (pendingVideoIdRef.current) {
              try { ytPlayerRef.current.loadVideoById(pendingVideoIdRef.current); } catch (e) { markPlayerUnavailable(); }
              pendingVideoIdRef.current = null;
            }
          },
          onStateChange: (e) => {
            if (!window.YT) return;
            if (e.data === window.YT.PlayerState.ENDED) playNext();
            if (e.data === window.YT.PlayerState.PLAYING) setState({ isPlaying: true });
            if (e.data === window.YT.PlayerState.PAUSED) setState({ isPlaying: false });
          },
          onError: () => markPlayerUnavailable(),
        },
      });
      ytReadyTimeoutRef.current = setTimeout(() => { if (!ytReadyRef.current) markPlayerUnavailable(); }, 3000);
    } catch (e) {
      markPlayerUnavailable();
    }
  }

  function loadYTScript() {
    if (window.YT && window.YT.Player) { initYTPlayer(); return; }
    if (ytScriptLoadingRef.current) return;
    ytScriptLoadingRef.current = true;
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(scriptEl);
  }

  function loadSong(id, opts) {
    opts = opts || {};
    const song = songs.find((sg) => sg.id === id);
    if (!song) return;
    if (playerUnavailable) {
      setState({ currentSongId: id, currentPlaylistId: opts.keepPlaylist ? currentPlaylistId : null });
      return;
    }
    setState({
      currentSongId: id,
      isPlaying: true,
      videoModalOpen: !!opts.video,
      currentPlaylistId: opts.keepPlaylist ? currentPlaylistId : null,
    });
    try {
      if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
        ytPlayerRef.current.loadVideoById(song.videoId);
        if (ytPlayerRef.current.setVolume) {
          ytPlayerRef.current.setVolume(isMuted ? 0 : volume);
        }
      } else {
        pendingVideoIdRef.current = song.videoId;
      }
    } catch (e) { markPlayerUnavailable(); }
  }

  function getQueue() {
    if (currentPlaylistId) {
      const pl = playlists.find((p) => p.id === currentPlaylistId);
      if (pl) return pl.songIds.map((id) => songs.find((sg) => sg.id === id)).filter(Boolean);
    }
    return songs;
  }

  function playNext() {
    const queue = getQueue();
    if (!queue.length) return;
    if (repeat) { loadSong(currentSongId, { keepPlaylist: true }); return; }
    let idx;
    if (shuffle) idx = Math.floor(Math.random() * queue.length);
    else {
      const curIdx = queue.findIndex((sg) => sg.id === currentSongId);
      idx = (curIdx + 1) % queue.length;
    }
    loadSong(queue[idx].id, { keepPlaylist: true });
  }

  function togglePlay() {
    if (!ytPlayerRef.current || playerUnavailable) return;
    try {
      if (isPlaying) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    } catch (e) { markPlayerUnavailable(); }
  }

  function toggleRepeat() {
    setState((s2) => {
      const next = !s2.repeat;
      try { localStorage.setItem('singular_player_repeat', String(next)); } catch (e) {}
      return { repeat: next };
    });
  }

  function changeVolume(newVol) {
    const vol = Math.max(0, Math.min(100, Number(newVol)));
    setState({ volume: vol, isMuted: vol === 0 });
    try { localStorage.setItem('singular_player_volume', String(vol)); } catch (e) {}
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      try {
        ytPlayerRef.current.setVolume(vol);
        if (vol > 0 && ytPlayerRef.current.isMuted && ytPlayerRef.current.isMuted()) {
          ytPlayerRef.current.unMute();
        }
      } catch (e) {}
    }
  }

  function toggleMute() {
    if (isMuted || volume === 0) {
      const saved = Number(localStorage.getItem('singular_player_volume'));
      const restoreVol = !isNaN(saved) && saved > 0 ? saved : 80;
      setState({ volume: restoreVol, isMuted: false });
      if (ytPlayerRef.current) {
        try {
          if (ytPlayerRef.current.unMute) ytPlayerRef.current.unMute();
          if (ytPlayerRef.current.setVolume) ytPlayerRef.current.setVolume(restoreVol);
        } catch (e) {}
      }
    } else {
      setState({ isMuted: true });
      if (ytPlayerRef.current) {
        try {
          if (ytPlayerRef.current.mute) ytPlayerRef.current.mute();
        } catch (e) {}
      }
    }
  }

  // ---------- task CRUD (optimistic local update + persist to the Node backend) ----------
  function saveTask() {
    const id = actionTaskId;
    const patch = { titulo: draftTitulo, prazo: draftPrazo || null, status: draftStatus, userId: draftUserId, concluida: draftConcluida };
    setState((s2) => ({
      tasks: s2.tasks.map((tk) => (tk.id === id ? { ...tk, ...patch } : tk)),
      actionTaskId: null,
    }));
    api.updateTask(id, patch).catch(() => console.warn('Backend unreachable — task updated locally only.'));
    addToast({ title: appT.updateToastTitle, message: appT.updateToastMsg, accent: '#3fd67a' });
  }

  function deleteTask() {
    const id = actionTaskId;
    setState((s2) => ({ tasks: s2.tasks.filter((tk) => tk.id !== id), actionTaskId: null }));
    api.deleteTask(id).catch(() => console.warn('Backend unreachable — task deleted locally only.'));
    addToast({ title: appT.deleteToastTitle, message: appT.deleteToastMsg, accent: '#e5847c' });
  }

  function reactivateTask() {
    const id = detailsTaskId;
    setState((s2) => ({ tasks: s2.tasks.map((tk) => (tk.id === id ? { ...tk, concluida: false } : tk)), detailsTaskId: null }));
    api.updateTask(id, { concluida: false }).catch(() => console.warn('Backend unreachable — task updated locally only.'));
    addToast({ title: appT.reactivateToastTitle, message: appT.reactivateToastMsg, accent: '#3fd67a' });
  }

  // ---------- redirect / songs / playlists ----------
  function submitNewSong() {
    if (!newTitulo.trim() || !newLink.trim() || !newAddedBy.trim()) return;
    const videoId = extractYouTubeId(newLink);
    if (!videoId) return;
    const song = { id: 's' + Date.now(), titulo: newTitulo.trim(), link: newLink.trim(), videoId, addedBy: newAddedBy.trim() };
    setState((s2) => ({ songs: [...s2.songs, song], newTitulo: '', newLink: '', newAddedBy: '', addFormOpen: false }));
    api
      .addSong({ titulo: song.titulo, link: song.link, videoId: song.videoId, addedBy: song.addedBy })
      .catch(() => console.warn('Backend unreachable — song added locally only.'));
  }

  function createPlaylist() {
    if (!newPlaylistName.trim() || !newPlaylistSongIds.length) return;
    const playlist = { id: 'p' + Date.now(), nome: newPlaylistName.trim(), songIds: [...newPlaylistSongIds] };
    setState((s2) => ({ playlists: [...s2.playlists, playlist], newPlaylistName: '', newPlaylistSongIds: [] }));
    api
      .addPlaylist({ nome: playlist.nome, songIds: playlist.songIds })
      .catch(() => console.warn('Backend unreachable — playlist created locally only.'));
  }

  // ---------- WhatsApp / WAHA ----------
  async function openWhatsappQR() {
    setState((s2) => ({
      whatsappQrModalOpen: true,
      whatsappQrLoading: true,
      whatsappChats: (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
        ? s2.whatsappChats
        : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] })),
    }));
    try {
      const res = await api.getWhatsappQR();
      setState({ whatsappQrData: res?.qr || '', whatsappQrLoading: false });
    } catch (e) {
      setState({
        whatsappQrData: '2@WAHA_SINGULAR_MOCK_QR_' + Date.now(),
        whatsappQrLoading: false,
      });
    }
  }

  async function handleConnectWhatsapp(openChat = false) {
    setState((s2) => ({
      whatsappConnected: true,
      whatsappQrModalOpen: false,
      whatsappChats: (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
        ? s2.whatsappChats
        : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] })),
      ...(openChat ? { whatsappChatModalOpen: true } : {}),
    }));
    try {
      localStorage.setItem('singular_whatsapp_connected', 'true');
      await api.connectWhatsapp().catch(() => {});
    } catch (e) {}
    addToast({ title: 'WhatsApp Conectado', message: 'Sessão vinculada com sucesso.', accent: '#25D366' });
  }

  async function handleDisconnectWhatsapp() {
    setState({ whatsappConnected: false, whatsappChatModalOpen: false, whatsappQrModalOpen: false });
    try {
      localStorage.setItem('singular_whatsapp_connected', 'false');
      await api.disconnectWhatsapp().catch(() => {});
    } catch (e) {}
    addToast({ title: 'WhatsApp Desconectado', message: 'Sessão do WhatsApp encerrada.', accent: '#e5847c' });
  }

  function openWhatsappChat() {
    setState((s2) => ({
      whatsappChatModalOpen: true,
      whatsappChats: (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
        ? s2.whatsappChats
        : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] })),
    }));
  }

  function sendWhatsappMessage() {
    const text = whatsappMessageDraft.trim();
    if (!text || !whatsappActiveChatId) return;
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const newMsg = {
      id: 'm_' + Date.now(),
      text,
      sender: 'me',
      timestamp: timeStr,
      status: 'sent',
    };

    setState((s2) => {
      const baseChats = (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
        ? s2.whatsappChats
        : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] }));
      const updatedChats = baseChats.map((c) => {
        if (c.id === s2.whatsappActiveChatId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg],
          };
        }
        return c;
      });
      return {
        whatsappChats: updatedChats,
        whatsappMessageDraft: '',
        whatsappEmojiPickerOpen: false,
      };
    });

    // Auto reply simulation after 1.2s
    const activeChat = safeWhatsappChats.find((c) => c.id === whatsappActiveChatId);
    if (activeChat) {
      setTimeout(() => {
        const replyTime = new Date();
        const replyTimeStr = String(replyTime.getHours()).padStart(2, '0') + ':' + String(replyTime.getMinutes()).padStart(2, '0');
        const replyReplies = [
          'Perfeito, já verifiquei no Singular Scrum e está 100%!',
          'Excelente! Acabei de atualizar os cards da sprint.',
          'Combinado! Obrigado pelo feedback rápido.',
          'Show de bola, seguimos acompanhando pelo Kanban.',
          'Tudo certo, te aviso assim que concluir a próxima tarefa.',
        ];
        const randomReply = replyReplies[Math.floor(Math.random() * replyReplies.length)];
        const replyMsg = {
          id: 'm_' + Date.now(),
          text: randomReply,
          sender: 'contact',
          author: activeChat.isGroup ? activeChat.name.split(' ')[0] : undefined,
          timestamp: replyTimeStr,
          status: 'received',
        };
        setState((s2) => {
          const currentChats = (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
            ? s2.whatsappChats
            : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] }));
          return {
            whatsappChats: currentChats.map((c) => {
              if (c.id === activeChat.id) {
                return {
                  ...c,
                  messages: [...(c.messages || []), replyMsg],
                };
              }
              return c;
            }),
          };
        });
      }, 1200);
    }
  }

  // ---------- effects ----------
  useEffect(() => {
    const handleResize = () => setState({ isMobile: window.innerWidth < 768 });
    handleResize();
    window.addEventListener('resize', handleResize);
    try {
      if (localStorage.getItem('singular_player_repeat') === 'true') setState({ repeat: true });
      if (localStorage.getItem('singular_whatsapp_connected') === 'true') setState({ whatsappConnected: true });
      const savedVol = localStorage.getItem('singular_player_volume');
      if (savedVol !== null && !isNaN(Number(savedVol))) {
        setState({ volume: Number(savedVol) });
      }
    } catch (e) {}
    window.onYouTubeIframeAPIReady = () => initYTPlayer();
    return () => {
      window.removeEventListener('resize', handleResize);
      if (bgResizeRef.current) window.removeEventListener('resize', bgResizeRef.current);
      if (bgRafRef.current) cancelAnimationFrame(bgRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate from the Node.js backend on first load. If it's unreachable (or not
  // started yet) the app keeps working off the local seed data in `initialState`.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getUsers(),
      api.getTasks(),
      api.getSongs(),
      api.getPlaylists(),
      api.getWhatsappStatus().catch(() => null),
    ])
      .then(([usersRes, tasksRes, songsRes, playlistsRes, waRes]) => {
        if (cancelled) return;
        setState({
          ...(usersRes?.length ? { users: usersRes } : {}),
          ...(tasksRes?.length ? { tasks: tasksRes } : {}),
          ...(songsRes?.length ? { songs: songsRes } : {}),
          ...(playlistsRes?.length ? { playlists: playlistsRes } : {}),
          ...(waRes && waRes.connected !== undefined ? { whatsappConnected: waRes.connected } : {}),
        });
      })
      .catch(() => console.warn('Backend unreachable — running on local seed data. Start it with `npm run dev` inside backend/.'));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (view === 'login') startBgAnim();
    else if (view === 'app') loadYTScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ---------- derived values (equivalent to the design's renderVals) ----------
  const th = THEMES[mainTheme];
  const ringOff = 'transparent';
  const t = STRINGS[lang];
  const appT = APP_STRINGS[lang];
  const activeBg = '#2a8c97';
  const currentUser = users.find((u) => u.id === route) || users[0];
  const allUserTasks = tasks.filter((tk) => tk.userId === route);
  const projectOptions = [...new Set(allUserTasks.map((tk) => tk.projeto))];
  const safeWhatsappChats = (Array.isArray(whatsappChats) && whatsappChats.length > 0)
    ? whatsappChats
    : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [...c.messages] }));

  function parseBR(str) {
    if (!str) return null;
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  const q = searchQuery.trim().toLowerCase();
  const userTasksRaw = allUserTasks.filter((tk) => {
    if (q) {
      const hay = [tk.titulo, tk.projeto, tk.tarefa, tk.detalhes, tk.criadoEm, tk.prazo || '', appT.statusLabels[tk.status]].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filterProjeto && tk.projeto !== filterProjeto) return false;
    if (filterDateFrom || filterDateTo) {
      const d = parseBR(tk.criadoEm);
      if (!d) return false;
      if (filterDateFrom && d < new Date(filterDateFrom)) return false;
      if (filterDateTo && d > new Date(filterDateTo + 'T23:59:59')) return false;
    }
    return true;
  });

  function decorateTask(tk) {
    const openDetails = () => setState({ detailsTaskId: tk.id });
    const openAction = () =>
      setState({ actionTaskId: tk.id, draftTitulo: tk.titulo, draftPrazo: tk.prazo || '', draftStatus: tk.status, draftUserId: tk.userId, draftConcluida: !!tk.concluida });
    return {
      ...tk,
      prazoLabel: tk.prazo || appT.inexistente,
      prazoColor: tk.prazo ? th.muted : th.surfaceMuted,
      prazoStyle: tk.prazo ? 'normal' : 'italic',
      statusLabel: appT.statusLabels[tk.status],
      statusColor: (STATUS_DEFS.find((d) => d.id === tk.status) || {}).color || '#64748b',
      userName: (users.find((u) => u.id === tk.userId) || {}).name || '',
      notConcluida: !tk.concluida,
      cardOpacity: tk.concluida ? 0.16 : 1,
      rowOpacity: tk.concluida ? 0.3 : 1,
      cardClick: tk.concluida ? openDetails : openAction,
      openDetails,
      openAction,
    };
  }

  const userTasks = userTasksRaw.map(decorateTask);
  const kanbanColumns = STATUS_DEFS.map((sd) => {
    const colTasks = userTasks.filter((tk) => tk.status === sd.id);
    return { id: sd.id, label: appT.statusLabels[sd.id], color: sd.color, count: colTasks.length, tasks: colTasks };
  });

  const detailsTaskRaw = tasks.find((tk) => tk.id === detailsTaskId);
  const detailsTask = detailsTaskRaw
    ? decorateTask(detailsTaskRaw)
    : { titulo: '', detalhes: '', projeto: '', tarefa: '', criadoEm: '', prazoLabel: '', statusLabel: '', statusColor: '', userName: '', concluida: false };

  const statusOptions = STATUS_DEFS.map((sd) => ({
    id: sd.id,
    label: appT.statusLabels[sd.id],
    bg: draftStatus === sd.id ? sd.color : th.toolbarBtnBg,
    color: draftStatus === sd.id ? '#052226' : th.toolbarIcon,
    select: () => setState({ draftStatus: sd.id }),
  }));
  const userOptions = users.map((u) => ({
    ...u,
    bg: draftUserId === u.id ? '#2a8c97' : th.toolbarBtnBg,
    color: draftUserId === u.id ? '#fff' : th.toolbarIcon,
    select: () => setState({ draftUserId: u.id }),
  }));

  const navUsers = users.map((u) => ({
    ...u,
    bg: route === u.id ? activeBg : 'transparent',
    color: route === u.id ? '#fff' : th.surfaceSubtle,
    select: () => {
      if (route === u.id) return;
      const curIdx = users.findIndex((x) => x.id === route);
      const nextIdx = users.findIndex((x) => x.id === u.id);
      const isMovingDown = nextIdx > curIdx;

      // 1. Exit animation: Slide up out if moving down, slide down out if moving up
      setState({
        contentOpacity: 0,
        contentTransform: isMovingDown ? 'translateY(-22px)' : 'translateY(22px)',
        contentTransition: 'opacity 0.14s ease, transform 0.14s ease',
      });

      setTimeout(() => {
        // 2. Switch route and stage the new content at opposite offset without transition
        setState({
          route: u.id,
          mobileSidebarOpen: false,
          contentOpacity: 0,
          contentTransform: isMovingDown ? 'translateY(26px)' : 'translateY(-26px)',
          contentTransition: 'none',
        });

        // 3. Slide up in / slide down in to center position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setState({
              contentOpacity: 1,
              contentTransform: 'translateY(0)',
              contentTransition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            });
          });
        });
      }, 140);
    },
  }));

  const pageSize = 6;
  const q2 = redirectSearch.trim().toLowerCase();
  const filteredSongs = songs.filter((sg) => !q2 || (sg.titulo + ' ' + sg.addedBy).toLowerCase().includes(q2));
  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / pageSize));
  const redirectPageClamped = Math.min(redirectPage, totalPages - 1);
  const pagedSongs = filteredSongs.slice(redirectPageClamped * pageSize, redirectPageClamped * pageSize + pageSize).map((sg) => ({
    ...sg,
    thumb: 'https://img.youtube.com/vi/' + sg.videoId + '/default.jpg',
    playAudio: () => loadSong(sg.id),
    playVideo: () => loadSong(sg.id, { video: true }),
    btnOpacity: playerUnavailable ? 0.35 : 1,
    btnPointer: playerUnavailable ? 'none' : 'auto',
  }));
  const pageLabel = redirectPageClamped + 1 + ' / ' + totalPages;

  const decoratedPlaylists = playlists.map((pl) => ({
    ...pl,
    bg: currentPlaylistId === pl.id ? '#2a8c97' : th.hoverBg,
    color: currentPlaylistId === pl.id ? '#fff' : th.surfaceText,
    border: currentPlaylistId === pl.id ? '#2a8c97' : th.surfaceBorder,
    count: pl.songIds.length + (lang === 'pt' ? ' músicas' : ' songs'),
    select: () => {
      setState({ currentPlaylistId: pl.id, playlistModalOpen: false });
      if (pl.songIds[0]) loadSong(pl.songIds[0], { keepPlaylist: true });
    },
  }));

  const songCheckOptions = songs.map((sg) => ({
    titulo: sg.titulo,
    checked: newPlaylistSongIds.includes(sg.id),
    toggle: () =>
      setState((s2) => ({
        newPlaylistSongIds: s2.newPlaylistSongIds.includes(sg.id)
          ? s2.newPlaylistSongIds.filter((x) => x !== sg.id)
          : [...s2.newPlaylistSongIds, sg.id],
      })),
  }));

  const currentSong = songs.find((sg) => sg.id === currentSongId);
  const currentSongTitle = currentSong ? currentSong.titulo : appT.noSongLabel;
  const currentSongAddedBy = currentSong ? currentSong.addedBy : '';
  const currentSongThumb = currentSong ? 'https://img.youtube.com/vi/' + currentSong.videoId + '/default.jpg' : '';

  const ptBg = lang === 'pt' ? '#2a8c97' : 'transparent';
  const ptColor = lang === 'pt' ? '#fff' : 'rgba(255,255,255,0.5)';
  const enBg = lang === 'en' ? '#2a8c97' : 'transparent';
  const enColor = lang === 'en' ? '#fff' : 'rgba(255,255,255,0.5)';
  const rememberBg = remember ? '#2a8c97' : 'rgba(255,255,255,0.15)';
  const rememberJustify = remember ? 'flex-end' : 'flex-start';
  const slideX = fadeOpacity === 1 ? '0px' : '-16px';

  const burgerDisplay = isMobile ? 'flex' : 'none';
  const sidebarTransform = isMobile ? (mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)';
  const mainMarginLeft = isMobile ? '0px' : '260px';

  const ringDark = mainTheme === 'dark' ? '#4fd1de' : ringOff;
  const ringPorcelain = mainTheme === 'porcelain' ? '#4fd1de' : ringOff;
  const ringSepia = mainTheme === 'sepia' ? '#4fd1de' : ringOff;

  const kanbanViewBg = boardView === 'kanban' ? '#2a8c97' : 'transparent';
  const kanbanViewColor = boardView === 'kanban' ? '#fff' : th.toolbarIcon;
  const tableViewBg = boardView === 'table' ? '#2a8c97' : 'transparent';
  const tableViewColor = boardView === 'table' ? '#fff' : th.toolbarIcon;

  const notifBg = notifications ? '#2a8c97' : 'rgba(255,255,255,0.15)';
  const notifJustify = notifications ? 'flex-end' : 'flex-start';

  const repeatBg = repeat ? '#2a8c97' : th.hoverBg;
  const repeatColor = repeat ? '#fff' : th.surfaceText;
  const shuffleBg = shuffle ? '#2a8c97' : th.hoverBg;
  const shuffleColor = shuffle ? '#fff' : th.surfaceText;
  const playBtnOpacity = playerUnavailable ? 0.35 : 1;
  const playBtnPointer = playerUnavailable ? 'none' : 'auto';

  const chevronRotate = userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)';

  const playerBoxStyle = videoModalOpen
    ? {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 480, height: 320, minWidth: 280, minHeight: 200, resize: 'both', overflow: 'hidden',
        background: '#000', borderRadius: 12, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', zIndex: 70,
        border: '1px solid rgba(255,255,255,0.15)',
      }
    : { position: 'fixed', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none', left: -9999, top: -9999 };

  const langSwitch = (
    <>
      <button onClick={() => changeLang('pt')} style={s(`border:none;cursor:pointer;padding:5px 10px;border-radius:5px;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:0.03em;background:${ptBg};color:${ptColor}`)}>PT</button>
      <button onClick={() => changeLang('en')} style={s(`border:none;cursor:pointer;padding:5px 10px;border-radius:5px;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:0.03em;background:${enBg};color:${enColor}`)}>EN</button>
    </>
  );

  return (
    <div style={s(`position:relative;width:100%;min-height:100vh;overflow-y:auto;background:${view === 'app' ? th.pageBg : '#050f13'};font-family:${FONT}`)}>
      {view === 'login' && (
        <>
          <canvas ref={bgCanvasRef} style={s('position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0')} />
          <div style={s('position:fixed;inset:0;z-index:1;background:linear-gradient(180deg, rgba(5,15,19,0.15) 0%, rgba(5,15,19,0.1) 40%, rgba(5,15,19,0.55) 100%);pointer-events:none')} />
          <div style={s('position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px 70px')}>
            <div style={s('position:relative;width:440px;max-width:100%;background:rgba(8,22,27,0.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(79,209,222,0.25);border-radius:20px;padding:40px 40px 36px;box-shadow:0 0 0 1px rgba(79,209,222,0.15), 0 0 45px rgba(63,199,212,0.35), 0 30px 60px rgba(0,0,0,0.45)')}>
              <div style={s('position:absolute;top:20px;right:20px;display:flex;gap:2px;background:rgba(255,255,255,0.06);border:0px;border-radius:5px;padding:2px')}>
                {langSwitch}
              </div>

              <div style={s('display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px')}>
                <img src="/singular-selo-1c.png" alt="Singular" style={s('width:40px;height:40px;object-fit:contain')} />
                <h1 style={s('margin:0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:0.06em')}>SINGULAR</h1>
              </div>

              <div style={{ ...s('margin-top:22px'), transition: 'opacity 0.25s ease, transform 0.25s ease', opacity: fadeOpacity, transform: `translateX(${slideX})` }}>
                <div style={s('position:relative;margin-bottom:16px')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={s('position:absolute;left:16px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder={t.loginPlaceholder}
                    value={login}
                    onChange={(e) => setState({ login: e.target.value })}
                    style={s(`width:100%;box-sizing:border-box;padding:15px 16px 15px 44px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14.5px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div style={s('position:relative;margin-bottom:18px')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={s('position:absolute;left:16px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setState({ password: e.target.value })}
                    style={s(`width:100%;box-sizing:border-box;padding:15px 44px 15px 44px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14.5px;font-family:${FONT};outline:none`)}
                  />
                  <Hoverable
                    onClick={() => setState((s2) => ({ showPassword: !s2.showPassword }))}
                    aria-label="Toggle password visibility"
                    base={s('position:absolute;right:14px;top:50%;transform:translateY(-50%) scale(1);background:none;border:none;cursor:pointer;padding:0;color:rgba(255,255,255,0.5);display:flex;align-items:center;transition:transform 0.15s ease')}
                    hover={{ transform: 'translateY(-50%) scale(1.2)' }}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-10-8-10-8a18.6 18.6 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </Hoverable>
                </div>

                <div style={s('display:flex;align-items:center;margin-bottom:26px;padding:0 2px')}>
                  <div style={s('display:flex;align-items:center;gap:10px')}>
                    <button
                      onClick={() => setState((s2) => ({ remember: !s2.remember }))}
                      aria-label="Remember me"
                      style={s(`width:34px;height:19px;border-radius:999px;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;background:${rememberBg};justify-content:${rememberJustify};transition:background 0.15s`)}
                    >
                      <span style={s('width:15px;height:15px;border-radius:50%;background:#fff;display:block;box-shadow:0 1px 2px rgba(0,0,0,0.3)')}></span>
                    </button>
                    <span style={s('color:rgba(255,255,255,0.75);font-size:13.5px')}>{t.remember}</span>
                  </div>
                </div>

                <Hoverable
                  onClick={() => setState({ view: 'app' })}
                  base={s(`width:100%;padding:16px;border:none;border-radius:5px;background:#2a8c97;color:#fff;font-size:15.5px;font-weight:600;cursor:pointer;font-family:${FONT}`)}
                  hover={{ background: '#236f78' }}
                >
                  {t.submit}
                </Hoverable>
              </div>
            </div>

            <div style={{ transition: 'opacity 0.25s ease, transform 0.25s ease', opacity: fadeOpacity, transform: `translateX(${slideX})` }}>
              <p style={s('margin:28px 0 0;text-align:center;color:rgba(255,255,255,0.4);font-size:12.5px;padding:0 16px')}>{t.footer}</p>
            </div>
          </div>
        </>
      )}

      {view === 'app' && (
        <div style={s(`min-height:100vh;background:${th.pageBg}`)}>
          {isMobile && mobileSidebarOpen && (
            <div onClick={() => setState({ mobileSidebarOpen: false })} style={s('position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:29')}></div>
          )}

          <header style={s(`position:fixed;top:0;left:0;right:0;height:64px;z-index:30;background:${th.surfaceBg};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid ${th.surfaceBorder};display:flex;align-items:center;gap:14px;padding:0 20px`)}>
            <Hoverable
              as="button"
              onClick={() => setState((s2) => ({ mobileSidebarOpen: !s2.mobileSidebarOpen }))}
              aria-label="Menu"
              base={{ ...s(`background:none;border:none;cursor:pointer;padding:6px;color:${th.surfaceText};transition:transform 0.15s ease`), display: burgerDisplay }}
              hover={{ transform: 'scale(1.15)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Hoverable>
            <img src="/singular-selo-1c.png" alt="Singular" style={s('width:28px;height:28px;object-fit:contain')} />
            <span style={s(`color:${th.surfaceText};font-size:16px;font-weight:700;letter-spacing:0.05em`)}>SINGULAR</span>
            <div style={s('flex:1')}></div>
            <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:5px;padding:2px`)}>{langSwitch}</div>
          </header>

          <nav style={s(`position:fixed;top:64px;bottom:0;left:0;width:260px;z-index:30;background:${th.surfaceBg};border-right:1px solid ${th.surfaceBorder};padding:20px 14px 14px;box-sizing:border-box;transform:${sidebarTransform};transition:transform 0.25s ease;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden`)}>
            <div style={s('flex:1;min-height:0;overflow-y:auto;margin-bottom:12px;padding-right:2px')}>
              <div style={s(`color:${th.surfaceMuted};font-size:11px;letter-spacing:0.12em;font-weight:600;padding:0 10px 10px`)}>{appT.navLabel}</div>
              {navUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={u.select}
                  style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${u.bg};color:${u.color};font-family:${FONT};font-size:14px;text-align:left;transition:background 0.2s ease, color 0.2s ease, transform 0.2s ease;transform:${route === u.id ? 'translateX(4px)' : 'translateX(0)'}`)}
                >
                  <span style={s(`width:26px;height:26px;border-radius:50%;background:${u.avatarBg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0;transition:transform 0.2s ease;transform:${route === u.id ? 'scale(1.08)' : 'scale(1)'}`)}>{u.initials}</span>
                  <span style={{ fontWeight: route === u.id ? '600' : '400', transition: 'font-weight 0.2s ease' }}>{u.name}</span>
                </button>
              ))}
            </div>

            <div style={s(`flex-shrink:0;border-top:1px solid ${th.surfaceBorder};padding-top:12px;display:flex;flex-direction:column`)}>
              {/* WhatsApp Widget */}
              {!whatsappConnected ? (
                <div style={s(`padding:0 4px 10px;margin-bottom:8px;border-bottom:1px solid ${th.surfaceBorder};display:flex;flex-direction:column;gap:6px`)}>
                  <button
                    onClick={openWhatsappQR}
                    style={s(`width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:8px;background:transparent;color:${th.surfaceText};border:1px solid ${th.surfaceBorder};font-family:${FONT};font-size:12.5px;font-weight:600;cursor:pointer;transition:all 0.18s ease`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = th.hoverBg;
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = th.surfaceBorder;
                    }}
                  >
                    <span>Conect Me</span>
                  </button>

                  <button
                    onClick={() => handleConnectWhatsapp(true)}
                    style={s(`width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:6px;background:rgba(42,140,151,0.14);color:#4fd1de;border:1px dashed rgba(79,209,222,0.35);font-family:${FONT};font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s ease`)}
                    title="Simula conexão imediata e abre o layout da conversa (Dev)"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(42,140,151,0.26)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(42,140,151,0.14)';
                    }}
                  >
                    <span>⚡ Simular Conexão (Dev)</span>
                  </button>
                </div>
              ) : (
                <div style={s(`padding:0 4px 10px;margin-bottom:8px;border-bottom:1px solid ${th.surfaceBorder};display:flex;flex-direction:column;gap:6px`)}>
                  <div style={s('display:flex;align-items:center;justify-content:space-between;padding:0 2px')}>
                    <div style={s('display:flex;align-items:center;gap:6px')}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 8px #25D366', display: 'inline-block' }} />
                      <span style={{ color: '#25D366', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.02em' }}>{appT.whatsappConnected || 'WhatsApp Conectado'}</span>
                    </div>
                  </div>
                  <div style={s('display:flex;gap:6px')}>
                    <button
                      onClick={openWhatsappChat}
                      style={s(`flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 10px;border-radius:8px;background:#25D366;color:#ffffff;border:none;font-family:${FONT};font-size:11.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(37,211,102,0.3);transition:all 0.15s ease`)}
                      title="Abrir interface WhatsApp"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span>{appT.whatsappOpen || 'Abrir'}</span>
                    </button>
                    <button
                      onClick={handleDisconnectWhatsapp}
                      style={s(`padding:6px 9px;border-radius:8px;background:rgba(248,113,113,0.12);color:#f87171;border:1px solid rgba(248,113,113,0.25);font-family:${FONT};font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s ease`)}
                      title="Desconectar WhatsApp"
                    >
                      {appT.whatsappDisconnect || 'Desconectar'}
                    </button>
                  </div>
                </div>
              )}

              <div style={s('padding:0 4px 10px')}>
                {currentSongId ? (
                  <div style={s('margin-bottom:8px')}>
                    <div style={{ color: th.surfaceText, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{currentSongTitle}</div>
                    {currentSongAddedBy && (
                      <div style={{ color: th.surfaceMuted, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{currentSongAddedBy}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: th.surfaceMuted, fontSize: 11, marginBottom: 8 }}>{appT.noSongLabel}</div>
                )}

                <div style={s('display:flex;align-items:center;justify-content:space-between;gap:4px')}>
                  <button onClick={toggleRepeat} title={repeat ? 'Repetição ativada' : 'Repetir'} style={s(`background:${repeatBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${repeatColor};cursor:pointer;transition:all 0.15s`)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="17,1 21,5 17,9"></polyline><path d="M3 11V9a4 4 0 014-4h14"></path>
                      <polyline points="7,23 3,19 7,15"></polyline><path d="M21 13v2a4 4 0 01-4 4H3"></path>
                    </svg>
                  </button>

                  <button onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Tocar'} style={s(`background:#2a8c97;border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;opacity:${playBtnOpacity};pointer-events:${playBtnPointer};transition:transform 0.15s`)}>
                    {isPlaying ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>
                    )}
                  </button>

                  <button onClick={() => setState((s2) => ({ videoModalOpen: !s2.videoModalOpen }))} title={videoModalOpen ? 'Fechar vídeo' : 'Expandir vídeo'} style={s(`background:${videoModalOpen ? '#2a8c97' : 'rgba(255,255,255,0.08)'};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${videoModalOpen ? '#fff' : 'rgba(255,255,255,0.85)'};cursor:pointer;transition:all 0.15s`)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                  </button>

                  <button onClick={() => setState({ playlistModalOpen: true })} title="Playlists" style={s(`background:${th.toolbarBtnBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;transition:all 0.15s`)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>

                  <div
                    onMouseEnter={() => setState({ volumeHover: true })}
                    onMouseLeave={() => setState({ volumeHover: false })}
                    style={s('position:relative;display:flex;align-items:center')}
                  >
                    {volumeHover && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          right: 0,
                          background: th.modalBg,
                          border: `1px solid ${th.surfaceBorder}`,
                          borderRadius: 8,
                          padding: '8px 10px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          zIndex: 50,
                          animation: 'fadeInSoft 0.15s ease both',
                        }}
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => changeVolume(e.target.value)}
                          style={{
                            width: 80,
                            height: 4,
                            accentColor: '#2a8c97',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ color: th.surfaceText, fontSize: 11, fontWeight: 600, minWidth: 28, textAlign: 'right' }}>
                          {isMuted ? '0%' : `${volume}%`}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={toggleMute}
                      title={isMuted || volume === 0 ? 'Desmutar' : `Volume (${volume}%)`}
                      style={s(`background:${isMuted || volume === 0 ? 'rgba(255,138,128,0.15)' : th.toolbarBtnBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${isMuted || volume === 0 ? '#ff8a80' : th.surfaceText};cursor:pointer;transition:all 0.15s`)}
                    >
                      {isMuted || volume === 0 ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : volume < 50 ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {playerUnavailable && (
                  <div style={s('color:rgba(255,138,128,0.75);font-size:9.5px;line-height:1.3;margin-top:6px')}>{appT.playerUnavailableNote}</div>
                )}
              </div>

              {/* Animated User Menu (Expands between Player and User Name button) */}
              <div style={{
                maxHeight: userMenuOpen ? '100px' : '0px',
                opacity: userMenuOpen ? 1 : 0,
                transform: userMenuOpen ? 'translateY(0)' : 'translateY(6px)',
                overflow: 'hidden',
                transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease, transform 0.25s ease, margin 0.25s ease',
                marginBottom: userMenuOpen ? 8 : 0,
                background: th.modalBg,
                border: userMenuOpen ? `1px solid ${th.surfaceBorder}` : '1px solid transparent',
                borderRadius: 10,
              }}>
                <Hoverable
                  onClick={() => { setState({ userMenuOpen: false, settingsModalOpen: true }); }}
                  base={s(`width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:none;cursor:pointer;color:${th.surfaceText};font-family:${FONT};font-size:13px;text-align:left`)}
                  hover={{ background: th.hoverBg }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09A1.65 1.65 0 0015 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.23.5.7.85 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>
                  {appT.settingsLabel}
                </Hoverable>
                <Hoverable
                  onClick={() => { setState({ userMenuOpen: false, logoutModalOpen: true }); }}
                  base={s(`width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:none;cursor:pointer;color:#ff8a80;font-family:${FONT};font-size:13px;text-align:left`)}
                  hover={{ background: th.hoverBg }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path><polyline points="16,17 21,12 16,7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  {appT.logoutLabel}
                </Hoverable>
              </div>

              {/* User Name Card */}
              <div style={s(`border-top:1px solid ${th.surfaceBorder};padding-top:8px`)}>
                <Hoverable
                  onClick={() => setState((s2) => ({ userMenuOpen: !s2.userMenuOpen }))}
                  base={s(`width:100%;display:flex;align-items:center;gap:10px;padding:8px 8px;border:none;border-radius:8px;background:none;cursor:pointer;color:${th.surfaceText};font-family:${FONT}`)}
                  hover={{ background: th.hoverBg }}
                >
                  <span style={s('width:30px;height:30px;border-radius:50%;background:#2a8c97;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0')}>CM</span>
                  <span style={s('font-size:13.5px;font-weight:600;text-align:left;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>Caio Marques</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.25s ease', transform: chevronRotate, flexShrink: 0 }}>
                    <polyline points="18,15 12,9 6,15"></polyline>
                  </svg>
                </Hoverable>
              </div>
            </div>
          </nav>

          <main style={s(`padding:64px 0 60px;margin-left:${mainMarginLeft};max-width:100%;transition:margin-left 0.25s ease, background-color 0.2s ease;background:${th.bg};min-height:100vh;box-sizing:border-box;border-top-left-radius:24px`)}>
            <div style={s(`display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:22px 32px;background:${th.toolbarBg};border-bottom:1px solid ${th.toolbarBorder}`)}>
              <button onClick={() => setState({ mainTheme: 'dark' })} title="Tema escuro" style={s(`width:22px;height:22px;border-radius:50%;background:#050f13;border:2px solid ${ringDark};cursor:pointer;padding:0`)}></button>
              <button onClick={() => setState({ mainTheme: 'porcelain' })} title="Fundo porcelana" style={s(`width:22px;height:22px;border-radius:50%;background:#faf9f6;border:2px solid ${ringPorcelain};cursor:pointer;padding:0`)}></button>
              <button onClick={() => setState({ mainTheme: 'sepia' })} title="Fundo amarelado" style={s(`width:22px;height:22px;border-radius:50%;background:#f5ecd7;border:2px solid ${ringSepia};cursor:pointer;padding:0`)}></button>

              <div style={s(`width:1px;height:20px;background:${th.toolbarBorder};margin:0 4px`)}></div>

              <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:7px;padding:2px`)}>
                <button onClick={() => setState({ boardView: 'kanban' })} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:6px 12px;border-radius:6px;font-family:${FONT};font-size:12.5px;font-weight:700;background:${kanbanViewBg};color:${kanbanViewColor}`)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="6" height="16" rx="1"></rect><rect x="10" y="4" width="6" height="10" rx="1"></rect><rect x="17" y="4" width="4" height="7" rx="1"></rect></svg>
                  {appT.viewKanban}
                </button>
                <button onClick={() => setState({ boardView: 'table' })} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:6px 12px;border-radius:6px;font-family:${FONT};font-size:12.5px;font-weight:700;background:${tableViewBg};color:${tableViewColor}`)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  {appT.viewTable}
                </button>
              </div>

              <button onClick={() => setState({ redirectModalOpen: true })} style={s(`display:flex;align-items:center;gap:6px;background:${th.toolbarBtnBg};border:none;border-radius:7px;padding:7px 14px;color:${th.toolbarIcon};cursor:pointer;font-family:${FONT};font-size:12.5px;font-weight:700`)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 6"></path><path d="M14 11a5 5 0 00-7.07 0l-1.41 1.41a5 5 0 007.07 7.07L14 18"></path></svg>
                {appT.redirectButton}
              </button>
            </div>

            <div style={{ ...s('padding:32px 32px 0'), opacity: contentOpacity, transform: contentTransform, transition: contentTransition }}>
              <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px')}>
                <div>
                  <h1 style={s(`margin:0 0 6px;color:${th.text};font-size:28px;font-weight:700`)}>{currentUser.name}</h1>
                  <p style={s(`margin:0;color:${th.muted};font-size:14px`)}>{userTasksRaw.length + ' ' + appT.tasksAssigned}</p>
                </div>
                <div style={s('display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;justify-content:flex-end;min-width:280px')}>
                  <div style={s('position:relative;flex:1;min-width:200px;max-width:320px')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.muted} strokeWidth="2" style={s('position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                      <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setState({ searchQuery: e.target.value })}
                      placeholder={appT.searchPlaceholder}
                      style={s(`width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12.5px;font-family:${FONT};outline:none`)}
                    />
                  </div>
                  <select
                    value={filterProjeto}
                    onChange={(e) => setState({ filterProjeto: e.target.value })}
                    style={{ ...s(`padding:9px 10px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12.5px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }}
                  >
                    <option value="">{appT.allProjects}</option>
                    {projectOptions.map((proj) => (
                      <option key={proj} value={proj}>{proj}</option>
                    ))}
                  </select>
                  <input type="date" value={filterDateFrom} onChange={(e) => setState({ filterDateFrom: e.target.value })} style={{ ...s(`padding:8px 10px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }} />
                  <input type="date" value={filterDateTo} onChange={(e) => setState({ filterDateTo: e.target.value })} style={{ ...s(`padding:8px 10px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }} />
                </div>
              </div>

              <div>
                {boardView === 'kanban' && (
                  <div style={s('display:flex;gap:16px;overflow-x:auto;padding-bottom:40px')}>
                    {kanbanColumns.map((col) => (
                      <div key={col.id} style={s('flex:0 0 250px;display:flex;flex-direction:column;gap:12px')}>
                        <div style={s('display:flex;align-items:center;justify-content:space-between;padding:0 4px')}>
                          <span style={s(`display:flex;align-items:center;gap:6px;color:${th.text};font-size:12.5px;font-weight:700;letter-spacing:0.03em`)}>
                            <span style={s(`width:8px;height:8px;border-radius:50%;background:${col.color};flex-shrink:0`)}></span>
                            {col.label}
                          </span>
                          <span style={s(`color:${th.muted};font-size:11.5px;background:${th.cardBg};padding:2px 8px;border-radius:999px`)}>{col.count}</span>
                        </div>
                        {col.tasks.map((task) => (
                          <Hoverable
                            key={task.id}
                            as="div"
                            onClick={task.cardClick}
                            base={s(`position:relative;background:${th.cardBg};border:1px solid ${th.cardBorder};border-left:3px solid ${task.statusColor};border-radius:10px;padding:14px;cursor:pointer;overflow:hidden`)}
                            hover={{ borderColor: th.accent }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity: task.cardOpacity }}>
                              <span style={s(`color:${th.muted};font-size:10.5px;text-transform:uppercase;letter-spacing:0.04em`)}>{task.projeto}</span>
                              <span style={s(`color:${th.text};font-size:14px;font-weight:600;line-height:1.3`)}>{task.titulo}</span>
                              <span style={s(`color:${th.muted};font-size:12px;margin-bottom:6px`)}>{task.tarefa}</span>
                              <span style={{ color: task.prazoColor, fontSize: 11, fontStyle: task.prazoStyle }}>{task.prazoLabel}</span>
                            </div>
                            {task.concluida && (
                              <div style={s('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,0.3)')}>👁</div>
                            )}
                          </Hoverable>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {boardView === 'table' && (
                  <div style={s('overflow-x:auto;padding-bottom:40px')}>
                    <table style={s('width:100%;border-collapse:collapse;background:transparent;min-width:760px')}>
                      <thead>
                        <tr>
                          {[appT.colTitulo, appT.colProjeto, appT.colTarefa, appT.colDetalhes, appT.colCriadoEm, appT.colPrazo, appT.colStatus, appT.colAcoes].map((label, i) => (
                            <th key={i} style={s(`text-align:left;padding:0 12px 10px;color:${th.muted};font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${th.cardBorder}`)}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {userTasks.map((task) => (
                          <tr key={task.id} style={s(`border-bottom:1px solid ${th.cardBorder}`)}>
                            <td style={{ padding: '14px 12px 14px 4px', color: th.text, fontSize: 13.5, fontWeight: 600, opacity: task.rowOpacity }}>{task.titulo}</td>
                            <td style={{ padding: '14px 12px', color: th.muted, fontSize: 13, opacity: task.rowOpacity }}>{task.projeto}</td>
                            <td style={{ padding: '14px 12px', color: th.muted, fontSize: 13, opacity: task.rowOpacity }}>{task.tarefa}</td>
                            <td style={{ padding: '14px 12px', opacity: task.rowOpacity }}>
                              <button onClick={task.openDetails} style={s(`background:none;border:none;color:${th.accent};cursor:pointer;font-size:13px;font-weight:600;padding:0;text-decoration:underline;font-family:${FONT}`)}>{appT.verDetalhes}</button>
                            </td>
                            <td style={{ padding: '14px 12px', color: th.muted, fontSize: 12.5, opacity: task.rowOpacity }}>{task.criadoEm}</td>
                            <td style={{ padding: '14px 12px', color: task.prazoColor, fontSize: 12.5, fontStyle: task.prazoStyle, opacity: task.rowOpacity }}>{task.prazoLabel}</td>
                            <td style={{ padding: '14px 12px', opacity: task.rowOpacity }}>
                              <span style={s(`display:inline-block;background:${task.statusColor};color:#052226;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap`)}>{task.statusLabel}</span>
                            </td>
                            <td style={s('padding:14px 4px 14px 12px')}>
                              {task.concluida ? (
                                <button onClick={task.openDetails} aria-label="Ver" style={s(`background:${th.toolbarBtnBg};border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:${th.toolbarIcon};cursor:pointer;font-size:14px`)}>👁</button>
                              ) : (
                                <button onClick={task.openAction} aria-label="Ações" style={s(`background:${th.toolbarBtnBg};border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:${th.toolbarIcon};cursor:pointer;transition:transform 0.15s ease`)}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"></circle><circle cx="12" cy="12" r="1.8"></circle><circle cx="19" cy="12" r="1.8"></circle></svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>

          {detailsTaskId && (
            <div onClick={() => setState({ detailsTaskId: null })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:50;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={{ ...s(`width:440px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5)`), animation: 'slideUpIn 0.22s ease both' }}>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:18px')}>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{detailsTask.titulo}</h2>
                  <Hoverable onClick={() => setState({ detailsTaskId: null })} base={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};transition:transform 0.15s ease`)} hover={{ transform: 'scale(1.15)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </Hoverable>
                </div>
                <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px`)}>{appT.detailsLabel}</div>
                <p style={s(`margin:0 0 20px;color:${th.surfaceSubtle};font-size:14px;line-height:1.6`)}>{detailsTask.detalhes}</p>
                <div style={s('display:grid;grid-template-columns:1fr 1fr;gap:14px 20px')}>
                  {[
                    [appT.colProjeto, detailsTask.projeto],
                    [appT.colTarefa, detailsTask.tarefa],
                    [appT.colCriadoEm, detailsTask.criadoEm],
                    [appT.colPrazo, detailsTask.prazoLabel],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>{label}</div>
                      <div style={s(`color:${th.surfaceText};font-size:13.5px`)}>{val}</div>
                    </div>
                  ))}
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>{appT.fieldStatus}</div>
                    <span style={s(`display:inline-block;background:${detailsTask.statusColor};color:#052226;font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px`)}>{detailsTask.statusLabel}</span>
                  </div>
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>{appT.fieldResponsavel}</div>
                    <div style={s(`color:${th.surfaceText};font-size:13.5px`)}>{detailsTask.userName}</div>
                  </div>
                </div>
                {detailsTask.concluida && (
                  <Hoverable onClick={reactivateTask} base={s('margin-top:18px;padding:10px 16px;border-radius:5px;border:none;background:rgba(63,214,122,0.15);color:#7be3a0;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:600;width:100%')} hover={{ background: 'rgba(63,214,122,0.28)' }}>
                    {appT.reactivateLabel}
                  </Hoverable>
                )}
              </div>
            </div>
          )}

          {actionTaskId && (
            <div onClick={() => setState({ actionTaskId: null })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:50;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={{ ...s(`width:460px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;overflow-y:auto;box-sizing:border-box`), animation: 'slideUpIn 0.22s ease both' }}>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:20px')}>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.actionModalTitle}</h2>
                  <Hoverable onClick={() => setState({ actionTaskId: null })} base={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};transition:transform 0.15s ease`)} hover={{ transform: 'scale(1.15)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </Hoverable>
                </div>

                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:6px`)}>{appT.fieldTitulo}</label>
                <input value={draftTitulo} onChange={(e) => setState({ draftTitulo: e.target.value })} style={s(`width:100%;box-sizing:border-box;padding:11px 14px;border-radius:10px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13.5px;font-family:${FONT};outline:none;margin-bottom:16px`)} />

                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:6px`)}>{appT.fieldPrazo}</label>
                <input value={draftPrazo} onChange={(e) => setState({ draftPrazo: e.target.value })} placeholder={appT.prazoPlaceholder} style={s(`width:100%;box-sizing:border-box;padding:11px 14px;border-radius:10px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13.5px;font-family:${FONT};outline:none;margin-bottom:16px`)} />

                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:8px`)}>{appT.fieldStatus}</label>
                <div style={s('display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px')}>
                  {statusOptions.map((opt) => (
                    <button key={opt.id} onClick={opt.select} style={s(`border:none;cursor:pointer;padding:6px 12px;border-radius:999px;font-family:${FONT};font-size:12px;font-weight:600;background:${opt.bg};color:${opt.color}`)}>{opt.label}</button>
                  ))}
                </div>

                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:8px`)}>{appT.fieldResponsavel}</label>
                <div style={s('display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px')}>
                  {userOptions.map((uopt) => (
                    <button key={uopt.id} onClick={uopt.select} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:5px 12px 5px 5px;border-radius:999px;font-family:${FONT};font-size:12px;font-weight:600;background:${uopt.bg};color:${uopt.color}`)}>
                      <span style={s(`width:18px;height:18px;border-radius:50%;background:${uopt.avatarBg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700`)}>{uopt.initials}</span>
                      {uopt.name}
                    </button>
                  ))}
                </div>

                <label style={s(`display:flex;align-items:center;gap:8px;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:20px;cursor:pointer`)}>
                  <input type="checkbox" checked={draftConcluida} onChange={(e) => setState({ draftConcluida: e.target.checked })} />
                  {appT.completedLabel}
                </label>

                <div style={s('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
                  <Hoverable onClick={deleteTask} base={s('padding:10px 16px;border-radius:5px;border:none;background:rgba(192,67,60,0.15);color:#e5847c;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:600')} hover={{ background: 'rgba(192,67,60,0.28)' }}>
                    {appT.deleteLabel}
                  </Hoverable>
                  <div style={s('display:flex;gap:10px')}>
                    <button onClick={() => setState({ actionTaskId: null })} style={s(`padding:10px 18px;border-radius:5px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13.5px`)}>{appT.cancelLabel}</button>
                    <Hoverable onClick={saveTask} base={s('padding:10px 18px;border-radius:5px;border:none;background:#2a8c97;color:#fff;cursor:pointer;font-family:'+FONT+';font-size:13.5px;font-weight:600')} hover={{ background: '#236f78' }}>
                      {appT.saveLabel}
                    </Hoverable>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsModalOpen && (
            <div onClick={() => setState({ settingsModalOpen: false })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:50;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={s(`width:420px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5)`)}>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:20px')}>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:19px;font-weight:700`)}>{appT.settingsTitle}</h2>
                  <Hoverable onClick={() => setState({ settingsModalOpen: false })} base={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};transition:transform 0.15s ease`)} hover={{ transform: 'scale(1.15)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </Hoverable>
                </div>
                <div style={s(`display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${th.modalBorder}`)}>
                  <span style={s(`color:${th.surfaceSubtle};font-size:14px`)}>{appT.settingsLanguage}</span>
                  <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:5px;padding:2px`)}>{langSwitch}</div>
                </div>
                <div style={s('display:flex;align-items:center;justify-content:space-between;padding:12px 0')}>
                  <span style={s(`color:${th.surfaceSubtle};font-size:14px`)}>{appT.settingsNotifications}</span>
                  <button onClick={() => setState((s2) => ({ notifications: !s2.notifications }))} style={s(`width:34px;height:19px;border-radius:999px;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;background:${notifBg};justify-content:${notifJustify};transition:background 0.15s`)}>
                    <span style={s('width:15px;height:15px;border-radius:50%;background:#fff;display:block')}></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {logoutModalOpen && (
            <div onClick={() => setState({ logoutModalOpen: false })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:50;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={s(`width:380px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5)`)}>
                <h2 style={s(`margin:0 0 10px;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.logoutTitle}</h2>
                <p style={s(`margin:0 0 22px;color:${th.surfaceSubtle};font-size:14px;line-height:1.5`)}>{appT.logoutBody}</p>
                <div style={s('display:flex;gap:10px;justify-content:flex-end')}>
                  <button onClick={() => setState({ logoutModalOpen: false })} style={s(`padding:10px 18px;border-radius:5px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13.5px`)}>{appT.logoutCancel}</button>
                  <Hoverable onClick={doLogout} base={s('padding:10px 18px;border-radius:5px;border:none;background:#c0433c;color:#fff;cursor:pointer;font-family:'+FONT+';font-size:13.5px;font-weight:600')} hover={{ background: '#a6362f' }}>
                    {appT.logoutConfirm}
                  </Hoverable>
                </div>
              </div>
            </div>
          )}

          <div style={s('position:fixed;top:78px;right:24px;z-index:60;display:flex;flex-direction:column;gap:10px;width:320px;max-width:calc(100vw - 32px)')}>
            {toasts.map((toast) => (
              <div key={toast.id} style={{ ...s(`background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:10px;padding:14px 16px;box-shadow:0 12px 30px rgba(0,0,0,0.4);display:flex;align-items:flex-start;gap:10px`), borderLeft: `4px solid ${toast.accent}`, animation: 'toastIn 0.25s ease both' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={toast.accent} strokeWidth="2.5" style={s('flex-shrink:0;margin-top:1px')}><polyline points="20,6 9,17 4,12"></polyline></svg>
                <div style={s('flex:1')}>
                  <div style={s(`color:${th.surfaceText};font-size:13.5px;font-weight:700;margin-bottom:2px`)}>{toast.title}</div>
                  <div style={s(`color:${th.surfaceSubtle};font-size:12.5px;line-height:1.4`)}>{toast.message}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={playerBoxStyle}>
            {videoModalOpen && (
              <div style={s('position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:rgba(0,0,0,0.7);z-index:2')}>
                <span style={s('color:#fff;font-size:11.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%')}>{currentSongTitle}</span>
                <button onClick={() => setState({ videoModalOpen: false })} style={s('background:none;border:none;color:#fff;cursor:pointer;padding:2px')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            <div id="yt-player-mount" style={s('width:100%;height:100%')}></div>
          </div>

          {redirectModalOpen && (
            <div onClick={() => setState({ redirectModalOpen: false, addFormOpen: false })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:65;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={{ ...s(`width:520px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:24px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:86vh;display:flex;flex-direction:column;box-sizing:border-box`), animation: 'slideUpIn 0.22s ease both' }}>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.redirectTitle}</h2>
                  <button onClick={() => setState({ redirectModalOpen: false, addFormOpen: false })} style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted}`)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div style={s('display:flex;gap:8px;margin-bottom:14px')}>
                  <input
                    type="text"
                    value={redirectSearch}
                    onChange={(e) => setState({ redirectSearch: e.target.value, redirectPage: 0 })}
                    placeholder={appT.redirectSearchPlaceholder}
                    style={s(`flex:1;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                  <button onClick={() => setState((s2) => ({ addFormOpen: !s2.addFormOpen }))} style={s(`padding:9px 14px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT};white-space:nowrap`)}>{appT.addLabel}</button>
                </div>

                <div style={s('display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px')}>
                  <span style={s(`color:${th.surfaceMuted};font-size:11px`)}>{appT.playlistTitle}:</span>
                  {decoratedPlaylists.map((pl) => (
                    <button key={pl.id} onClick={pl.select} style={s(`border:none;cursor:pointer;padding:5px 12px;border-radius:999px;font-family:${FONT};font-size:11.5px;font-weight:600;background:${pl.bg};color:${pl.color}`)}>{pl.nome}</button>
                  ))}
                  <button onClick={() => setState({ playlistModalOpen: true })} style={s(`border:1px dashed ${th.surfaceMuted};background:none;color:${th.surfaceMuted};cursor:pointer;padding:5px 12px;border-radius:999px;font-size:11.5px;font-family:${FONT}`)}>+ {appT.newPlaylistLabel}</button>
                </div>

                {addFormOpen && (
                  <div style={s(`background:${th.inputBg};border:1px solid ${th.modalBorder};border-radius:10px;padding:14px;margin-bottom:14px;display:flex;flex-direction:column;gap:8px`)}>
                    <input type="text" value={newTitulo} onChange={(e) => setState({ newTitulo: e.target.value })} placeholder={appT.songTitlePlaceholder} style={s(`box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
                    <input type="text" value={newLink} onChange={(e) => setState({ newLink: e.target.value })} placeholder={appT.songLinkPlaceholder} style={s(`box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
                    <input type="text" value={newAddedBy} onChange={(e) => setState({ newAddedBy: e.target.value })} placeholder={appT.songAddedByPlaceholder} style={s(`box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
                    <button onClick={submitNewSong} style={s(`align-self:flex-end;padding:8px 16px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT}`)}>{appT.saveSongLabel}</button>
                  </div>
                )}

                <div style={s('flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px;min-height:120px')}>
                  {pagedSongs.map((song) => (
                    <div key={song.id} style={s('display:flex;align-items:center;gap:10px;padding:6px')}>
                      <div style={{ ...s('width:40px;height:28px;background-size:cover;background-position:center;border-radius:4px;flex-shrink:0'), backgroundImage: `url('${song.thumb}')` }}></div>
                      <div style={s('flex:1;min-width:0')}>
                        <div style={s(`color:${th.surfaceText};font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap`)}>{song.titulo}</div>
                        <div style={s(`color:${th.surfaceMuted};font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap`)}>{song.addedBy}</div>
                      </div>
                      <button onClick={song.playAudio} aria-label="Tocar" style={{ ...s(`background:${th.hoverBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;flex-shrink:0`), opacity: song.btnOpacity, pointerEvents: song.btnPointer }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>
                      </button>
                      <button onClick={song.playVideo} aria-label="Abrir vídeo" style={{ ...s(`background:${th.hoverBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;flex-shrink:0`), opacity: song.btnOpacity, pointerEvents: song.btnPointer }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="14" height="14" rx="2"></rect><polygon points="16,9 22,6 22,18 16,15" fill="currentColor" stroke="none"></polygon></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div style={s(`display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid ${th.modalBorder}`)}>
                  <button onClick={() => setState((s2) => ({ redirectPage: Math.max(0, s2.redirectPage - 1) }))} style={s(`background:none;border:1px solid ${th.inputBorder};border-radius:6px;padding:6px 12px;color:${th.surfaceText};font-size:12px;cursor:pointer;font-family:${FONT}`)}>{appT.prevPage}</button>
                  <span style={s(`color:${th.surfaceSubtle};font-size:12px`)}>{pageLabel}</span>
                  <button onClick={() => setState((s2) => ({ redirectPage: Math.min(totalPages - 1, s2.redirectPage + 1) }))} style={s(`background:none;border:1px solid ${th.inputBorder};border-radius:6px;padding:6px 12px;color:${th.surfaceText};font-size:12px;cursor:pointer;font-family:${FONT}`)}>{appT.nextPage}</button>
                </div>
              </div>
            </div>
          )}

          {playlistModalOpen && (
            <div onClick={() => setState({ playlistModalOpen: false })} style={s(`position:fixed;inset:0;background:${th.overlayBg};z-index:66;display:flex;align-items:center;justify-content:center;padding:20px`)}>
              <div onClick={(e) => e.stopPropagation()} style={s(`width:420px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:24px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:86vh;overflow-y:auto;box-sizing:border-box`)}>
                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.playlistTitle}</h2>
                  <button onClick={() => setState({ playlistModalOpen: false })} style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted}`)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div style={s('display:flex;flex-direction:column;gap:8px;margin-bottom:18px')}>
                  {decoratedPlaylists.map((pl) => (
                    <button key={pl.id} onClick={pl.select} style={s(`display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;border:1px solid ${pl.border};background:${pl.bg};color:${pl.color};cursor:pointer;font-family:${FONT};text-align:left`)}>
                      <span style={s('font-size:13.5px;font-weight:600')}>{pl.nome}</span>
                      <span style={{ color: pl.color, opacity: 0.6, fontSize: 11.5 }}>{pl.count}</span>
                    </button>
                  ))}
                </div>

                <div style={s(`border-top:1px solid ${th.modalBorder};padding-top:16px`)}>
                  <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:8px`)}>{appT.newPlaylistLabel}</label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setState({ newPlaylistName: e.target.value })}
                    placeholder={appT.playlistNamePlaceholder}
                    style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;margin-bottom:10px`)}
                  />
                  <div style={s('display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;margin-bottom:12px')}>
                    {songCheckOptions.map((opt, i) => (
                      <label key={i} style={s(`display:flex;align-items:center;gap:8px;color:${th.surfaceText};font-size:12.5px;cursor:pointer`)}>
                        <input type="checkbox" checked={opt.checked} onChange={opt.toggle} />
                        {opt.titulo}
                      </label>
                    ))}
                  </div>
                  <button onClick={createPlaylist} style={s(`width:100%;padding:10px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT}`)}>{appT.createPlaylistLabel}</button>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp QR Code Modal */}
          {whatsappQrModalOpen && (
            <div
              onClick={() => setState({ whatsappQrModalOpen: false })}
              style={s(`position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px`)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={s(`width:460px;max-width:96vw;background:#111b21;border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:26px;box-shadow:0 30px 70px rgba(0,0,0,0.65);color:#e9edef;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center`)}
              >
                <div style={s('width:100%;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
                  <div style={s('display:flex;align-items:center;gap:8px')}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.181 8.181 0 012.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#e9edef' }}>{appT.whatsappQrTitle || 'Conectar WhatsApp (WAHA)'}</span>
                  </div>
                  <button
                    onClick={() => setState({ whatsappQrModalOpen: false })}
                    style={s('background:none;border:none;cursor:pointer;color:#8696a0;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:6px')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <p style={{ fontSize: 13, color: '#8696a0', lineHeight: 1.5, margin: '0 0 18px', textAlign: 'center' }}>
                  {appT.whatsappQrInstruction || 'Abra o WhatsApp no seu celular > Aparelhos Conectados > Conectar um Aparelho e aponte a câmera para esta tela.'}
                </p>

                <div style={{ marginBottom: 18 }}>
                  <QRCodeSVG data={whatsappQrData || 'WAHA_DEFAULT_SESSION_AUTH'} size={210} />
                </div>

                <div style={{ fontSize: 11.5, color: '#8696a0', marginBottom: 18, background: '#202c33', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
                  <span>{appT.whatsappServerLabel || 'Servidor WAHA:'} {wahaServerUrl}</span>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => handleConnectWhatsapp(true)}
                    style={s(`width:100%;padding:11px;border-radius:10px;border:none;background:#25D366;color:#ffffff;font-size:13.5px;font-weight:700;cursor:pointer;font-family:${FONT};box-shadow:0 4px 14px rgba(37,211,102,0.35);transition:all 0.15s`)}
                  >
                    {appT.whatsappQrSimulate || 'Simular Leitura QR Code (Conectar & Abrir)'}
                  </button>
                  <button
                    onClick={() => setState({ whatsappQrModalOpen: false })}
                    style={s(`width:100%;padding:9px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:#8696a0;font-size:12.5px;font-weight:600;cursor:pointer;font-family:${FONT}`)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Web Full-Screen Modal (Max VW & VH) */}
          {whatsappChatModalOpen && (() => {
            const activeChat = safeWhatsappChats.find((c) => c.id === whatsappActiveChatId) || safeWhatsappChats[0];
            const filteredChats = safeWhatsappChats.filter((c) => {
              if (whatsappFilter === 'unread' && c.unread === 0) return false;
              if (whatsappFilter === 'groups' && !c.isGroup) return false;
              if (!whatsappSearch.trim()) return true;
              const q = whatsappSearch.toLowerCase();
              return c.name.toLowerCase().includes(q) || (c.messages || []).some((m) => m.text.toLowerCase().includes(q));
            });
            const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '😉', '😊', '😍', '🚀', '🔥', '👍', '👏', '🎉', '✅', '✨', '💡', '📌', '📋', '🎯'];

            return (
              <div
                onClick={() => setState({ whatsappChatModalOpen: false })}
                style={s(`position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box`)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 'calc(100vw - 24px)',
                    height: 'calc(100vh - 24px)',
                    maxWidth: 1780,
                    maxHeight: 1000,
                    background: '#111b21',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 30px 90px rgba(0,0,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    fontFamily: FONT,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Top Bar */}
                  <div style={{
                    height: 48,
                    background: '#202c33',
                    borderBottom: '1px solid #2a3942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.181 8.181 0 012.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#e9edef' }}>{appT.whatsappWebTitle || 'WhatsApp Web'}</span>
                      <span style={{ fontSize: 12, color: '#8696a0', marginLeft: 4 }}>• Singular Scrum Team</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111b21', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 6px #25D366' }} />
                        <span style={{ color: '#25D366', fontSize: 11.5, fontWeight: 600 }}>WAHA Conectado</span>
                      </div>
                      <button
                        onClick={() => setState({ whatsappChatModalOpen: false })}
                        title="Fechar"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8696a0',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#8696a0'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>Fechar</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Chat Layout (Left List + Right Messages) */}
                  <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
                    {/* Left Pane */}
                    <div style={{
                      width: 380,
                      minWidth: 320,
                      maxWidth: 440,
                      background: '#111b21',
                      borderRight: '1px solid #222d34',
                      display: 'flex',
                      flexDirection: 'column',
                      flexShrink: 0,
                    }}>
                      {/* Search & Filters */}
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid #202c33', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#202c33',
                          borderRadius: 8,
                          padding: '0 12px',
                          height: 36,
                          border: '1px solid transparent',
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" style={{ flexShrink: 0, marginRight: 8 }}>
                            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                          <input
                            type="text"
                            value={whatsappSearch}
                            onChange={(e) => setState({ whatsappSearch: e.target.value })}
                            placeholder={appT.whatsappSearchPlaceholder || 'Pesquisar ou começar uma nova conversa'}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#d1d7db',
                              fontSize: 12.5,
                              fontFamily: FONT,
                            }}
                          />
                          {whatsappSearch && (
                            <button
                              onClick={() => setState({ whatsappSearch: '' })}
                              style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', padding: 2 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          )}
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[
                            { key: 'all', label: 'Todas' },
                            { key: 'unread', label: 'Não lidas' },
                            { key: 'groups', label: 'Grupos' },
                          ].map((f) => (
                            <button
                              key={f.key}
                              onClick={() => setState({ whatsappFilter: f.key })}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 16,
                                border: 'none',
                                background: whatsappFilter === f.key ? '#00a884' : '#202c33',
                                color: whatsappFilter === f.key ? '#111b21' : '#8696a0',
                                fontWeight: 600,
                                fontSize: 11.5,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chats List */}
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {filteredChats.map((c) => {
                          const isSelected = activeChat && activeChat.id === c.id;
                          const lastMsg = c.messages[c.messages.length - 1];

                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                setState((s2) => {
                                  const currentChats = (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
                                    ? s2.whatsappChats
                                    : WHATSAPP_CHATS_SEED.map((item) => ({ ...item, messages: [...item.messages] }));
                                  return {
                                    whatsappActiveChatId: c.id,
                                    whatsappChats: currentChats.map((item) => item.id === c.id ? { ...item, unread: 0 } : item),
                                  };
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                cursor: 'pointer',
                                background: isSelected ? '#2a3942' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#202c33';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {/* Avatar */}
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '50%',
                                  background: c.avatarBg || '#2a8c97',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}>
                                  {c.avatar}
                                </div>
                                {c.online && (
                                  <span style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 11,
                                    height: 11,
                                    borderRadius: '50%',
                                    background: '#25D366',
                                    border: '2px solid #111b21',
                                  }} />
                                )}
                              </div>

                              {/* Chat info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                  <span style={{ color: '#e9edef', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.name}
                                  </span>
                                  {lastMsg && (
                                    <span style={{ color: c.unread > 0 ? '#25D366' : '#8696a0', fontSize: 11, fontWeight: c.unread > 0 ? 600 : 400 }}>
                                      {lastMsg.timestamp}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 6 }}>
                                    {lastMsg && lastMsg.sender === 'me' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.4" style={{ flexShrink: 0 }}>
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                    <span style={{ color: '#8696a0', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lastMsg ? lastMsg.text : 'Nenhuma mensagem'}
                                    </span>
                                  </div>
                                  {c.unread > 0 && (
                                    <span style={{
                                      minWidth: 18,
                                      height: 18,
                                      borderRadius: 9,
                                      background: '#25D366',
                                      color: '#111b21',
                                      fontSize: 10.5,
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '0 5px',
                                      flexShrink: 0,
                                    }}>
                                      {c.unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane (Chat Area) */}
                    {activeChat ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a', minWidth: 0, position: 'relative' }}>
                        {/* Chat Header */}
                        <div style={{
                          height: 56,
                          background: '#202c33',
                          borderBottom: '1px solid #222d34',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 18px',
                          flexShrink: 0,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: activeChat.avatarBg || '#2a8c97',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 13,
                            }}>
                              {activeChat.avatar}
                            </div>
                            <div>
                              <div style={{ color: '#e9edef', fontSize: 14.5, fontWeight: 600 }}>{activeChat.name}</div>
                              <div style={{ color: '#8696a0', fontSize: 11 }}>{activeChat.lastSeen || (activeChat.online ? 'online' : '')}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              onClick={() => {
                                const replyReplies = [
                                  'Acabei de atualizar as tarefas no Singular Scrum! Tudo no prazo.',
                                  'Perfeito, Caio! Já fiz o merge da pull request.',
                                  'Reunião confirmada para amanhã cedo.',
                                  'Excelente trabalho nessa sprint!',
                                ];
                                const randomReply = replyReplies[Math.floor(Math.random() * replyReplies.length)];
                                const now = new Date();
                                const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
                                const replyMsg = {
                                  id: 'm_' + Date.now(),
                                  text: randomReply,
                                  sender: 'contact',
                                  author: activeChat.isGroup ? activeChat.name.split(' ')[0] : undefined,
                                  timestamp: timeStr,
                                  status: 'received',
                                };
                                setState((s2) => {
                                  const currentChats = (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
                                    ? s2.whatsappChats
                                    : WHATSAPP_CHATS_SEED.map((item) => ({ ...item, messages: [...item.messages] }));
                                  return {
                                    whatsappChats: currentChats.map((c) => c.id === activeChat.id ? { ...c, messages: [...(c.messages || []), replyMsg] } : c),
                                  };
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 12px',
                                borderRadius: 6,
                                background: '#2a3942',
                                border: 'none',
                                color: '#25D366',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              title="Simula uma resposta rápida automática deste contato"
                            >
                              <span>⚡</span>
                              <span>{appT.whatsappSimulateReply || 'Simular Resposta'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: '16px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
                          backgroundSize: '18px 18px',
                        }}>
                          {/* Encryption notice */}
                          <div style={{ alignSelf: 'center', margin: '4px 0 12px' }}>
                            <div style={{
                              background: '#182229',
                              color: '#ffd279',
                              fontSize: 11,
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: '1px solid rgba(255, 210, 121, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            }}>
                              <span>🔒</span>
                              <span>As mensagens são protegidas com criptografia de ponta a ponta</span>
                            </div>
                          </div>

                          {activeChat.messages.map((m) => {
                            const isMe = m.sender === 'me';
                            return (
                              <div
                                key={m.id}
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                                  maxWidth: '68%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <div style={{
                                  background: isMe ? '#005c4b' : '#202c33',
                                  color: '#e9edef',
                                  borderRadius: isMe ? '10px 0px 10px 10px' : '0px 10px 10px 10px',
                                  padding: '7px 12px 6px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                                  position: 'relative',
                                  wordBreak: 'break-word',
                                }}>
                                  {m.author && (
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#53bdeb', marginBottom: 2 }}>
                                      {m.author}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{m.text}</div>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 3,
                                    marginTop: 3,
                                    fontSize: 10,
                                    color: isMe ? 'rgba(255,255,255,0.65)' : '#8696a0',
                                  }}>
                                    <span>{m.timestamp}</span>
                                    {isMe && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.4">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Emoji Picker popup */}
                        {whatsappEmojiPickerOpen && (
                          <div style={{
                            position: 'absolute',
                            bottom: 66,
                            left: 16,
                            background: '#202c33',
                            border: '1px solid #2a3942',
                            borderRadius: 12,
                            padding: 10,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: 6,
                            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                            zIndex: 10,
                          }}>
                            {emojis.map((emoji, idx) => (
                              <button
                                key={idx}
                                onClick={() => setState((s2) => ({ whatsappMessageDraft: s2.whatsappMessageDraft + emoji }))}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: 20,
                                  cursor: 'pointer',
                                  padding: 6,
                                  borderRadius: 6,
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#2a3942'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Input Footer */}
                        <div style={{
                          minHeight: 58,
                          background: '#202c33',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexShrink: 0,
                          borderTop: '1px solid #222d34',
                        }}>
                          {/* Emoji Toggle */}
                          <button
                            onClick={() => setState((s2) => ({ whatsappEmojiPickerOpen: !s2.whatsappEmojiPickerOpen }))}
                            style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                            title="Emojis"
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                              <line x1="9" y1="9" x2="9.01" y2="9"></line>
                              <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                          </button>

                          {/* Text input */}
                          <input
                            type="text"
                            value={whatsappMessageDraft}
                            onChange={(e) => setState({ whatsappMessageDraft: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                sendWhatsappMessage();
                              }
                            }}
                            placeholder={appT.whatsappTypeMessage || 'Digite uma mensagem'}
                            style={{
                              flex: 1,
                              background: '#2a3942',
                              border: 'none',
                              outline: 'none',
                              borderRadius: 8,
                              padding: '10px 14px',
                              color: '#d1d7db',
                              fontSize: 13.5,
                              fontFamily: FONT,
                            }}
                          />

                          {/* Send Button */}
                          <button
                            onClick={sendWhatsappMessage}
                            disabled={!whatsappMessageDraft.trim()}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: whatsappMessageDraft.trim() ? '#00a884' : '#2a3942',
                              border: 'none',
                              color: whatsappMessageDraft.trim() ? '#ffffff' : '#8696a0',
                              cursor: whatsappMessageDraft.trim() ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            title="Enviar mensagem"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

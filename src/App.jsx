import { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Target,
  Users,
  Inbox,
  Sparkles,
  FileText,
  Handshake,
  User,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Key,
  AlertCircle,
  Timer,
  ArrowRight,
  Pencil,
  Plus,
  ListMusic,
  Play,
  Pause,
  Check,
  X,
  Send,
  MessageSquare,
  Camera,
  Upload,
} from 'lucide-react';
import { s } from './style';
import Hoverable from './Hoverable';
import { supabase } from './supabaseClient';
import {
  STRINGS,
  APP_STRINGS,
  USERS,
  STATUS_DEFS,
  WHATSAPP_CHATS_SEED,
  extractYouTubeId,
  THEMES,
} from './data';
import { api } from './api';
import CustomSelect from './CustomSelect';

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
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: '#111b21',
        border: '2px solid rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(79,209,222,0.85) 50%, transparent 100%)',
        boxShadow: '0 0 8px rgba(79,209,222,0.6)',
        animation: 'scanLine 2.2s ease-in-out infinite alternate',
        pointerEvents: 'none',
      }} />
    </div>

  );
}

function AnimatedModal({
  isOpen,
  onClose,
  zIndex = 50,
  overlayBg,
  backdropStyle = {},
  contentStyle = {},
  children,
}) {
  const [rendered, setRendered] = useState(Boolean(isOpen));
  const [closing, setClosing] = useState(false);
  const childrenRef = useRef(children);

  if (isOpen && children) {
    childrenRef.current = children;
  }

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setClosing(false);
      return;
    }
    if (!rendered) return;
    setClosing(true);
    const timer = setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!rendered && !isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (closing) return;
      if (onClose) onClose();
    }
  };

  const currentChildren = isOpen ? children : childrenRef.current;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: overlayBg || 'rgba(0, 0, 0, 0.72)',
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        boxSizing: 'border-box',
        pointerEvents: closing ? 'none' : 'auto',
        animation: closing
          ? 'modalFadeOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          : 'modalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        ...backdropStyle,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...contentStyle,
          animation: closing
            ? 'modalZoomOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : 'modalZoomIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {typeof currentChildren === 'function' ? currentChildren() : currentChildren}
      </div>
    </div>
  );
}

function UserAvatar({ user, size = 30, fontSize = 11, style = {}, title = '' }) {
  if (!user) return null;
  const avatarUrl = user.avatarUrl || user.userAvatarUrl;
  const initials = user.initials || user.userInitials || (user.name ? user.name.slice(0, 2).toUpperCase() : 'AL');
  const avatarBg = user.avatarBg || user.userAvatarBg || '#2a8c97';
  const name = title || user.name || user.userName || '';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return (
    <span
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatarBg,
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.18)',
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {initials}
    </span>
  );
}

const savedAuthSession = (() => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('singular_auth_user') : null;
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

const initialState = {
  login: '',
  password: '',
  showPassword: false,
  remember: Boolean(savedAuthSession?.userId),
  loginLoading: false,
  loginError: '',
  // First Login Modal State
  firstLoginModalOpen: false,
  firstLoginUser: null,
  firstLoginPassword: '',
  firstLoginConfirm: '',
  firstLoginShowPass: false,
  firstLoginShowConfirm: false,
  firstLoginLoading: false,
  firstLoginError: '',
  // Reset Password Modal State
  resetPasswordModalOpen: false,
  resetLoginInput: '',
  resetPassword: '',
  resetConfirmPassword: '',
  resetShowPass: false,
  resetShowConfirm: false,
  resetLoading: false,
  resetError: '',
  // Settings Password Change State
  settingsNewPassword: '',
  settingsConfirmPassword: '',
  settingsShowNewPassword: false,
  settingsShowConfirmPassword: false,
  settingsPasswordLoading: false,
  settingsPasswordError: '',
  lang: 'pt',
  fadeOpacity: 1,
  view: savedAuthSession?.userId ? 'app' : 'login',
  route: savedAuthSession?.userId || 'caio-marques',
  isMobile: false,
  mobileSidebarOpen: false,
  contentOpacity: 1,
  contentTransform: 'translateY(0)',
  contentTransition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  mainTheme: 'dark',
  boardView: (() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('singular_board_view') : null;
      return saved === 'kanban' || saved === 'table' ? saved : 'kanban';
    } catch (e) {
      return 'kanban';
    }
  })(),
  userMenuOpen: false,
  userMenuMounted: false,
  userMenuClosing: false,
  settingsModalOpen: false,
  logoutModalOpen: false,
  notifications: true,
  users: USERS.map((u) => {
    if (u.id === 'caio-marques') {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('singular_user_avatar') : null;
        if (saved) return { ...u, avatarUrl: saved };
      } catch (e) {}
    }
    return { ...u };
  }),
  tasks: [],
  feed: [],
  contacts: [],
  detailsTaskId: null,
  actionTaskId: null,
  searchQuery: '',
  filterProjeto: '',
  filterDateFrom: '',
  filterDateTo: '',
  draftTitulo: '',
  draftProjeto: '',
  draftTarefa: '',
  draftDetalhes: '',
  draftPrazo: '',
  draftStatus: '',
  draftUserId: '',
  draftConcluida: false,
  // New Task Form State
  newTaskModalOpen: false,
  newTaskTitulo: '',
  newTaskProjeto: '',
  newTaskTarefa: '',
  newTaskDetalhes: '',
  newTaskPrazo: '',
  newTaskCriadoEm: '',
  newTaskStatus: 'backlog',
  newTaskUserId: '',
  songs: [],
  playlists: [],
  redirectModalOpen: false,
  addFormOpen: false,
  redirectSearch: '',
  redirectPage: 0,
  newTitulo: '',
  newLink: '',
  newAddedBy: '',
  editingSongId: null,
  editSongTitle: '',
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
  playlistFormMode: null, // null | 'create' | 'edit'
  editingPlaylistId: null,
  editPlaylistName: '',
  editPlaylistSongIds: [],
  newPlaylistName: '',
  newPlaylistSongIds: [],
  toasts: [],
  whatsappConnected: false,
  whatsappQrModalOpen: false,
  whatsappChatModalOpen: false,
  whatsappQrLoading: false,
  whatsappQrData: '',
  whatsappChats: WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [] })),
  whatsappChatDbId: null,
  whatsappActiveChatId: 'general',
  whatsappMessageDraft: '',
  whatsappEphemeralMode: false,
  whatsappSearch: '',
  whatsappFilter: 'all',
  whatsappEmojiPickerOpen: false,
  wahaServerUrl: 'http://localhost:3000',
  // New Lead / Contact Form State
  newContactModalOpen: false,
  contactModalLead: null,
  newContactNome: '',
  newContactEmpresa: '',
  newContactEmail: '',
  newContactTelefone: '',
  newContactTipo: '',
  newContactOrcamento: '',
  newContactPrazo: '',
  newContactDescricao: '',
  newContactOrigem: 'LP Institucional',
  contactFilterStatus: 'todos',
  contactSearch: '',
  // Feed Filters & Comments
  feedFilterProject: '',
  feedFilterUser: '',
  feedSearch: '',
  feedCommentDrafts: {},
  // Name edit in settings
  editDisplayName: '',
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
  const volumeLeaveTimerRef = useRef(null);

  const {
    login, password, showPassword, remember, loginLoading, loginError,
    firstLoginModalOpen, firstLoginUser, firstLoginPassword, firstLoginConfirm, firstLoginShowPass, firstLoginShowConfirm, firstLoginLoading, firstLoginError,
    resetPasswordModalOpen, resetLoginInput, resetPassword, resetConfirmPassword, resetShowPass, resetShowConfirm, resetLoading, resetError,
    settingsNewPassword, settingsConfirmPassword, settingsShowNewPassword, settingsShowConfirmPassword, settingsPasswordLoading, settingsPasswordError,
    lang, fadeOpacity, view, route, isMobile, mobileSidebarOpen,
    contentOpacity, contentTransform, contentTransition, mainTheme, boardView, userMenuOpen, userMenuMounted, userMenuClosing,
    settingsModalOpen, logoutModalOpen, notifications, users, tasks, feed, contacts, detailsTaskId, actionTaskId,
    draftTitulo, draftProjeto, draftTarefa, draftDetalhes, draftPrazo, draftStatus, draftUserId, draftConcluida,
    searchQuery, filterProjeto, filterDateFrom, filterDateTo,
    newTaskModalOpen, newTaskTitulo, newTaskProjeto, newTaskTarefa, newTaskDetalhes, newTaskPrazo, newTaskCriadoEm, newTaskStatus, newTaskUserId,
    songs, playlists, redirectModalOpen, addFormOpen, redirectSearch, redirectPage,
    newTitulo, newLink, newAddedBy, editingSongId, editSongTitle, currentSongId, currentPlaylistId, isPlaying, repeat, shuffle,
    videoModalOpen, playerUnavailable, volume, isMuted, volumeHover, playlistModalOpen,
    playlistFormMode, editingPlaylistId, editPlaylistName, editPlaylistSongIds, newPlaylistName, newPlaylistSongIds, toasts,
    whatsappConnected, whatsappQrModalOpen, whatsappChatModalOpen, whatsappQrLoading, whatsappQrData,
    whatsappChats, whatsappChatDbId, whatsappActiveChatId, whatsappMessageDraft, whatsappEphemeralMode, whatsappSearch, whatsappFilter, whatsappEmojiPickerOpen, wahaServerUrl,
    newContactModalOpen, contactModalLead, newContactNome, newContactEmpresa, newContactEmail, newContactTelefone,
    newContactTipo, newContactOrcamento, newContactPrazo, newContactDescricao, newContactOrigem, contactFilterStatus, contactSearch,
    feedFilterProject, feedFilterUser, feedSearch, feedCommentDrafts, editDisplayName,
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
      localStorage.removeItem('singular_auth_user');
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
    } catch (e) {}
    setState({
      logoutModalOpen: false,
      userMenuOpen: false,
      view: 'login',
      route: 'caio-marques',
      boardView: 'kanban',
      password: '',
      loginError: '',
      firstLoginModalOpen: false,
      resetPasswordModalOpen: false,
    });
  }

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const trimmedLogin = (login || '').trim();
    if (!trimmedLogin) {
      setState({ loginError: 'Por favor, digite seu usuário ou nome.' });
      return;
    }
    setState({ loginLoading: true, loginError: '' });
    try {
      const res = await api.login(trimmedLogin, password);
      if (res.firstLogin) {
        setState({
          loginLoading: false,
          firstLoginUser: res.user,
          firstLoginModalOpen: true,
          firstLoginPassword: '',
          firstLoginConfirm: '',
          firstLoginError: '',
        });
        return;
      }

      if (remember) {
        try {
          localStorage.setItem('singular_auth_user', JSON.stringify({ userId: res.user.id }));
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('singular_auth_user');
        } catch (e) {}
      }

      setState({
        loginLoading: false,
        view: 'app',
        route: res.user.id,
        password: '',
        loginError: '',
      });

      addToast({
        title: 'Bem-vindo de volta',
        message: `Login realizado com sucesso como ${res.user.name}.`,
        accent: '#4fd1de',
      });
    } catch (err) {
      setState({
        loginLoading: false,
        loginError: err.message || 'Erro ao realizar login.',
      });
    }
  }

  async function handleFirstLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!firstLoginPassword || firstLoginPassword.length < 3) {
      setState({ firstLoginError: 'A senha deve ter no mínimo 3 caracteres.' });
      return;
    }
    if (firstLoginPassword !== firstLoginConfirm) {
      setState({ firstLoginError: 'As senhas digitadas não coincidem.' });
      return;
    }
    if (!firstLoginUser) {
      setState({ firstLoginError: 'Usuário não identificado.' });
      return;
    }

    setState({ firstLoginLoading: true, firstLoginError: '' });
    try {
      const res = await api.setPassword(firstLoginUser.id, firstLoginPassword);
      if (remember) {
        try {
          localStorage.setItem('singular_auth_user', JSON.stringify({ userId: firstLoginUser.id }));
        } catch (e) {}
      }

      setState({
        firstLoginLoading: false,
        firstLoginModalOpen: false,
        view: 'app',
        route: firstLoginUser.id,
        password: '',
        firstLoginPassword: '',
        firstLoginConfirm: '',
        firstLoginError: '',
      });

      addToast({
        title: 'Senha cadastrada com sucesso!',
        message: 'Sua senha foi salva com segurança no banco de dados.',
        accent: '#22c55e',
      });
    } catch (err) {
      setState({
        firstLoginLoading: false,
        firstLoginError: err.message || 'Erro ao cadastrar senha.',
      });
    }
  }

  async function handleResetPasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const trimmedLogin = (resetLoginInput || '').trim();
    if (!trimmedLogin) {
      setState({ resetError: 'Informe o usuário ou nome de login.' });
      return;
    }
    if (!resetPassword || resetPassword.length < 3) {
      setState({ resetError: 'A nova senha deve ter no mínimo 3 caracteres.' });
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setState({ resetError: 'As senhas digitadas não coincidem.' });
      return;
    }

    setState({ resetLoading: true, resetError: '' });
    try {
      await api.resetPassword(trimmedLogin, resetPassword);
      setState({
        resetLoading: false,
        resetPasswordModalOpen: false,
        login: trimmedLogin,
        password: '',
        resetPassword: '',
        resetConfirmPassword: '',
        resetError: '',
      });

      addToast({
        title: 'Senha redefinida com sucesso!',
        message: 'Você já pode entrar utilizando sua nova senha.',
        accent: '#22c55e',
      });
    } catch (err) {
      setState({
        resetLoading: false,
        resetError: err.message || 'Erro ao redefinir senha.',
      });
    }
  }

  async function handleSaveSettingsPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!settingsNewPassword || settingsNewPassword.length < 3) {
      setState({ settingsPasswordError: 'A nova senha deve ter no mínimo 3 caracteres.' });
      return;
    }
    if (settingsNewPassword !== settingsConfirmPassword) {
      setState({ settingsPasswordError: 'As senhas não coincidem.' });
      return;
    }

    setState({ settingsPasswordLoading: true, settingsPasswordError: '' });
    try {
      await api.setPassword(currentUser.id, settingsNewPassword);
      setState({
        settingsPasswordLoading: false,
        settingsNewPassword: '',
        settingsConfirmPassword: '',
        settingsPasswordError: '',
      });

      addToast({
        title: 'Senha alterada com sucesso!',
        message: 'Sua nova senha foi salva e sincronizada com o banco de dados.',
        accent: '#22c55e',
      });
    } catch (err) {
      setState({
        settingsPasswordLoading: false,
        settingsPasswordError: err.message || 'Erro ao atualizar senha.',
      });
    }
  }


  function navigateToRoute(targetRoute) {
    if (route === targetRoute) {
      if (isMobile) setState({ mobileSidebarOpen: false });
      return;
    }

    setState({
      contentOpacity: 0,
      contentTransform: 'translateY(-16px)',
      contentTransition: 'opacity 0.14s ease, transform 0.14s ease',
    });

    setTimeout(() => {
      setState({
        route: targetRoute,
        mobileSidebarOpen: false,
        contentOpacity: 0,
        contentTransform: 'translateY(20px)',
        contentTransition: 'none',
      });

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
    console.warn('YouTube player unavailable or hit an error.');
    ytPlayerRef.current = null;
    setState({ playerUnavailable: false, isPlaying: false });
  }

  function initYTPlayer() {
    if (ytPlayerRef.current || !document.getElementById('yt-player-mount') || !window.YT || !window.YT.Player) return;
    try {
      const savedVol = Number(localStorage.getItem('singular_player_volume'));
      const initialVol = !isNaN(savedVol) && savedVol !== null && savedVol >= 0 ? savedVol : 80;
      ytPlayerRef.current = new window.YT.Player('yt-player-mount', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ytReadyRef.current = true;
            try {
              if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
                ytPlayerRef.current.setVolume(initialVol);
              }
            } catch (err) {}
            if (pendingVideoIdRef.current) {
              try {
                if (typeof ytPlayerRef.current.loadVideoById === 'function') {
                  ytPlayerRef.current.loadVideoById(pendingVideoIdRef.current);
                }
              } catch (e) {}
              pendingVideoIdRef.current = null;
            }
          },
          onStateChange: (e) => {
            if (!window.YT) return;
            if (e.data === window.YT.PlayerState.ENDED) playNext();
            if (e.data === window.YT.PlayerState.PLAYING) setState({ isPlaying: true });
            if (e.data === window.YT.PlayerState.PAUSED) setState({ isPlaying: false });
          },
          onError: () => {
            console.warn('YouTube Player error encountered.');
          },
        },
      });
    } catch (e) {
      console.warn('Error initializing YouTube Player:', e);
    }
  }

  function loadYTScript() {
    if (window.YT && window.YT.Player) {
      initYTPlayer();
      return;
    }
    if (ytScriptLoadingRef.current) return;
    ytScriptLoadingRef.current = true;
    window.onYouTubeIframeAPIReady = () => {
      initYTPlayer();
    };
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(scriptEl);
  }

  function loadSong(id, opts) {
    opts = opts || {};
    const song = songs.find((sg) => sg.id === id);
    if (!song) return;
    setState({
      currentSongId: id,
      isPlaying: true,
      videoModalOpen: !!opts.video,
      currentPlaylistId: opts.keepPlaylist ? currentPlaylistId : null,
    });
    try {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(song.videoId);
        if (typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(isMuted ? 0 : volume);
        }
      } else {
        pendingVideoIdRef.current = song.videoId;
        if (!ytPlayerRef.current) {
          loadYTScript();
        }
      }
    } catch (e) {
      console.warn('Error loading song in YT player:', e);
    }
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
    if (isPlaying) {
      // Pause immediately in React state
      setState({ isPlaying: false });
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn('Error pausing video:', e);
      }
    } else {
      // Play immediately in React state
      const targetSongId = currentSongId || (songs[0] ? songs[0].id : null);
      if (!targetSongId) return;

      if (!currentSongId) {
        loadSong(targetSongId);
      } else {
        setState({ isPlaying: true });
        try {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo();
          } else {
            loadSong(currentSongId);
          }
        } catch (e) {
          console.warn('Error playing video:', e);
          loadSong(currentSongId);
        }
      }
    }
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

  function handleVolumeMouseEnter() {
    if (volumeLeaveTimerRef.current) {
      clearTimeout(volumeLeaveTimerRef.current);
      volumeLeaveTimerRef.current = null;
    }
    setState({ volumeHover: true });
  }

  function handleVolumeMouseLeave() {
    if (volumeLeaveTimerRef.current) clearTimeout(volumeLeaveTimerRef.current);
    volumeLeaveTimerRef.current = setTimeout(() => {
      setState({ volumeHover: false });
    }, 280);
  }

  // ---------- task CRUD & Feed generation ----------
  function openNewTaskModal(defaultStatus = 'backlog', defaultProject = '') {
    const todayIso = new Date().toISOString().split('T')[0];
    const targetUserId = isUserRoute ? route : (myUserAccount.id || 'caio-marques');
    setState({
      newTaskModalOpen: true,
      newTaskTitulo: '',
      newTaskProjeto: defaultProject || filterProjeto || '',
      newTaskTarefa: 'Desenvolvimento',
      newTaskDetalhes: '',
      newTaskPrazo: '',
      newTaskCriadoEm: todayIso,
      newTaskStatus: defaultStatus || 'backlog',
      newTaskUserId: targetUserId,
    });
  }

  function formatToBRDate(dateStr) {
    if (!dateStr) return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return dateStr;
  }

  function submitNewTask() {
    const tit = (newTaskTitulo || '').trim();
    if (!tit) {
      addToast({ title: 'Título obrigatório', message: 'Digite o título da tarefa.', accent: '#f59e0b' });
      return;
    }
    const proj = (newTaskProjeto || '').trim() || 'Geral';
    const tar = (newTaskTarefa || '').trim() || 'Desenvolvimento';
    const det = (newTaskDetalhes || '').trim();
    const st = newTaskStatus || 'backlog';
    const assignedUserId = newTaskUserId || (isUserRoute ? route : (myUserAccount.id || 'caio-marques'));

    const todayBR = new Date().toLocaleDateString('pt-BR');
    const createdBR = newTaskCriadoEm ? formatToBRDate(newTaskCriadoEm) : todayBR;
    const prazoBR = newTaskPrazo ? formatToBRDate(newTaskPrazo) : null;

    const newTask = {
      id: 't' + Date.now(),
      userId: assignedUserId,
      titulo: tit,
      projeto: proj,
      tarefa: tar,
      detalhes: det,
      status: st,
      concluida: false,
      prazo: prazoBR,
      criadoEm: createdBR,
    };

    const now = new Date();
    const timeStr = 'Hoje às ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const feedItem = {
      id: 'f' + Date.now(),
      userId: myUserAccount.id || 'caio-marques',
      userName: myUserAccount.name || 'Alderson',
      userAvatarBg: myUserAccount.avatarBg || '#2a8c97',
      userInitials: myUserAccount.initials || 'AL',
      userAvatarUrl: myUserAccount.avatarUrl || null,
      tipo: 'created',
      taskId: newTask.id,
      taskTitle: newTask.titulo,
      projeto: newTask.projeto,
      deStatus: null,
      paraStatus: newTask.status,
      data: timeStr,
      timestamp: Date.now(),
      comentarios: [],
    };

    setState((s2) => ({
      tasks: [newTask, ...s2.tasks],
      feed: [feedItem, ...s2.feed],
      newTaskModalOpen: false,
      newTaskTitulo: '',
      newTaskProjeto: '',
      newTaskTarefa: '',
      newTaskDetalhes: '',
      newTaskPrazo: '',
      newTaskCriadoEm: '',
      newTaskStatus: 'backlog',
      newTaskUserId: '',
    }));

    api
      .addTask(newTask)
      .then((saved) => {
        if (saved && saved.id) {
          setState((s2) => ({
            tasks: s2.tasks.map((tk) => (tk.id === newTask.id ? { ...tk, id: saved.id } : tk)),
          }));
        }
      })
      .catch(() => console.warn('Backend unreachable — task created locally only.'));

    api.addFeedItem(feedItem).catch(() => {});
    addToast({ title: 'Tarefa criada', message: `"${newTask.titulo}" foi adicionada ao quadro.`, accent: '#3fd67a' });
  }

  function saveTask() {
    const id = actionTaskId;
    const oldTask = tasks.find((tk) => tk.id === id);
    const patch = {
      titulo: draftTitulo,
      projeto: draftProjeto || (oldTask ? oldTask.projeto : 'Geral'),
      tarefa: draftTarefa || (oldTask ? oldTask.tarefa : 'Desenvolvimento'),
      detalhes: draftDetalhes || '',
      prazo: draftPrazo || null,
      status: draftStatus,
      userId: draftUserId,
      concluida: draftConcluida,
    };

    setState((s2) => {
      const updatedTasks = s2.tasks.map((tk) => (tk.id === id ? { ...tk, ...patch } : tk));

      // Check if status changed or task was marked done to record in Feed
      let updatedFeed = s2.feed;
      if (oldTask && (oldTask.status !== draftStatus || oldTask.concluida !== draftConcluida)) {
        const actingUser = s2.users.find((u) => u.id === (draftUserId || oldTask.userId)) || s2.users[0];
        const now = new Date();
        const timeStr = 'Hoje às ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        const feedItem = {
          id: 'f' + Date.now(),
          userId: actingUser.id,
          userName: actingUser.name,
          userAvatarBg: actingUser.avatarBg,
          userInitials: actingUser.initials,
          userAvatarUrl: actingUser.avatarUrl || null,
          tipo: draftConcluida ? 'completed' : 'stage_change',
          taskId: id,
          taskTitle: draftTitulo,
          projeto: patch.projeto,
          deStatus: oldTask.status,
          paraStatus: draftStatus,
          data: timeStr,
          timestamp: Date.now(),
        };
        updatedFeed = [feedItem, ...s2.feed];
        api.addFeedItem(feedItem).catch(() => {});
      }

      return {
        tasks: updatedTasks,
        feed: updatedFeed,
        actionTaskId: null,
      };
    });

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
    const taskObj = tasks.find((tk) => tk.id === id);
    setState((s2) => {
      const updatedTasks = s2.tasks.map((tk) => (tk.id === id ? { ...tk, concluida: false } : tk));
      let updatedFeed = s2.feed;
      if (taskObj) {
        const actingUser = s2.users.find((u) => u.id === taskObj.userId) || s2.users[0];
        const now = new Date();
        const timeStr = 'Hoje às ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        const feedItem = {
          id: 'f' + Date.now(),
          userId: actingUser.id,
          userName: actingUser.name,
          userAvatarBg: actingUser.avatarBg,
          userInitials: actingUser.initials,
          userAvatarUrl: actingUser.avatarUrl || null,
          tipo: 'stage_change',
          taskId: id,
          taskTitle: taskObj.titulo,
          projeto: taskObj.projeto,
          deStatus: 'commit',
          paraStatus: taskObj.status || 'dev',
          data: timeStr,
          timestamp: Date.now(),
        };
        updatedFeed = [feedItem, ...s2.feed];
        api.addFeedItem(feedItem).catch(() => {});
      }
      return { tasks: updatedTasks, feed: updatedFeed, detailsTaskId: null };
    });
    api.updateTask(id, { concluida: false }).catch(() => console.warn('Backend unreachable — task updated locally only.'));
    addToast({ title: appT.reactivateToastTitle, message: appT.reactivateToastMsg, accent: '#3fd67a' });
  }

  // ---------- User Display Name Update ----------
  function handleSaveDisplayName() {
    const trimmed = (editDisplayName || '').trim();
    if (!trimmed) return;
    const targetUserId = 'caio-marques';
    const initials = trimmed
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('') || trimmed.slice(0, 2).toUpperCase();

    setState((s2) => ({
      users: s2.users.map((u) => (u.id === targetUserId ? { ...u, name: trimmed, initials } : u)),
    }));

    api.updateUser(targetUserId, { name: trimmed, initials }).catch(() => {});
    addToast({ title: appT.settingsNameUpdated || 'Nome atualizado', message: `Seu nome no sistema agora é ${trimmed}.`, accent: '#4fd1de' });
  }

  function handleAvatarUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ title: 'Formato inválido', message: 'Selecione um arquivo de imagem válido (PNG, JPG, WebP).', accent: '#e5847c' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({ title: 'Imagem muito grande', message: 'A imagem deve ter no máximo 5MB.', accent: '#f59e0b' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const targetUserId = 'caio-marques';

      setState((s2) => {
        const nextUsers = s2.users.map((u) => (u.id === targetUserId ? { ...u, avatarUrl: dataUrl } : u));
        const nextFeed = s2.feed.map((f) => {
          const updatedComments = (f.comentarios || []).map((c) =>
            c.userId === targetUserId ? { ...c, userAvatarUrl: dataUrl } : c
          );
          if (f.userId === targetUserId) {
            return { ...f, userAvatarUrl: dataUrl, comentarios: updatedComments };
          }
          return { ...f, comentarios: updatedComments };
        });
        try {
          localStorage.setItem('singular_user_avatar', dataUrl);
        } catch (err) {}
        return { users: nextUsers, feed: nextFeed };
      });

      api.updateUser(targetUserId, { avatarUrl: dataUrl }).catch(() => {});
      addToast({ title: 'Foto de perfil atualizada', message: 'Sua foto foi definida com sucesso.', accent: '#3fd67a' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleRemoveAvatar() {
    const targetUserId = 'caio-marques';
    setState((s2) => {
      const nextUsers = s2.users.map((u) => (u.id === targetUserId ? { ...u, avatarUrl: null } : u));
      const nextFeed = s2.feed.map((f) => {
        const updatedComments = (f.comentarios || []).map((c) =>
          c.userId === targetUserId ? { ...c, userAvatarUrl: null } : c
        );
        if (f.userId === targetUserId) {
          return { ...f, userAvatarUrl: null, comentarios: updatedComments };
        }
        return { ...f, comentarios: updatedComments };
      });
      try {
        localStorage.removeItem('singular_user_avatar');
      } catch (err) {}
      return { users: nextUsers, feed: nextFeed };
    });
    api.updateUser(targetUserId, { avatarUrl: null }).catch(() => {});
    addToast({ title: 'Foto removida', message: 'O ícone com suas iniciais voltou a ser exibido.', accent: '#4fd1de' });
  }

  // ---------- Contatos / LP Leads CRUD ----------
  function submitNewContact() {
    if (!newContactNome.trim() || !newContactEmpresa.trim()) {
      addToast({ title: 'Campos incompletos', message: 'Preencha ao menos Nome e Empresa.', accent: '#f59e0b' });
      return;
    }
    const newContact = {
      id: 'c' + Date.now(),
      nome: newContactNome.trim(),
      empresa: newContactEmpresa.trim(),
      email: newContactEmail.trim() || 'contato@empresa.com.br',
      telefone: newContactTelefone.trim() || '+55 (11) 99999-9999',
      tipoSistema: newContactTipo.trim() || 'Sistema Web Customizado',
      orcamento: newContactOrcamento.trim() || 'A combinar',
      prazo: newContactPrazo.trim() || '30 a 60 dias',
      descricao: newContactDescricao.trim() || 'Solicitação de software recebida via Landing Page institucional.',
      status: 'novo',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      origem: newContactOrigem.trim() || 'LP Institucional',
    };

    setState((s2) => ({
      contacts: [newContact, ...s2.contacts],
      newContactModalOpen: false,
      newContactNome: '',
      newContactEmpresa: '',
      newContactEmail: '',
      newContactTelefone: '',
      newContactTipo: '',
      newContactOrcamento: '',
      newContactPrazo: '',
      newContactDescricao: '',
      newContactOrigem: 'LP Institucional',
    }));

    api.addContact(newContact).catch(() => {});
    addToast({ title: 'Lead Cadastrado', message: `Solicitação da ${newContact.empresa} adicionada com sucesso.`, accent: '#3fd67a' });
  }

  function updateContactStatus(contactId, nextStatus) {
    setState((s2) => ({
      contacts: s2.contacts.map((c) => (c.id === contactId ? { ...c, status: nextStatus } : c)),
      contactModalLead: s2.contactModalLead?.id === contactId ? { ...s2.contactModalLead, status: nextStatus } : s2.contactModalLead,
    }));
    api.updateContact(contactId, { status: nextStatus }).catch(() => {});
    addToast({ title: 'Status Atualizado', message: 'O status do lead foi modificado.', accent: '#4fd1de' });
  }

  function deleteContactLead(contactId) {
    setState((s2) => ({
      contacts: s2.contacts.filter((c) => c.id !== contactId),
      contactModalLead: s2.contactModalLead?.id === contactId ? null : s2.contactModalLead,
    }));
    api.deleteContact(contactId).catch(() => {});
    addToast({ title: 'Lead Excluído', message: 'O contato foi removido do sistema.', accent: '#e5847c' });
  }

  // ---------- Feed Comments ----------
  function submitFeedComment(feedId) {
    const draft = (feedCommentDrafts[feedId] || '').trim();
    if (!draft) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `Hoje às ${hours}:${minutes}`;

    const newComment = {
      id: 'fc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: myUserAccount.id || 'caio-marques',
      userName: myUserAccount.name || 'Alderson',
      userAvatarBg: myUserAccount.avatarBg || '#2a8c97',
      userInitials: myUserAccount.initials || 'AL',
      userAvatarUrl: myUserAccount.avatarUrl || null,
      texto: draft,
      data: timeFormatted,
      timestamp: Date.now(),
    };

    setState((s2) => {
      const nextFeed = s2.feed.map((f) => {
        if (f.id === feedId) {
          return {
            ...f,
            comentarios: [...(f.comentarios || []), newComment],
          };
        }
        return f;
      });
      return {
        feed: nextFeed,
        feedCommentDrafts: { ...s2.feedCommentDrafts, [feedId]: '' },
      };
    });

    api.addFeedComment(feedId, newComment).catch(() => {});
    addToast({ title: 'Comentário publicado', message: 'Seu comentário foi registrado no feed.', accent: '#3fd67a' });
  }

  function deleteFeedComment(feedId, commentId) {
    setState((s2) => {
      const nextFeed = s2.feed.map((f) => {
        if (f.id === feedId) {
          return {
            ...f,
            comentarios: (f.comentarios || []).filter((c) => c.id !== commentId),
          };
        }
        return f;
      });
      return { feed: nextFeed };
    });

    api.deleteFeedComment(feedId, commentId).catch(() => {});
    addToast({ title: 'Comentário excluído', message: 'O comentário foi removido.', accent: '#e5847c' });
  }

  // ---------- redirect / songs / playlists ----------
  function submitNewSong() {
    const tit = newTitulo.trim();
    const lnk = newLink.trim();
    const who = newAddedBy.trim() || myUserAccount.name || 'Alderson';

    if (!tit) {
      addToast({ title: 'Título obrigatório', message: 'Digite o nome da música ou faixa.', accent: '#f59e0b' });
      return;
    }
    if (!lnk) {
      addToast({ title: 'Link obrigatório', message: 'Cole o link do YouTube ou ID do vídeo.', accent: '#f59e0b' });
      return;
    }
    const videoId = extractYouTubeId(lnk);
    if (!videoId) {
      addToast({ title: 'Link inválido', message: 'Informe um link válido do YouTube (ex: youtube.com/watch?v=...).', accent: '#e5847c' });
      return;
    }

    const song = {
      id: 's' + Date.now(),
      titulo: tit,
      link: lnk.startsWith('http') ? lnk : `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      addedBy: who,
    };

    setState((s2) => ({
      songs: [song, ...s2.songs],
      currentSongId: s2.currentSongId || song.id,
      newTitulo: '',
      newLink: '',
      newAddedBy: '',
      addFormOpen: false,
    }));

    api
      .addSong({ titulo: song.titulo, link: song.link, videoId: song.videoId, addedBy: song.addedBy })
      .catch(() => console.warn('Backend unreachable — song added locally only.'));

    addToast({ title: 'Música adicionada', message: `"${song.titulo}" foi adicionada com sucesso.`, accent: '#3fd67a' });
  }

  function deleteSong(id) {
    setState((s2) => {
      const nextSongs = s2.songs.filter((sg) => sg.id !== id);
      const nextPlaylists = s2.playlists.map((pl) => ({
        ...pl,
        songIds: pl.songIds.filter((sid) => sid !== id),
      }));
      const isCurrentSong = s2.currentSongId === id;
      return {
        songs: nextSongs,
        playlists: nextPlaylists,
        currentSongId: isCurrentSong ? (nextSongs[0]?.id || null) : s2.currentSongId,
        isPlaying: isCurrentSong ? false : s2.isPlaying,
      };
    });
    api.deleteSong(id).catch(() => console.warn('Backend unreachable — song deleted locally only.'));
    addToast({ title: 'Faixa excluída', message: 'A música foi removida da lista.', accent: '#e5847c' });
  }

  function startEditSong(song) {
    cancelPlaylistForm();
    setState({
      editingSongId: song.id,
      editSongTitle: song.titulo,
      addFormOpen: false,
    });
  }

  function cancelEditSong() {
    setState({ editingSongId: null, editSongTitle: '' });
  }

  function saveSongTitle(songId) {
    const trimmed = (editSongTitle || '').trim();
    if (!trimmed) {
      addToast({ title: 'Título obrigatório', message: 'O nome da faixa não pode ficar vazio.', accent: '#f59e0b' });
      return;
    }
    setState((s2) => ({
      songs: s2.songs.map((s) => (s.id === songId ? { ...s, titulo: trimmed } : s)),
      editingSongId: null,
      editSongTitle: '',
    }));
    api.updateSong(songId, { titulo: trimmed }).catch(() => console.warn('Backend unreachable — song updated locally only.'));
    addToast({ title: 'Faixa atualizada', message: `O nome foi alterado para "${trimmed}".`, accent: '#3fd67a' });
  }

  function startCreatePlaylist() {
    setState({
      playlistFormMode: 'create',
      editingPlaylistId: null,
      editPlaylistName: '',
      editPlaylistSongIds: [],
      newPlaylistName: '',
      newPlaylistSongIds: songs.map((s) => s.id),
    });
  }

  function startEditPlaylist(pl) {
    setState({
      playlistFormMode: 'edit',
      editingPlaylistId: pl.id,
      editPlaylistName: pl.nome,
      editPlaylistSongIds: [...pl.songIds],
      newPlaylistName: '',
      newPlaylistSongIds: [],
    });
  }

  function cancelPlaylistForm() {
    setState({
      playlistFormMode: null,
      editingPlaylistId: null,
      editPlaylistName: '',
      editPlaylistSongIds: [],
      newPlaylistName: '',
      newPlaylistSongIds: [],
    });
  }

  function savePlaylistChanges() {
    if (playlistFormMode === 'create') {
      const name = (newPlaylistName || '').trim();
      if (!name) {
        addToast({ title: 'Nome obrigatório', message: 'Digite um nome para a nova playlist.', accent: '#f59e0b' });
        return;
      }
      if (!newPlaylistSongIds.length) {
        addToast({ title: 'Nenhuma música', message: 'Selecione ao menos 1 música para a playlist.', accent: '#f59e0b' });
        return;
      }
      const newPl = { id: 'p' + Date.now(), nome: name, songIds: [...newPlaylistSongIds] };
      setState((s2) => ({
        playlists: [...s2.playlists, newPl],
        currentPlaylistId: newPl.id,
        playlistFormMode: null,
        newPlaylistName: '',
        newPlaylistSongIds: [],
      }));
      api
        .addPlaylist({ nome: newPl.nome, songIds: newPl.songIds })
        .catch(() => console.warn('Backend unreachable — playlist created locally only.'));
      addToast({ title: 'Playlist criada', message: `Playlist "${newPl.nome}" foi criada com sucesso.`, accent: '#3fd67a' });
    } else if (playlistFormMode === 'edit') {
      const name = (editPlaylistName || '').trim();
      if (!name) {
        addToast({ title: 'Nome obrigatório', message: 'Digite um nome para a playlist.', accent: '#f59e0b' });
        return;
      }
      if (!editPlaylistSongIds.length) {
        addToast({ title: 'Nenhuma música', message: 'Selecione ao menos 1 música para a playlist.', accent: '#f59e0b' });
        return;
      }
      setState((s2) => {
        const nextPlaylists = s2.playlists.map((pl) =>
          pl.id === editingPlaylistId ? { ...pl, nome: name, songIds: [...editPlaylistSongIds] } : pl
        );
        return {
          playlists: nextPlaylists,
          playlistFormMode: null,
          editingPlaylistId: null,
          editPlaylistName: '',
          editPlaylistSongIds: [],
        };
      });
      api
        .updatePlaylist(editingPlaylistId, { nome: name, songIds: editPlaylistSongIds })
        .catch(() => console.warn('Backend unreachable — playlist updated locally only.'));
      addToast({ title: 'Playlist atualizada', message: `Playlist "${name}" foi atualizada com sucesso.`, accent: '#3fd67a' });
    }
  }

  function deletePlaylist(id) {
    const pl = playlists.find((p) => p.id === id);
    const plName = pl ? pl.nome : 'Playlist';
    setState((s2) => ({
      playlists: s2.playlists.filter((p) => p.id !== id),
      currentPlaylistId: s2.currentPlaylistId === id ? null : s2.currentPlaylistId,
      ...(s2.editingPlaylistId === id ? { playlistFormMode: null, editingPlaylistId: null } : {}),
    }));
    api.deletePlaylist(id).catch(() => console.warn('Backend unreachable — playlist deleted locally only.'));
    addToast({ title: 'Playlist excluída', message: `A playlist "${plName}" foi removida.`, accent: '#e5847c' });
  }

  function toggleSongInPlaylist(playlistId, songId) {
    setState((s2) => {
      const pl = s2.playlists.find((p) => p.id === playlistId);
      if (!pl) return {};
      const exists = pl.songIds.includes(songId);
      const nextSongIds = exists ? pl.songIds.filter((id) => id !== songId) : [...pl.songIds, songId];
      const nextPlaylists = s2.playlists.map((p) => (p.id === playlistId ? { ...p, songIds: nextSongIds } : p));
      api.updatePlaylist(playlistId, { nome: pl.nome, songIds: nextSongIds }).catch(() => {});
      return { playlists: nextPlaylists };
    });
  }

  // ---------- WhatsApp / WAHA ----------
  async function openWhatsappQR() {
    setState({ whatsappQrModalOpen: true, whatsappQrLoading: true });
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
    setState({
      whatsappConnected: true,
      whatsappQrModalOpen: false,
      ...(openChat ? { whatsappChatModalOpen: true } : {}),
    });
    if (openChat) loadGeneralChat();
    try {
      localStorage.setItem('singular_whatsapp_connected', 'true');
      await api.connectWhatsapp().catch(() => {});
    } catch (e) {}
    addToast({ title: 'Chat Conectado', message: 'Sessão vinculada com sucesso.', accent: '#4fd1de' });
  }

  async function handleDisconnectWhatsapp() {
    setState({ whatsappConnected: false, whatsappChatModalOpen: false, whatsappQrModalOpen: false });
    try {
      localStorage.setItem('singular_whatsapp_connected', 'false');
      await api.disconnectWhatsapp().catch(() => {});
    } catch (e) {}
    addToast({ title: 'Chat Desconectado', message: 'Sessão de mensagens encerrada.', accent: '#e5847c' });
  }

  function handleClearWhatsappCache() {
    try {
      localStorage.removeItem('singular_whatsapp_chats');
    } catch (e) {}
    loadGeneralChat();
    addToast({ title: 'Cache Limpo', message: 'Histórico recarregado do servidor.', accent: '#4fd1de' });
  }

  // Maps a backend chat message (senderId is a stable slug, e.g. "caio-marques")
  // to the shape the WhatsApp-style UI renders (sender: 'me' | 'contact').
  function toUiMessage(m, myId) {
    const isMe = m.senderId === myId;
    return {
      id: m.id,
      text: m.text,
      sender: isMe ? 'me' : 'contact',
      author: isMe ? undefined : m.author,
      authorBg: isMe ? undefined : m.authorBg,
      timestamp: m.timestamp,
      status: m.status,
    };
  }

  async function loadGeneralChat() {
    const myId = (users.find((u) => u.id === 'caio-marques') || users[0])?.id;
    if (!myId) return;
    try {
      const chats = await api.getChats(myId);
      const general = chats.find((c) => c.name === 'Bate-papo Geral') || chats[0];
      if (!general) return;
      const messages = await api.getChatMessages(general.id);
      setState((s2) => ({
        whatsappChatDbId: general.id,
        whatsappChats: s2.whatsappChats.map((c) => (
          c.id === 'general' ? { ...c, messages: messages.map((m) => toUiMessage(m, myId)) } : c
        )),
      }));
    } catch (e) {
      console.warn('Could not load real chat, falling back to local cache.', e);
    }
  }

  function openWhatsappChat() {
    try {
      localStorage.setItem('singular_whatsapp_connected', 'true');
    } catch (e) {}
    setState((s2) => ({
      whatsappConnected: true,
      whatsappChatModalOpen: true,
      whatsappActiveChatId: 'general',
      mobileSidebarOpen: false,
      whatsappChats: (Array.isArray(s2.whatsappChats) && s2.whatsappChats.length > 0)
        ? s2.whatsappChats
        : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [] })),
    }));
    loadGeneralChat();
  }

  async function sendWhatsappMessage() {
    const text = whatsappMessageDraft.trim();
    if (!text || !whatsappChatDbId) return;
    const myId = (users.find((u) => u.id === 'caio-marques') || users[0])?.id;
    const isEphemeral = !!whatsappEphemeralMode;
    const targetChatId = whatsappActiveChatId || 'general';

    setState({ whatsappMessageDraft: '', whatsappEmojiPickerOpen: false });

    if (isEphemeral) {
      // Ephemeral messages are a purely visual/local affordance — they are
      // never sent to the backend, so they never persist for anyone.
      const now = new Date();
      const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const newMsg = { id: 'm_' + Date.now(), text, sender: 'me', timestamp: timeStr, status: 'sent', isEphemeral: true };
      setState((s2) => ({
        whatsappChats: s2.whatsappChats.map((c) => (
          c.id === targetChatId ? { ...c, messages: [...(c.messages || []), newMsg] } : c
        )),
      }));
      return;
    }

    try {
      const saved = await api.sendChatMessage(whatsappChatDbId, myId, text);
      const uiMsg = toUiMessage(saved, myId);
      setState((s2) => ({
        whatsappChats: s2.whatsappChats.map((c) => (
          c.id === targetChatId && !(c.messages || []).some((m) => m.id === uiMsg.id)
            ? { ...c, messages: [...(c.messages || []), uiMsg] }
            : c
        )),
      }));
    } catch (e) {
      addToast({ title: 'Falha ao enviar', message: 'Não foi possível enviar a mensagem.', accent: '#e5847c' });
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
      // Chat messages are no longer cached in localStorage — they're always
      // loaded fresh from the backend (see loadGeneralChat) so stale/fake
      // cached messages can't resurface after the DB is cleared.
      localStorage.removeItem('singular_whatsapp_chats');
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
      bgRafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate from the Node.js backend on first load.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getUsers().catch(() => null),
      api.getTasks().catch(() => null),
      api.getFeed().catch(() => null),
      api.getContacts().catch(() => null),
      api.getSongs().catch(() => null),
      api.getPlaylists().catch(() => null),
      api.getWhatsappStatus().catch(() => null),
    ])
      .then(([usersRes, tasksRes, feedRes, contactsRes, songsRes, playlistsRes, waRes]) => {
        if (cancelled) return;
        // `null` means the request failed (see the `.catch(() => null)` above) —
        // keep whatever's currently in state. An array, even empty, is a real
        // response and must replace it (an empty board means no tasks exist).
        const mappedUsers = usersRes
          ? usersRes.map((u) => {
              if (u.id === 'caio-marques') {
                try {
                  const saved = localStorage.getItem('singular_user_avatar');
                  if (saved && !u.avatarUrl) return { ...u, avatarUrl: saved };
                } catch (e) {}
              }
              return u;
            })
          : null;

        const mappedFeed = feedRes
          ? feedRes.map((f) => {
              const u = (mappedUsers || []).find((usr) => usr.id === f.userId);
              const userAvatarUrl = f.userAvatarUrl || u?.avatarUrl || null;
              const updatedComments = (f.comentarios || []).map((c) => {
                const cUser = (mappedUsers || []).find((usr) => usr.id === c.userId);
                return {
                  ...c,
                  userAvatarUrl: c.userAvatarUrl || cUser?.avatarUrl || null,
                };
              });
              return {
                ...f,
                userAvatarUrl,
                comentarios: updatedComments,
              };
            })
          : null;

        setState({
          ...(mappedUsers ? { users: mappedUsers } : {}),
          ...(tasksRes ? { tasks: tasksRes } : {}),
          ...(mappedFeed ? { feed: mappedFeed } : {}),
          ...(contactsRes ? { contacts: contactsRes } : {}),
          ...(songsRes ? { songs: songsRes } : {}),
          ...(playlistsRes ? { playlists: playlistsRes } : {}),
          ...(waRes && waRes.connected !== undefined ? { whatsappConnected: waRes.connected } : {}),
        });
      })
      .catch(() => console.warn('Backend unreachable — showing empty state.'));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (view === 'login') startBgAnim();
    else if (view === 'app') loadYTScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    try {
      localStorage.setItem('singular_board_view', boardView);
    } catch (e) {}
  }, [boardView]);

  // Sync editDisplayName when settings modal opens
  useEffect(() => {
    if (settingsModalOpen) {
      const myUser = users.find((u) => u.id === 'caio-marques') || users[0];
      if (myUser) setState({ editDisplayName: myUser.name });
    }
  }, [settingsModalOpen, users]);

  // Live delivery for the team chat: the backend broadcasts every new
  // message over Supabase Realtime on channel "chat:<chatId>" right after
  // persisting it (see backend/server.js), so this only needs to listen.
  useEffect(() => {
    if (!whatsappChatModalOpen || !whatsappChatDbId || !supabase) return;
    const myId = (users.find((u) => u.id === 'caio-marques') || users[0])?.id;
    const channel = supabase.channel(`chat:${whatsappChatDbId}`);
    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        const uiMsg = toUiMessage(payload, myId);
        setState((s2) => ({
          whatsappChats: s2.whatsappChats.map((c) => (
            c.id === 'general' && !(c.messages || []).some((m) => m.id === uiMsg.id)
              ? { ...c, messages: [...(c.messages || []), uiMsg] }
              : c
          )),
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whatsappChatModalOpen, whatsappChatDbId]);

  // ---------- derived values ----------
  const th = THEMES[mainTheme];
  const ringOff = 'transparent';
  const t = STRINGS[lang];
  const appT = APP_STRINGS[lang];
  const activeBg = '#2a8c97';

  const isFeedRoute = route === 'feed';
  const isContactsRoute = route === 'contatos';
  const isUserRoute = !isFeedRoute && !isContactsRoute;

  const currentUser = users.find((u) => u.id === route) || users[0];
  const myUserAccount = users.find((u) => u.id === 'caio-marques') || users[0];

  const allUserTasks = tasks.filter((tk) => tk.userId === route);
  const projectOptions = [...new Set(tasks.map((tk) => tk.projeto))];
  const safeWhatsappChats = (Array.isArray(whatsappChats) && whatsappChats.length > 0)
    ? whatsappChats
    : WHATSAPP_CHATS_SEED.map((c) => ({ ...c, messages: [] }));

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
      setState({
        actionTaskId: tk.id,
        draftTitulo: tk.titulo,
        draftProjeto: tk.projeto || '',
        draftTarefa: tk.tarefa || '',
        draftDetalhes: tk.detalhes || '',
        draftPrazo: tk.prazo || '',
        draftStatus: tk.status,
        draftUserId: tk.userId,
        draftConcluida: !!tk.concluida,
      });
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

  const newTaskStatusOptions = STATUS_DEFS.map((sd) => ({
    id: sd.id,
    label: appT.statusLabels[sd.id],
    bg: newTaskStatus === sd.id ? sd.color : th.toolbarBtnBg,
    color: newTaskStatus === sd.id ? '#052226' : th.toolbarIcon,
    border: newTaskStatus === sd.id ? `1px solid ${sd.color}` : `1px solid ${th.surfaceBorder}`,
    select: () => setState({ newTaskStatus: sd.id }),
  }));

  const newTaskUserOptions = users.map((u) => ({
    ...u,
    bg: newTaskUserId === u.id ? '#2a8c97' : th.toolbarBtnBg,
    color: newTaskUserId === u.id ? '#fff' : th.toolbarIcon,
    border: newTaskUserId === u.id ? '1px solid #2a8c97' : `1px solid ${th.surfaceBorder}`,
    select: () => setState({ newTaskUserId: u.id }),
  }));

  const navUsers = users.map((u) => ({
    ...u,
    bg: route === u.id ? activeBg : 'transparent',
    color: route === u.id ? '#fff' : th.surfaceSubtle,
    select: () => navigateToRoute(u.id),
  }));

  // Filtered Feed Items
  const feedQ = (feedSearch || '').trim().toLowerCase();
  const filteredFeed = feed.filter((item) => {
    if (feedFilterProject && item.projeto !== feedFilterProject) return false;
    if (feedFilterUser && item.userId !== feedFilterUser) return false;
    if (feedQ) {
      const hay = [item.taskTitle, item.projeto, item.userName, item.data, appT.statusLabels[item.paraStatus], appT.statusLabels[item.deStatus]].join(' ').toLowerCase();
      if (!hay.includes(feedQ)) return false;
    }
    return true;
  });

  // Filtered Contacts Items
  const contactQ = (contactSearch || '').trim().toLowerCase();
  const filteredContacts = contacts.filter((c) => {
    if (contactFilterStatus && contactFilterStatus !== 'todos' && c.status !== contactFilterStatus) return false;
    if (contactQ) {
      const hay = [c.nome, c.empresa, c.email, c.telefone, c.tipoSistema, c.orcamento, c.origem, c.descricao].join(' ').toLowerCase();
      if (!hay.includes(contactQ)) return false;
    }
    return true;
  });

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
    btnOpacity: 1,
    btnPointer: 'auto',
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

  const ptBg = lang === 'pt' ? '#2a8c97' : 'transparent';
  const ptColor = lang === 'pt' ? '#fff' : 'rgba(255,255,255,0.5)';
  const enBg = lang === 'en' ? '#2a8c97' : 'transparent';
  const enColor = lang === 'en' ? '#fff' : 'rgba(255,255,255,0.5)';
  const rememberBg = remember ? '#2a8c97' : 'rgba(255,255,255,0.15)';
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
  const playBtnOpacity = 1;
  const playBtnPointer = 'auto';

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

  const themeCircles = (
    <div style={s('display:flex;align-items:center;gap:8px')}>
      <button onClick={() => setState({ mainTheme: 'dark' })} title="Tema escuro" style={s(`width:22px;height:22px;border-radius:50%;background:#050f13;border:2px solid ${ringDark};cursor:pointer;padding:0;transition:all 0.15s ease`)}></button>
      <button onClick={() => setState({ mainTheme: 'porcelain' })} title="Fundo porcelana" style={s(`width:22px;height:22px;border-radius:50%;background:#faf9f6;border:2px solid ${ringPorcelain};cursor:pointer;padding:0;transition:all 0.15s ease`)}></button>
      <button onClick={() => setState({ mainTheme: 'sepia' })} title="Fundo amarelado" style={s(`width:22px;height:22px;border-radius:50%;background:#f5ecd7;border:2px solid ${ringSepia};cursor:pointer;padding:0;transition:all 0.15s ease`)}></button>
    </div>
  );

  const viewModeButtons = (
    <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:7px;padding:2px`)}>
      <button onClick={() => setState({ boardView: 'kanban' })} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:6px 12px;border-radius:6px;font-family:${FONT};font-size:12.5px;font-weight:700;background:${kanbanViewBg};color:${kanbanViewColor};transition:all 0.15s ease`)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="6" height="16" rx="1"></rect><rect x="10" y="4" width="6" height="10" rx="1"></rect><rect x="17" y="4" width="4" height="7" rx="1"></rect></svg>
        {appT.viewKanban}
      </button>
      <button onClick={() => setState({ boardView: 'table' })} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:6px 12px;border-radius:6px;font-family:${FONT};font-size:12.5px;font-weight:700;background:${tableViewBg};color:${tableViewColor};transition:all 0.15s ease`)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        {appT.viewTable}
      </button>
    </div>
  );

  return (
    <div style={s(`position:relative;width:100%;min-height:100vh;overflow-x:hidden;overflow-y:auto;background:${view === 'app' ? th.pageBg : '#050f13'};font-family:${FONT}`)}>
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

              <form onSubmit={handleLogin} style={{ ...s('margin-top:22px'), transition: 'opacity 0.25s ease, transform 0.25s ease', opacity: fadeOpacity, transform: `translateX(${slideX})` }}>
                {loginError && (
                  <div style={s('background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.4);border-radius:9px;padding:10px 13px;color:#fca5a5;font-size:12.5px;margin-bottom:16px;display:flex;align-items:center;gap:8px')}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{loginError}</span>
                  </div>
                )}

                <div style={s('position:relative;margin-bottom:16px')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={s('position:absolute;left:16px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder={t.loginPlaceholder}
                    value={login}
                    disabled={loginLoading}
                    onChange={(e) => setState({ login: e.target.value, loginError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:15px 16px 15px 44px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14.5px;font-family:${FONT};outline:none;transition:border-color 0.2s`)}
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
                    disabled={loginLoading}
                    onChange={(e) => setState({ password: e.target.value, loginError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:15px 44px 15px 44px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:14.5px;font-family:${FONT};outline:none;transition:border-color 0.2s`)}
                  />
                  <button type="button" onClick={() => setState((s2) => ({ showPassword: !s2.showPassword }))} style={s('position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>

                <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:22px')}>
                  <label style={s('display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;user-select:none')}>
                    <button type="button" onClick={() => setState((s2) => ({ remember: !s2.remember }))} style={s(`width:32px;height:18px;border-radius:999px;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;background:${rememberBg};transition:background 0.2s`)}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', transform: remember ? 'translateX(14px)' : 'translateX(0)', transition: 'transform 0.2s' }}></span>
                    </button>
                    {t.remember}
                  </label>
                  <button
                    type="button"
                    onClick={() => setState({ resetPasswordModalOpen: true, resetLoginInput: login, resetError: '', resetPassword: '', resetConfirmPassword: '' })}
                    style={s('background:none;border:none;cursor:pointer;color:#4fd1de;font-size:12.5px;font-family:${FONT};padding:0;text-decoration:none;opacity:0.88;transition:opacity 0.15s')}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                  >
                    {t.forgotPassword || 'Esqueci minha senha'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={s(`width:100%;padding:14px;border-radius:10px;border:none;background:#2a8c97;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.04em;cursor:${loginLoading ? 'not-allowed' : 'pointer'};opacity:${loginLoading ? 0.75 : 1};font-family:${FONT};box-shadow:0 4px 18px rgba(42,140,151,0.4);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px`)}
                >
                  {loginLoading ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
                      <span>Validando...</span>
                    </>
                  ) : (
                    <span>{t.submit}</span>
                  )}
                </button>
              </form>


              <div style={s('margin-top:28px;text-align:center;color:rgba(255,255,255,0.35);font-size:11.5px;letter-spacing:0.02em')}>
                {t.footer}
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Hoverable
                as="button"
                onClick={() => setState({ redirectModalOpen: true })}
                title={appT.redirectButton || 'Redirecionamento'}
                aria-label={appT.redirectButton || 'Redirecionamento'}
                base={s(`background:${th.toolbarBtnBg};border:1px solid ${th.surfaceBorder};border-radius:7px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:${th.toolbarIcon};cursor:pointer;transition:all 0.15s ease`)}
                hover={{ background: th.hoverBg, color: '#4fd1de', borderColor: '#4fd1de', transform: 'scale(1.06)' }}
              >
                <Phone size={15} />
              </Hoverable>
              <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:5px;padding:2px`)}>{langSwitch}</div>
            </div>
          </header>

          <nav style={s(`position:fixed;top:64px;bottom:0;left:0;width:260px;z-index:30;background:${th.surfaceBg};border-right:1px solid ${th.surfaceBorder};padding:20px 14px 14px;box-sizing:border-box;transform:${sidebarTransform};transition:transform 0.25s ease;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden`)}>
            <div className="hide-scrollbar" style={s('flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;margin-bottom:12px;padding-right:2px')}>
              {/* Início Section */}
              <div style={s(`color:${th.surfaceMuted};font-size:11px;letter-spacing:0.12em;font-weight:600;padding:0 10px 8px`)}>{appT.navHomeLabel || 'Início'}</div>
              
              {/* 1. Feed Button */}
              <button
                onClick={() => navigateToRoute('feed')}
                style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${isFeedRoute ? activeBg : 'transparent'};color:${isFeedRoute ? '#fff' : th.surfaceText};font-family:${FONT};font-size:14px;text-align:left;transition:background 0.2s ease, color 0.2s ease, transform 0.2s ease;transform:${isFeedRoute ? 'translateX(4px)' : 'translateX(0)'}`)}
                onMouseEnter={(e) => {
                  if (!isFeedRoute) {
                    e.currentTarget.style.background = th.hoverBg;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFeedRoute) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={s(`width:26px;height:26px;border-radius:50%;background:#2a8c97;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0;transition:transform 0.2s ease;transform:${isFeedRoute ? 'scale(1.08)' : 'scale(1)'}`)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </span>
                <span style={{ fontWeight: isFeedRoute ? '600' : '400', transition: 'font-weight 0.2s ease' }}>
                  {appT.navFeed || 'Feed'}
                </span>
              </button>

              {/* 2. Chat Interno Button */}
              <button
                onClick={openWhatsappChat}
                style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${whatsappChatModalOpen ? activeBg : 'transparent'};color:${whatsappChatModalOpen ? '#fff' : th.surfaceText};font-family:${FONT};font-size:14px;text-align:left;transition:background 0.2s ease, color 0.2s ease, transform 0.2s ease;transform:${whatsappChatModalOpen ? 'translateX(4px)' : 'translateX(0)'}`)}
                onMouseEnter={(e) => {
                  if (!whatsappChatModalOpen) {
                    e.currentTarget.style.background = th.hoverBg;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!whatsappChatModalOpen) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={s(`width:26px;height:26px;border-radius:50%;background:#2a8c97;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0;transition:transform 0.2s ease;transform:${whatsappChatModalOpen ? 'scale(1.08)' : 'scale(1)'}`)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                <span style={{ fontWeight: whatsappChatModalOpen ? '600' : '400', transition: 'font-weight 0.2s ease' }}>
                  {appT.navInternalChat || 'Chat Interno'}
                </span>
              </button>

              {/* 3. Contatos LP Button */}
              <button
                onClick={() => navigateToRoute('contatos')}
                style={s(`width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;margin-bottom:16px;background:${isContactsRoute ? activeBg : 'transparent'};color:${isContactsRoute ? '#fff' : th.surfaceText};font-family:${FONT};font-size:14px;text-align:left;transition:background 0.2s ease, color 0.2s ease, transform 0.2s ease;transform:${isContactsRoute ? 'translateX(4px)' : 'translateX(0)'}`)}
                onMouseEnter={(e) => {
                  if (!isContactsRoute) {
                    e.currentTarget.style.background = th.hoverBg;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isContactsRoute) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={s(`width:26px;height:26px;border-radius:50%;background:#2a8c97;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0;transition:transform 0.2s ease;transform:${isContactsRoute ? 'scale(1.08)' : 'scale(1)'}`)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <span style={{ fontWeight: isContactsRoute ? '600' : '400', transition: 'font-weight 0.2s ease' }}>
                    {appT.navContacts || 'Contatos'}
                  </span>
                </div>
                {contacts.filter((c) => c.status === 'novo').length > 0 && (
                  <span style={{ background: '#4fd1de', color: '#050f13', fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                    {contacts.filter((c) => c.status === 'novo').length}
                  </span>
                )}
              </button>

              {/* Equipe Section */}
              <div style={s(`color:${th.surfaceMuted};font-size:11px;letter-spacing:0.12em;font-weight:600;padding:0 10px 8px`)}>{appT.navLabel}</div>
              {navUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={u.select}
                  style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${u.bg};color:${u.color};font-family:${FONT};font-size:14px;text-align:left;transition:background 0.2s ease, color 0.2s ease, transform 0.2s ease;transform:${route === u.id ? 'translateX(4px)' : 'translateX(0)'}`)}
                >
                  <UserAvatar
                    user={u}
                    size={26}
                    fontSize={11}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: route === u.id ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
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
                      e.currentTarget.style.borderColor = th.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = th.surfaceBorder;
                    }}
                  >
                    <span>Conect Me</span>
                  </button>
                </div>
              ) : (
                <div style={s(`padding:0 4px 10px;margin-bottom:8px;border-bottom:1px solid ${th.surfaceBorder};display:flex;align-items:center;gap:6px`)}>
                  <button
                    onClick={openWhatsappChat}
                    style={s(`flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 10px;border-radius:8px;background:transparent;color:${th.surfaceText};border:1px solid ${th.surfaceBorder};font-family:${FONT};font-size:11.5px;font-weight:600;cursor:pointer;transition:all 0.15s ease`)}
                    title="Abrir Chat"
                    onMouseEnter={(e) => { e.currentTarget.style.background = th.hoverBg; e.currentTarget.style.borderColor = th.accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = th.surfaceBorder; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{appT.whatsappOpen || 'Abrir'}</span>
                  </button>
                  <button
                    onClick={handleClearWhatsappCache}
                    style={s(`width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:transparent;color:${th.surfaceMuted};border:none;cursor:pointer;transition:all 0.15s ease`)}
                    title="Limpar Cache"
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = th.surfaceMuted; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                  <button
                    onClick={handleDisconnectWhatsapp}
                    style={s(`padding:6px 9px;border-radius:8px;background:transparent;color:#f87171;border:none;font-family:${FONT};font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s ease`)}
                    title="Desconectar"
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#f87171'; }}
                  >
                    {appT.whatsappDisconnect || 'Desconectar'}
                  </button>
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

                  <button onClick={() => setState((s2) => ({ videoModalOpen: !s2.videoModalOpen }))} title={videoModalOpen ? 'Fechar vídeo' : 'Expandir vídeo'} style={s(`background:${videoModalOpen ? '#2a8c97' : th.toolbarBtnBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${videoModalOpen ? '#fff' : th.surfaceText};cursor:pointer;transition:all 0.15s`)}>
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
                    onMouseEnter={handleVolumeMouseEnter}
                    onMouseLeave={handleVolumeMouseLeave}
                    style={s('position:relative;display:flex;align-items:center')}
                  >
                    {volumeHover && (
                      <div
                        onMouseEnter={handleVolumeMouseEnter}
                        onMouseLeave={handleVolumeMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          right: 0,
                          paddingBottom: 8,
                          zIndex: 60,
                        }}
                      >
                        <div
                          style={{
                            background: th.modalBg,
                            border: `1px solid ${th.surfaceBorder}`,
                            borderRadius: 8,
                            padding: '8px 10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            animation: 'fadeInSoft 0.15s ease both',
                            whiteSpace: 'nowrap',
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
                      </div>
                    )}
                    <button
                      onClick={toggleMute}
                      onMouseEnter={handleVolumeMouseEnter}
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

              {/* Animated User Menu */}
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
                  <UserAvatar user={myUserAccount} size={30} fontSize={12} />
                  <span style={s('font-size:13.5px;font-weight:600;text-align:left;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{myUserAccount.name || 'Alderson'}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.25s ease', transform: chevronRotate, flexShrink: 0 }}>
                    <polyline points="18,15 12,9 6,15"></polyline>
                  </svg>
                </Hoverable>
              </div>
            </div>
          </nav>

          <main style={s(`padding:64px 0 60px;margin-left:${mainMarginLeft};max-width:100%;transition:margin-left 0.25s ease, background-color 0.2s ease;background:${th.bg};min-height:100vh;box-sizing:border-box;border-top-left-radius:24px`)}>
            {/* Top Toolbar */}
            {isContactsRoute && (
              <div style={s(`display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:22px 32px;background:${th.toolbarBg};border-bottom:1px solid ${th.toolbarBorder}`)}>
                <button
                  onClick={() => setState({ newContactModalOpen: true })}
                  style={s(`display:flex;align-items:center;gap:6px;background:#2a8c97;border:none;border-radius:7px;padding:7px 14px;color:#fff;cursor:pointer;font-family:${FONT};font-size:12.5px;font-weight:700;margin-left:auto;transition:background 0.15s`)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>{appT.newContactModalTitle || '+ Novo Contato LP'}</span>
                </button>
              </div>
            )}

            {/* Dynamic Content Area based on route */}
            <div style={{ ...s('padding:32px 32px 0'), opacity: contentOpacity, transform: contentTransform, transition: contentTransition }}>
              
              {/* ==================== 1. FEED VIEW ==================== */}
              {isFeedRoute && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                  {/* Feed Header */}
                  <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap')}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={s('width:34px;height:34px;border-radius:10px;background:rgba(42,140,151,0.2);display:flex;align-items:center;justify-content:center;color:#4fd1de')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                          </svg>
                        </span>
                        <h1 style={s(`margin:0;color:${th.text};font-size:28px;font-weight:700`)}>{appT.feedTitle || 'Feed de Atividades'}</h1>
                      </div>
                      <p style={s(`margin:0;color:${th.muted};font-size:14px`)}>{appT.feedSubtitle || 'Últimas progressões em etapas de tarefas no geral de todos os projetos e membros'}</p>
                    </div>

                    {/* Feed Filters */}
                    <div style={s('display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;justify-content:flex-end;min-width:280px')}>
                      <div style={s('position:relative;flex:1;min-width:200px;max-width:300px')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.muted} strokeWidth="2" style={s('position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                          <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                          type="text"
                          value={feedSearch}
                          onChange={(e) => setState({ feedSearch: e.target.value })}
                          placeholder="Buscar no feed…"
                          style={s(`width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12.5px;font-family:${FONT};outline:none`)}
                        />
                      </div>

                      <CustomSelect
                        value={feedFilterProject}
                        onChange={(val) => setState({ feedFilterProject: val })}
                        options={[
                          { value: '', label: appT.allProjects },
                          ...projectOptions.map((proj) => ({ value: proj, label: proj })),
                        ]}
                        th={th}
                        mainTheme={mainTheme}
                      />

                      <CustomSelect
                        value={feedFilterUser}
                        onChange={(val) => setState({ feedFilterUser: val })}
                        options={[
                          { value: '', label: 'Todos os membros' },
                          ...users.map((u) => ({ value: u.id, label: u.name })),
                        ]}
                        th={th}
                        mainTheme={mainTheme}
                      />
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{feed.length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Atualizações Registradas</div>
                      </div>
                    </div>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                        <Target size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{tasks.filter((t2) => t2.concluida || t2.status === 'commit').length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Tarefas em Commit / Concluídas</div>
                      </div>
                    </div>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{users.length} Membros</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Equipe Ativa</div>
                      </div>
                    </div>
                  </div>

                  {/* Feed Timeline Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filteredFeed.length === 0 ? (
                      <div style={s(`background:${th.cardBg};border:1px dashed ${th.cardBorder};border-radius:14px;padding:48px 20px;text-align:center;color:${th.muted}`)}>
                        <p style={{ fontSize: 16, margin: 0 }}>Nenhuma atividade recente encontrada com os filtros selecionados.</p>
                      </div>
                    ) : (
                      filteredFeed.map((item) => {
                        const fromColor = (STATUS_DEFS.find((d) => d.id === item.deStatus) || {}).color || '#64748b';
                        const toColor = (STATUS_DEFS.find((d) => d.id === item.paraStatus) || {}).color || '#22c55e';
                        const fromLabel = appT.statusLabels[item.deStatus] || item.deStatus;
                        const toLabel = appT.statusLabels[item.paraStatus] || item.paraStatus;

                        return (
                          <div
                            key={item.id}
                            style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:14px;padding:18px 22px;display:flex;align-items:flex-start;gap:18px;transition:border-color 0.2s ease`)}
                          >
                            {/* Avatar */}
                            <UserAvatar
                              user={{
                                avatarUrl: item.userAvatarUrl || users.find((u) => u.id === item.userId)?.avatarUrl,
                                avatarBg: item.userAvatarBg,
                                initials: item.userInitials,
                                name: item.userName,
                              }}
                              size={40}
                              fontSize={13}
                            />

                            {/* Main Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <span style={{ color: th.text, fontSize: 14.5, fontWeight: 700 }}>{item.userName}</span>
                                  <span style={{ color: th.muted, fontSize: 13 }}>
                                    {item.tipo === 'completed' ? 'concluiu e enviou para commit a tarefa' : 'progrediu a etapa da tarefa'}
                                  </span>
                                  <span style={s('background:rgba(42,140,151,0.18);color:#4fd1de;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:6px')}>
                                    {item.projeto}
                                  </span>
                                </div>
                                <span style={{ color: th.surfaceMuted, fontSize: 12 }}>{item.data}</span>
                              </div>

                              {/* Task Box */}
                              <div
                                onClick={() => setState({ detailsTaskId: item.taskId })}
                                style={{
                                  background: 'rgba(0,0,0,0.2)',
                                  border: `1px solid ${th.cardBorder}`,
                                  borderRadius: 10,
                                  padding: '12px 16px',
                                  marginTop: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 12,
                                  flexWrap: 'wrap',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 200 }}>
                                  <span style={{ color: th.text, fontSize: 14, fontWeight: 600 }}>{item.taskTitle}</span>
                                  <span style={{ color: th.muted, fontSize: 11.5 }}>Clique para ver detalhes e especificações</span>
                                </div>

                                {/* Progression Badge Pill */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  <span style={{ background: fromColor, color: '#052226', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                                    {fromLabel}
                                  </span>
                                  <ArrowRight size={14} color={th.muted} style={{ flexShrink: 0 }} />
                                  <span style={{ background: toColor, color: '#052226', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                                    {toLabel}
                                  </span>
                                </div>
                              </div>

                              {/* Comments Section */}
                              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${th.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Comments List */}
                                {item.comentarios && item.comentarios.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {item.comentarios.map((c) => (
                                      <div
                                        key={c.id}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'flex-start',
                                          gap: 10,
                                          background: 'rgba(0,0,0,0.12)',
                                          border: `1px solid ${th.cardBorder}`,
                                          borderRadius: 10,
                                          padding: '10px 12px',
                                          animation: 'fadeInSoft 0.15s ease both',
                                        }}
                                      >
                                        {/* User Profile Avatar */}
                                        <UserAvatar
                                          user={{
                                            avatarUrl: c.userAvatarUrl || users.find((u) => u.id === c.userId)?.avatarUrl,
                                            avatarBg: c.userAvatarBg,
                                            initials: c.userInitials,
                                            name: c.userName,
                                          }}
                                          size={28}
                                          fontSize={11}
                                        />

                                        {/* Comment Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                                            <span style={{ color: th.text, fontSize: 12.5, fontWeight: 700 }}>
                                              {c.userName}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                              <span style={{ color: th.muted, fontSize: 11 }}>
                                                {c.data || 'Hoje'}
                                              </span>
                                              <button
                                                onClick={() => deleteFeedComment(item.id, c.id)}
                                                title="Excluir comentário"
                                                style={{
                                                  background: 'none',
                                                  border: 'none',
                                                  color: th.muted,
                                                  cursor: 'pointer',
                                                  padding: '2px 4px',
                                                  borderRadius: 4,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  transition: 'all 0.12s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.color = '#ef4444';
                                                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.color = th.muted;
                                                  e.currentTarget.style.background = 'none';
                                                }}
                                              >
                                                <Trash2 size={11} />
                                              </button>
                                            </div>
                                          </div>

                                          <p style={{ margin: 0, color: th.surfaceText, fontSize: 12.5, lineHeight: 1.45, wordBreak: 'break-word' }}>
                                            {c.texto}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* New Comment Input */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <UserAvatar user={myUserAccount} size={28} fontSize={11} />

                                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={feedCommentDrafts[item.id] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setState((s2) => ({
                                          feedCommentDrafts: { ...s2.feedCommentDrafts, [item.id]: val },
                                        }));
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          submitFeedComment(item.id);
                                        }
                                      }}
                                      placeholder="Escreva um comentário sobre esta tarefa…"
                                      style={s(`width:100%;box-sizing:border-box;padding:8px 36px 8px 12px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.inputBg || 'rgba(0,0,0,0.15)'};color:${th.text};font-size:12px;font-family:${FONT};outline:none`)}
                                    />
                                    <button
                                      onClick={() => submitFeedComment(item.id)}
                                      title="Enviar comentário (Enter)"
                                      style={{
                                        position: 'absolute',
                                        right: 5,
                                        background: (feedCommentDrafts[item.id] || '').trim() ? '#2a8c97' : 'transparent',
                                        border: 'none',
                                        borderRadius: 6,
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: (feedCommentDrafts[item.id] || '').trim() ? '#fff' : th.muted,
                                        cursor: (feedCommentDrafts[item.id] || '').trim() ? 'pointer' : 'default',
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <Send size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ==================== 2. CONTATOS LP VIEW ==================== */}
              {isContactsRoute && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                  {/* Contatos Header */}
                  <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap')}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={s('width:34px;height:34px;border-radius:10px;background:rgba(42,140,151,0.2);display:flex;align-items:center;justify-content:center;color:#4fd1de')}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </span>
                        <h1 style={s(`margin:0;color:${th.text};font-size:28px;font-weight:700`)}>{appT.contactsTitle || 'Contatos & Leads LP'}</h1>
                      </div>
                      <p style={s(`margin:0;color:${th.muted};font-size:14px`)}>{appT.contactsSubtitle || 'Solicitações de desenvolvimento de software e sistemas recebidas via formulários das Landing Pages'}</p>
                    </div>

                    {/* Search & Filter */}
                    <div style={s('display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1;justify-content:flex-end;min-width:280px')}>
                      <div style={s('position:relative;flex:1;min-width:220px;max-width:320px')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.muted} strokeWidth="2" style={s('position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none')}>
                          <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                          type="text"
                          value={contactSearch}
                          onChange={(e) => setState({ contactSearch: e.target.value })}
                          placeholder="Buscar por empresa, nome, sistema…"
                          style={s(`width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12.5px;font-family:${FONT};outline:none`)}
                        />
                      </div>

                      <CustomSelect
                        value={contactFilterStatus}
                        onChange={(val) => setState({ contactFilterStatus: val })}
                        options={[
                          { value: 'todos', label: 'Todos os status' },
                          { value: 'novo', label: 'Novos Leads' },
                          { value: 'em_qualificacao', label: 'Em Qualificação' },
                          { value: 'proposta_enviada', label: 'Proposta Enviada' },
                          { value: 'fechado', label: 'Contrato Fechado' },
                          { value: 'arquivado', label: 'Arquivado' },
                        ]}
                        th={th}
                        mainTheme={mainTheme}
                      />
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,209,222,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                        <Inbox size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{contacts.length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Total de Solicitações</div>
                      </div>
                    </div>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{contacts.filter((c) => c.status === 'novo').length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Novos / Sem Contato</div>
                      </div>
                    </div>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{contacts.filter((c) => ['em_qualificacao', 'proposta_enviada'].includes(c.status)).length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Em Negociação / Proposta</div>
                      </div>
                    </div>
                    <div style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px`)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                        <Handshake size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: th.text }}>{contacts.filter((c) => c.status === 'fechado').length}</div>
                        <div style={{ fontSize: 12, color: th.muted }}>Contratos Fechados</div>
                      </div>
                    </div>
                  </div>

                  {/* Contatos Grid / Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                    {filteredContacts.length === 0 ? (
                      <div style={{ ...s(`background:${th.cardBg};border:1px dashed ${th.cardBorder};border-radius:14px;padding:48px 20px;text-align:center;color:${th.muted}`), gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: 16, margin: 0 }}>Nenhum lead ou solicitação de software encontrada.</p>
                      </div>
                    ) : (
                      filteredContacts.map((contact) => {
                        const statusConfig = {
                          novo: { label: 'Novo Lead', bg: '#3b82f6', color: '#fff' },
                          em_qualificacao: { label: 'Em Qualificação', bg: '#f59e0b', color: '#052226' },
                          proposta_enviada: { label: 'Proposta Enviada', bg: '#a855f7', color: '#fff' },
                          fechado: { label: 'Contrato Fechado', bg: '#22c55e', color: '#052226' },
                          arquivado: { label: 'Arquivado', bg: '#64748b', color: '#fff' },
                        }[contact.status] || { label: contact.status, bg: '#64748b', color: '#fff' };

                        return (
                          <div
                            key={contact.id}
                            style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:14px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;transition:all 0.2s ease;box-shadow:0 4px 14px rgba(0,0,0,0.1)`)}
                          >
                            <div>
                              {/* Top Bar: Empresa + Status + Data */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: th.text }}>{contact.empresa}</div>
                                  <div style={{ fontSize: 13, color: th.muted, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                      <User size={13} style={{ flexShrink: 0 }} /> {contact.nome}
                                    </span>
                                    <span>•</span>
                                    <span style={{ fontSize: 11.5, color: th.surfaceMuted }}>{contact.criadoEm}</span>
                                  </div>
                                </div>
                                <span style={{ background: statusConfig.bg, color: statusConfig.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                                  {statusConfig.label}
                                </span>
                              </div>

                              {/* Requested System Title */}
                              <div style={{ background: 'rgba(42,140,151,0.12)', border: '1px solid rgba(79,209,222,0.25)', borderRadius: 8, padding: '8px 12px', margin: '10px 0' }}>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4fd1de', fontWeight: 700, marginBottom: 2 }}>Sistema Solicitado</div>
                                <div style={{ fontSize: 13.5, fontWeight: 600, color: th.text }}>{contact.tipoSistema}</div>
                              </div>

                              {/* Description */}
                              <p style={{ fontSize: 12.5, color: th.surfaceSubtle, lineHeight: 1.5, margin: '8px 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {contact.descricao}
                              </p>

                              {/* Info Tags */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                <span style={s(`background:${th.toolbarBtnBg};color:${th.text};font-size:11.5px;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:5px`)}>
                                  <DollarSign size={12} style={{ color: '#22c55e', flexShrink: 0 }} /> {contact.orcamento}
                                </span>
                                <span style={s(`background:${th.toolbarBtnBg};color:${th.text};font-size:11.5px;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:5px`)}>
                                  <Clock size={12} style={{ color: '#38bdf8', flexShrink: 0 }} /> {contact.prazo}
                                </span>
                                <span style={s(`background:${th.toolbarBtnBg};color:${th.surfaceMuted};font-size:11.5px;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:5px`)}>
                                  <MapPin size={12} style={{ color: '#f59e0b', flexShrink: 0 }} /> {contact.origem}
                                </span>
                              </div>
                            </div>

                            {/* Actions & Contact Links */}
                            <div style={{ borderTop: `1px solid ${th.cardBorder}`, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <a
                                  href={`tel:${contact.telefone}`}
                                  style={s(`background:${th.toolbarBtnBg};border:1px solid ${th.cardBorder};border-radius:6px;padding:5px 9px;color:${th.text};font-size:11.5px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:5px`)}
                                  title={`Ligar / WhatsApp: ${contact.telefone}`}
                                >
                                  <Phone size={12} style={{ flexShrink: 0 }} /> {contact.telefone}
                                </a>
                                <a
                                  href={`mailto:${contact.email}`}
                                  style={s(`background:${th.toolbarBtnBg};border:1px solid ${th.cardBorder};border-radius:6px;padding:5px 9px;color:${th.text};font-size:11.5px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:5px`)}
                                  title={`Enviar Email: ${contact.email}`}
                                >
                                  <Mail size={12} style={{ flexShrink: 0 }} /> Email
                                </a>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                  onClick={() => setState({ contactModalLead: contact })}
                                  style={s(`background:#2a8c97;border:none;border-radius:6px;padding:6px 12px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:${FONT}`)}
                                >
                                  Ver Lead
                                </button>
                                <button
                                  onClick={() => deleteContactLead(contact.id)}
                                  title="Excluir Lead"
                                  style={s(`background:transparent;border:none;border-radius:6px;padding:6px 8px;color:${th.surfaceMuted};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s ease`)}
                                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = th.surfaceMuted; }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ==================== 3. USER BOARD VIEW (Kanban / Tabela) ==================== */}
              {isUserRoute && (
                <div>
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
                      <CustomSelect
                        value={filterProjeto}
                        onChange={(val) => setState({ filterProjeto: val })}
                        options={[
                          { value: '', label: appT.allProjects },
                          ...projectOptions.map((proj) => ({ value: proj, label: proj })),
                        ]}
                        th={th}
                        mainTheme={mainTheme}
                      />
                      <input type="date" value={filterDateFrom} onChange={(e) => setState({ filterDateFrom: e.target.value })} style={{ ...s(`padding:8px 10px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }} />
                      <input type="date" value={filterDateTo} onChange={(e) => setState({ filterDateTo: e.target.value })} style={{ ...s(`padding:8px 10px;border-radius:8px;border:1px solid ${th.cardBorder};background:${th.cardBg};color:${th.text};font-size:12px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }} />

                      <Hoverable
                        as="button"
                        onClick={() => openNewTaskModal()}
                        base={s(`display:flex;align-items:center;gap:6px;background:#2a8c97;border:none;border-radius:8px;padding:9px 16px;color:#fff;cursor:pointer;font-family:${FONT};font-size:12.5px;font-weight:700;transition:all 0.15s ease;box-shadow:0 2px 8px rgba(42,140,151,0.3)`)}
                        hover={{ background: '#236f78', transform: 'translateY(-1px)' }}
                      >
                        <Plus size={14} />
                        <span>{appT.newTaskBtn || '+ Nova Tarefa'}</span>
                      </Hoverable>
                    </div>
                  </div>

                  <div>
                    {boardView === 'kanban' && (
                      <div className="hide-scrollbar" style={s('display:flex;gap:16px;overflow-x:auto;padding-bottom:40px;scrollbar-width:none;-ms-overflow-style:none')}>
                        {kanbanColumns.map((col) => (
                          <div key={col.id} style={s('flex:0 0 250px;display:flex;flex-direction:column;gap:12px')}>
                            <div style={s('display:flex;align-items:center;justify-content:space-between;padding:0 4px')}>
                              <span style={s(`display:flex;align-items:center;gap:6px;color:${th.text};font-size:12.5px;font-weight:700;letter-spacing:0.03em`)}>
                                <span style={s(`width:8px;height:8px;border-radius:50%;background:${col.color};flex-shrink:0`)}></span>
                                {col.label}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={s(`color:${th.muted};font-size:11.5px;background:${th.cardBg};padding:2px 8px;border-radius:999px`)}>{col.count}</span>
                                <button
                                  onClick={() => openNewTaskModal(col.id)}
                                  title={`Adicionar tarefa em "${col.label}"`}
                                  style={s(`background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:${th.muted};cursor:pointer;transition:all 0.15s`)}
                                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2a8c97'; e.currentTarget.style.borderColor = '#2a8c97'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = th.muted; e.currentTarget.style.background = th.cardBg; e.currentTarget.style.borderColor = th.cardBorder; }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                            {col.tasks.map((task) => (
                              <Hoverable
                                key={task.id}
                                as="div"
                                onClick={task.cardClick}
                                base={{
                                  position: 'relative',
                                  background: th.cardBg,
                                  borderTop: `1px solid ${th.cardBorder}`,
                                  borderRight: `1px solid ${th.cardBorder}`,
                                  borderBottom: `1px solid ${th.cardBorder}`,
                                  borderLeft: `3px solid ${task.statusColor}`,
                                  borderRadius: 10,
                                  padding: 14,
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                }}
                                hover={{
                                  borderTop: `1px solid ${th.accent}`,
                                  borderRight: `1px solid ${th.accent}`,
                                  borderBottom: `1px solid ${th.accent}`,
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity: task.cardOpacity }}>
                                  <span style={s(`color:${th.muted};font-size:10.5px;text-transform:uppercase;letter-spacing:0.04em`)}>{task.projeto}</span>
                                  <span style={s(`color:${th.text};font-size:14px;font-weight:600;line-height:1.3`)}>{task.titulo}</span>
                                  <span style={s(`color:${th.muted};font-size:12px;margin-bottom:6px`)}>{task.tarefa}</span>
                                  <span style={{ color: task.prazoColor, fontSize: 11, fontStyle: task.prazoStyle }}>{task.prazoLabel}</span>
                                </div>
                                {task.concluida && (
                                  <div style={s('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);border-radius:10px')}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                                      <CheckCircle2 size={20} />
                                    </div>
                                  </div>
                                )}
                              </Hoverable>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {boardView === 'table' && (
                      <div className="hide-scrollbar" style={s('overflow-x:auto;padding-bottom:40px;scrollbar-width:none;-ms-overflow-style:none')}>
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
                                    <button onClick={task.openDetails} aria-label="Ver" style={s(`background:${th.toolbarBtnBg};border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:${th.toolbarIcon};cursor:pointer`)}>
                                      <Eye size={14} />
                                    </button>
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
              )}
            </div>
          </main>

          {/* Task Details Modal */}
          <AnimatedModal
            isOpen={Boolean(detailsTaskId && detailsTask)}
            onClose={() => setState({ detailsTaskId: null })}
            zIndex={50}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:440px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5)`)}
          >
            {detailsTask && (
              <>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                      <UserAvatar user={users.find((u) => u.id === detailsTask.userId)} size={20} fontSize={9.5} />
                      <span style={s(`color:${th.surfaceText};font-size:13.5px`)}>{detailsTask.userName}</span>
                    </div>
                  </div>
                </div>
                {detailsTask.concluida && (
                  <Hoverable onClick={reactivateTask} base={s('margin-top:18px;padding:10px 16px;border-radius:5px;border:none;background:rgba(63,214,122,0.15);color:#7be3a0;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:600;width:100%')} hover={{ background: 'rgba(63,214,122,0.28)' }}>
                    {appT.reactivateLabel}
                  </Hoverable>
                )}
              </>
            )}
          </AnimatedModal>

          {/* ==================== NOVA TAREFA MODAL ==================== */}
          <AnimatedModal
            isOpen={newTaskModalOpen}
            onClose={() => setState({ newTaskModalOpen: false })}
            zIndex={55}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:520px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;overflow-y:auto;box-sizing:border-box`)}
          >
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:18px')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(42,140,151,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                  <Plus size={16} />
                </div>
                <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.newTaskModalTitle || 'Criar Nova Tarefa'}</h2>
              </div>
              <button onClick={() => setState({ newTaskModalOpen: false })} style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};display:flex;align-items:center;justify-content:center;padding:4px`)}>
                <X size={18} />
              </button>
            </div>

            {/* 1. Título */}
            <div style={{ marginBottom: 14 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldTitulo} *</label>
              <input
                type="text"
                autoFocus
                value={newTaskTitulo}
                onChange={(e) => setState({ newTaskTitulo: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewTask(); }}
                placeholder="Ex: Desenvolver fluxo de autenticação e permissões"
                style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
              />
            </div>

            {/* 2. Projeto e Categoria / Tarefa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldProjeto} *</label>
                <input
                  type="text"
                  list="project-suggestions-datalist"
                  value={newTaskProjeto}
                  onChange={(e) => setState({ newTaskProjeto: e.target.value })}
                  placeholder="Ex: Premium Office, DapZap..."
                  style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                />
                <datalist id="project-suggestions-datalist">
                  {[...new Set([...tasks.map((t) => t.projeto), 'Premium Office', 'Blindagem Financeira', 'Automação', 'DAP Faculty', 'Business Inteligence', 'DapZap', 'Free'])].filter(Boolean).map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldTarefa}</label>
                <input
                  type="text"
                  value={newTaskTarefa}
                  onChange={(e) => setState({ newTaskTarefa: e.target.value })}
                  placeholder="Ex: Desenvolvimento, Testes..."
                  style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                />
              </div>
            </div>

            {/* 3. Detalhes e Especificações */}
            <div style={{ marginBottom: 14 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldDetalhes}</label>
              <textarea
                rows={3}
                value={newTaskDetalhes}
                onChange={(e) => setState({ newTaskDetalhes: e.target.value })}
                placeholder="Detalhes, requisitos, regras de negócio e especificações técnicas da tarefa..."
                style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;resize:vertical`)}
              />
            </div>

            {/* 4. Datas: Criação e Prazo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldDataCriacao}</label>
                <input
                  type="date"
                  value={newTaskCriadoEm}
                  onChange={(e) => setState({ newTaskCriadoEm: e.target.value })}
                  style={{ ...s(`width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:12.5px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }}
                />
              </div>

              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldPrazo}</label>
                <input
                  type="date"
                  value={newTaskPrazo}
                  onChange={(e) => setState({ newTaskPrazo: e.target.value })}
                  style={{ ...s(`width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:12.5px;font-family:${FONT};outline:none`), colorScheme: mainTheme === 'dark' ? 'dark' : 'light' }}
                />
              </div>
            </div>

            {/* 5. Status da Tarefa */}
            <div style={{ marginBottom: 16 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:6px`)}>{appT.fieldStatus}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {newTaskStatusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={opt.select}
                    style={{
                      border: opt.border,
                      cursor: 'pointer',
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontFamily: FONT,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: opt.bg,
                      color: opt.color,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Responsável */}
            <div style={{ marginBottom: 20 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:6px`)}>{appT.fieldResponsavel}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {newTaskUserOptions.map((uopt) => (
                  <button
                    key={uopt.id}
                    type="button"
                    onClick={uopt.select}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      border: uopt.border,
                      cursor: 'pointer',
                      padding: '4px 10px 4px 4px',
                      borderRadius: 999,
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 600,
                      background: uopt.bg,
                      color: uopt.color,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <UserAvatar user={uopt} size={20} fontSize={9.5} />
                    <span>{uopt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setState({ newTaskModalOpen: false })}
                style={s(`padding:9px 16px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13px`)}
              >
                {appT.cancelLabel || 'Cancelar'}
              </button>
              <Hoverable
                as="button"
                onClick={submitNewTask}
                base={s('padding:9px 20px;border-radius:6px;border:none;background:#2a8c97;color:#fff;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;transition:background 0.15s')}
                hover={{ background: '#236f78' }}
              >
                <Plus size={14} />
                <span>{appT.createTaskLabel || 'Criar Tarefa'}</span>
              </Hoverable>
            </div>
          </AnimatedModal>

          {/* Task Edit Action Modal */}
          <AnimatedModal
            isOpen={Boolean(actionTaskId)}
            onClose={() => setState({ actionTaskId: null })}
            zIndex={50}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:480px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;overflow-y:auto;box-sizing:border-box`)}
          >
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:20px')}>
              <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.actionModalTitle}</h2>
              <Hoverable onClick={() => setState({ actionTaskId: null })} base={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};transition:transform 0.15s ease`)} hover={{ transform: 'scale(1.15)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Hoverable>
            </div>

            <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldTitulo}</label>
            <input value={draftTitulo} onChange={(e) => setState({ draftTitulo: e.target.value })} style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;margin-bottom:12px`)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldProjeto}</label>
                <input value={draftProjeto} onChange={(e) => setState({ draftProjeto: e.target.value })} style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldTarefa}</label>
                <input value={draftTarefa} onChange={(e) => setState({ draftTarefa: e.target.value })} style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldDetalhes}</label>
              <textarea rows={3} value={draftDetalhes} onChange={(e) => setState({ draftDetalhes: e.target.value })} style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;resize:vertical`)} />
            </div>

            <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:5px`)}>{appT.fieldPrazo}</label>
            <input value={draftPrazo} onChange={(e) => setState({ draftPrazo: e.target.value })} placeholder={appT.prazoPlaceholder} style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;margin-bottom:14px`)} />

            <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:6px`)}>{appT.fieldStatus}</label>
            <div style={s('display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px')}>
              {statusOptions.map((opt) => (
                <button key={opt.id} onClick={opt.select} style={s(`border:none;cursor:pointer;padding:5px 12px;border-radius:999px;font-family:${FONT};font-size:11.5px;font-weight:700;background:${opt.bg};color:${opt.color}`)}>{opt.label}</button>
              ))}
            </div>

            <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;font-weight:600;margin-bottom:6px`)}>{appT.fieldResponsavel}</label>
            <div style={s('display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px')}>
              {userOptions.map((uopt) => (
                <button key={uopt.id} onClick={uopt.select} style={s(`display:flex;align-items:center;gap:6px;border:none;cursor:pointer;padding:4px 10px 4px 4px;border-radius:999px;font-family:${FONT};font-size:12px;font-weight:600;background:${uopt.bg};color:${uopt.color}`)}>
                  <UserAvatar user={uopt} size={18} fontSize={9} />
                  {uopt.name}
                </button>
              ))}
            </div>

            <label style={s(`display:flex;align-items:center;gap:8px;color:${th.surfaceSubtle};font-size:12.5px;margin-bottom:20px;cursor:pointer`)}>
              <input type="checkbox" checked={draftConcluida} onChange={(e) => setState({ draftConcluida: e.target.checked })} />
              {appT.completedLabel}
            </label>

            <div style={s('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
              <Hoverable onClick={deleteTask} base={s('padding:9px 16px;border-radius:6px;border:none;background:rgba(192,67,60,0.15);color:#e5847c;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:600')} hover={{ background: 'rgba(192,67,60,0.28)' }}>
                {appT.deleteLabel}
              </Hoverable>
              <div style={s('display:flex;gap:10px')}>
                <button onClick={() => setState({ actionTaskId: null })} style={s(`padding:9px 16px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13px`)}>{appT.cancelLabel}</button>
                <Hoverable onClick={saveTask} base={s('padding:9px 18px;border-radius:6px;border:none;background:#2a8c97;color:#fff;cursor:pointer;font-family:'+FONT+';font-size:13px;font-weight:600')} hover={{ background: '#236f78' }}>
                  {appT.saveLabel}
                </Hoverable>
              </div>
            </div>
          </AnimatedModal>

          {/* ==================== MODAL PRIMEIRO LOGIN (FADE-IN) ==================== */}
          <AnimatedModal
            isOpen={firstLoginModalOpen}
            onClose={() => {}}
            zIndex={60}
            overlayBg="rgba(3, 11, 14, 0.88)"
            contentStyle={s(`width:440px;max-width:100%;background:rgba(8, 22, 27, 0.95);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(79,209,222,0.35);border-radius:20px;padding:34px 30px;box-shadow:0 0 0 1px rgba(79,209,222,0.2), 0 0 45px rgba(42,140,151,0.35), 0 30px 60px rgba(0,0,0,0.65);display:flex;flex-direction:column;gap:18px`)}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(79,209,222,0.15)', border: '1px solid rgba(79,209,222,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de', marginBottom: 12 }}>
                <Shield size={26} />
              </div>
              <h2 style={s('margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.02em')}>
                {t.firstLoginTitle || 'Criar Senha de Acesso'}
              </h2>
              <p style={s('margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:13px;line-height:1.45')}>
                {t.firstLoginSubtitle || 'Como este é o seu primeiro acesso ao Singular Scrum, por favor defina sua senha de segurança.'}
              </p>
            </div>

            {firstLoginUser && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar user={firstLoginUser} size={34} fontSize={12} />
                <div>
                  <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700 }}>{firstLoginUser.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5 }}>@{firstLoginUser.id}</div>
                </div>
              </div>
            )}

            {firstLoginError && (
              <div style={s('background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.4);border-radius:9px;padding:10px 13px;color:#fca5a5;font-size:12.5px;display:flex;align-items:center;gap:8px')}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{firstLoginError}</span>
              </div>
            )}

            <form onSubmit={handleFirstLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={s('display:block;color:rgba(255,255,255,0.75);font-size:12.5px;font-weight:600;margin-bottom:6px')}>
                  Nova Senha *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={firstLoginShowPass ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={firstLoginPassword}
                    autoFocus
                    onChange={(e) => setState({ firstLoginPassword: e.target.value, firstLoginError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:12px 42px 12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ firstLoginShowPass: !s2.firstLoginShowPass }))}
                    style={s('position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}
                  >
                    {firstLoginShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={s('display:block;color:rgba(255,255,255,0.75);font-size:12.5px;font-weight:600;margin-bottom:6px')}>
                  Repetir Nova Senha *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={firstLoginShowConfirm ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={firstLoginConfirm}
                    onChange={(e) => setState({ firstLoginConfirm: e.target.value, firstLoginError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:12px 42px 12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ firstLoginShowConfirm: !s2.firstLoginShowConfirm }))}
                    style={s('position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}
                  >
                    {firstLoginShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={firstLoginLoading}
                style={s(`margin-top:6px;width:100%;padding:13px;border-radius:10px;border:none;background:#2a8c97;color:#ffffff;font-size:14.5px;font-weight:700;cursor:${firstLoginLoading ? 'not-allowed' : 'pointer'};opacity:${firstLoginLoading ? 0.75 : 1};font-family:${FONT};box-shadow:0 4px 18px rgba(42,140,151,0.4);display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s`)}
              >
                {firstLoginLoading ? 'Salvando no banco de dados...' : (t.savePasswordSubmit || 'Salvar e Acessar')}
              </button>
            </form>
          </AnimatedModal>

          {/* ==================== MODAL REDEFINIR SENHA ==================== */}
          <AnimatedModal
            isOpen={resetPasswordModalOpen}
            onClose={() => setState({ resetPasswordModalOpen: false })}
            zIndex={60}
            overlayBg="rgba(3, 11, 14, 0.88)"
            contentStyle={s(`width:440px;max-width:100%;background:rgba(8, 22, 27, 0.95);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(79,209,222,0.35);border-radius:20px;padding:32px 30px;box-shadow:0 0 0 1px rgba(79,209,222,0.2), 0 0 45px rgba(42,140,151,0.35), 0 30px 60px rgba(0,0,0,0.65);display:flex;flex-direction:column;gap:16px`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(79,209,222,0.15)', border: '1px solid rgba(79,209,222,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h2 style={s('margin:0;color:#ffffff;font-size:18px;font-weight:700')}>
                    {t.resetPassword || 'Redefinir Senha'}
                  </h2>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11.5px', marginTop: 2 }}>
                    Crie uma nova senha para seu usuário
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setState({ resetPasswordModalOpen: false })}
                style={s('background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}
              >
                <X size={18} />
              </button>
            </div>

            {resetError && (
              <div style={s('background:rgba(239,68,68,0.16);border:1px solid rgba(239,68,68,0.4);border-radius:9px;padding:10px 13px;color:#fca5a5;font-size:12.5px;display:flex;align-items:center;gap:8px')}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={s('display:block;color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;margin-bottom:6px')}>
                  Usuário ou Login *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alderson, Yeezy, caio-marques"
                  value={resetLoginInput}
                  onChange={(e) => setState({ resetLoginInput: e.target.value, resetError: '' })}
                  style={s(`width:100%;box-sizing:border-box;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:13.5px;font-family:${FONT};outline:none`)}
                />
              </div>

              <div>
                <label style={s('display:block;color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;margin-bottom:6px')}>
                  Nova Senha *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={resetShowPass ? 'text' : 'password'}
                    placeholder="Digite a nova senha"
                    value={resetPassword}
                    onChange={(e) => setState({ resetPassword: e.target.value, resetError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:11px 40px 11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:13.5px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ resetShowPass: !s2.resetShowPass }))}
                    style={s('position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}
                  >
                    {resetShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={s('display:block;color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;margin-bottom:6px')}>
                  Confirmar Nova Senha *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={resetShowConfirm ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={resetConfirmPassword}
                    onChange={(e) => setState({ resetConfirmPassword: e.target.value, resetError: '' })}
                    style={s(`width:100%;box-sizing:border-box;padding:11px 40px 11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:13.5px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ resetShowConfirm: !s2.resetShowConfirm }))}
                    style={s('position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);padding:4px')}
                  >
                    {resetShowConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                style={s(`margin-top:6px;width:100%;padding:12px;border-radius:10px;border:none;background:#2a8c97;color:#ffffff;font-size:14px;font-weight:700;cursor:${resetLoading ? 'not-allowed' : 'pointer'};opacity:${resetLoading ? 0.75 : 1};font-family:${FONT};box-shadow:0 4px 18px rgba(42,140,151,0.4);display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s`)}
              >
                {resetLoading ? 'Redefinindo...' : 'Redefinir e Salvar'}
              </button>
            </form>
          </AnimatedModal>

          {/* ==================== CONFIGURAÇÕES MODAL ==================== */}
          <AnimatedModal
            isOpen={settingsModalOpen}
            onClose={() => setState({ settingsModalOpen: false })}
            zIndex={50}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:440px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:16px;max-height:88vh;overflow-y:auto;box-sizing:border-box`)}
          >
            {/* Header */}
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:4px')}>
              <h2 style={s(`margin:0;color:${th.surfaceText};font-size:19px;font-weight:700`)}>{appT.settingsTitle}</h2>
              <Hoverable onClick={() => setState({ settingsModalOpen: false })} base={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};transition:transform 0.15s ease`)} hover={{ transform: 'scale(1.15)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Hoverable>
            </div>

            {/* 1. Cores / Tema */}
            <div style={s(`display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${th.modalBorder}`)}>
              <div>
                <div style={s(`color:${th.surfaceText};font-size:14px;font-weight:600`)}>{appT.settingsAppearance || 'Aparência & Cores'}</div>
                <div style={s(`color:${th.surfaceMuted};font-size:11.5px;margin-top:2px`)}>Escuro, Porcelana e Sépia</div>
              </div>
              {themeCircles}
            </div>

            {/* 2. Modo de Visualização Padrão */}
            <div style={s(`display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${th.modalBorder}`)}>
              <div>
                <div style={s(`color:${th.surfaceText};font-size:14px;font-weight:600`)}>{appT.settingsViewMode || 'Modo de visualização'}</div>
                <div style={s(`color:${th.surfaceMuted};font-size:11.5px;margin-top:2px`)}>Kanban ou Tabela</div>
              </div>
              {viewModeButtons}
            </div>

            {/* 3. Foto de Perfil */}
            <div style={s(`padding:12px 0;border-bottom:1px solid ${th.modalBorder};display:flex;align-items:center;justify-content:space-between;gap:14px`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <UserAvatar user={myUserAccount} size={50} fontSize={17} />
                  <label
                    htmlFor="avatar-upload-file-input"
                    title="Subir foto de perfil"
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#2a8c97',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      border: `2px solid ${th.modalBg}`,
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <Camera size={11} />
                  </label>
                </div>
                <div>
                  <div style={s(`color:${th.surfaceText};font-size:14px;font-weight:600`)}>{appT.settingsProfilePhoto || 'Foto do perfil'}</div>
                  <div style={s(`color:${th.surfaceMuted};font-size:11.5px;margin-top:2px`)}>{appT.settingsPhotoRequirements || 'PNG, JPG ou WebP (máx. 5MB)'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="avatar-upload-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                <Hoverable
                  as="label"
                  htmlFor="avatar-upload-file-input"
                  base={s(`padding:7px 14px;border-radius:8px;border:1px solid rgba(79,209,222,0.35);background:rgba(42,140,151,0.14);color:#4fd1de;font-size:12px;font-weight:700;cursor:pointer;font-family:${FONT};display:flex;align-items:center;gap:6px;transition:all 0.15s`)}
                  hover={{ background: 'rgba(42,140,151,0.28)', borderColor: '#4fd1de' }}
                >
                  <Upload size={13} />
                  <span>{appT.settingsUploadPhoto || 'Subir Foto'}</span>
                </Hoverable>
                {myUserAccount.avatarUrl && (
                  <Hoverable
                    onClick={handleRemoveAvatar}
                    title="Remover foto"
                    base={s(`padding:7px 10px;border-radius:8px;border:1px solid transparent;background:rgba(239,68,68,0.12);color:#ef4444;font-size:12px;font-weight:600;cursor:pointer;font-family:${FONT};display:flex;align-items:center;gap:4px;transition:all 0.15s`)}
                    hover={{ background: 'rgba(239,68,68,0.22)' }}
                  >
                    <Trash2 size={12} />
                    <span>{appT.settingsRemovePhoto || 'Remover'}</span>
                  </Hoverable>
                )}
              </div>
            </div>

            {/* 4. Alterar seu próprio nome */}
            <div style={s(`padding:12px 0;border-bottom:1px solid ${th.modalBorder};display:flex;flex-direction:column;gap:8px`)}>
              <label style={s(`color:${th.surfaceText};font-size:14px;font-weight:600`)}>{appT.settingsDisplayName || 'Seu nome no sistema'}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setState({ editDisplayName: e.target.value })}
                  placeholder="Seu nome de exibição"
                  style={s(`flex:1;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                />
                <button
                  onClick={handleSaveDisplayName}
                  style={s(`padding:9px 16px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT};white-space:nowrap;transition:background 0.15s`)}
                >
                  {appT.settingsSaveName || 'Salvar'}
                </button>
              </div>
            </div>

            {/* 5. Segurança & Alterar Senha */}
            <div style={s(`padding:12px 0;border-bottom:1px solid ${th.modalBorder};display:flex;flex-direction:column;gap:10px`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={15} style={{ color: '#4fd1de' }} />
                <label style={s(`color:${th.surfaceText};font-size:14px;font-weight:600`)}>Segurança & Alterar Senha</label>
              </div>

              {settingsPasswordError && (
                <div style={s('background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.35);border-radius:7px;padding:8px 12px;color:#fca5a5;font-size:12px;display:flex;align-items:center;gap:6px')}>
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>{settingsPasswordError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={settingsShowNewPassword ? 'text' : 'password'}
                    value={settingsNewPassword}
                    onChange={(e) => setState({ settingsNewPassword: e.target.value, settingsPasswordError: '' })}
                    placeholder="Nova senha"
                    style={s(`width:100%;box-sizing:border-box;padding:9px 36px 9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ settingsShowNewPassword: !s2.settingsShowNewPassword }))}
                    style={s(`position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:${th.surfaceMuted};padding:2px`)}
                  >
                    {settingsShowNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={settingsShowConfirmPassword ? 'text' : 'password'}
                    value={settingsConfirmPassword}
                    onChange={(e) => setState({ settingsConfirmPassword: e.target.value, settingsPasswordError: '' })}
                    placeholder="Confirmar nova senha"
                    style={s(`width:100%;box-sizing:border-box;padding:9px 36px 9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                  <button
                    type="button"
                    onClick={() => setState((s2) => ({ settingsShowConfirmPassword: !s2.settingsShowConfirmPassword }))}
                    style={s(`position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:${th.surfaceMuted};padding:2px`)}
                  >
                    {settingsShowConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={settingsPasswordLoading}
                  onClick={handleSaveSettingsPassword}
                  style={s(`width:100%;padding:9px 16px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:${settingsPasswordLoading ? 'not-allowed' : 'pointer'};opacity:${settingsPasswordLoading ? 0.75 : 1};font-family:${FONT};display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.15s`)}
                >
                  {settingsPasswordLoading ? 'Salvando no banco...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </div>

            {/* 6. Idioma */}
            <div style={s(`display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid ${th.modalBorder}`)}>
              <span style={s(`color:${th.surfaceSubtle};font-size:14px`)}>{appT.settingsLanguage}</span>
              <div style={s(`display:flex;gap:2px;background:${th.toolbarBtnBg};border:0px;border-radius:5px;padding:2px`)}>{langSwitch}</div>
            </div>

            {/* 7. Notificações */}
            <div style={s('display:flex;align-items:center;justify-content:space-between;padding:10px 0')}>
              <span style={s(`color:${th.surfaceSubtle};font-size:14px`)}>{appT.settingsNotifications}</span>
              <button onClick={() => setState((s2) => ({ notifications: !s2.notifications }))} style={s(`width:34px;height:19px;border-radius:999px;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;background:${notifBg};justify-content:${notifJustify};transition:background 0.15s`)}>
                <span style={s('width:15px;height:15px;border-radius:50%;background:#fff;display:block')}></span>
              </button>
            </div>
          </AnimatedModal>


          {/* ==================== NOVO CONTATO / LEAD MODAL ==================== */}
          <AnimatedModal
            isOpen={newContactModalOpen}
            onClose={() => setState({ newContactModalOpen: false })}
            zIndex={55}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:520px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;overflow-y:auto;box-sizing:border-box`)}
          >
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
              <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.newContactModalTitle || 'Novo Contato / Lead de Software'}</h2>
              <button onClick={() => setState({ newContactModalOpen: false })} style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted}`)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Nome do Contato *</label>
                <input type="text" value={newContactNome} onChange={(e) => setState({ newContactNome: e.target.value })} placeholder="Ex: Rodrigo Mendes" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Empresa / Negócio *</label>
                <input type="text" value={newContactEmpresa} onChange={(e) => setState({ newContactEmpresa: e.target.value })} placeholder="Ex: Nexus Logística" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Email</label>
                <input type="email" value={newContactEmail} onChange={(e) => setState({ newContactEmail: e.target.value })} placeholder="rodrigo@empresa.com.br" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Telefone / WhatsApp</label>
                <input type="text" value={newContactTelefone} onChange={(e) => setState({ newContactTelefone: e.target.value })} placeholder="+55 11 98888-7777" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Tipo de Sistema / Software Solicitado</label>
              <input type="text" value={newContactTipo} onChange={(e) => setState({ newContactTipo: e.target.value })} placeholder="Ex: Plataforma SaaS + Painel BI + Bot WhatsApp" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Orçamento Estimado</label>
                <input type="text" value={newContactOrcamento} onChange={(e) => setState({ newContactOrcamento: e.target.value })} placeholder="Ex: R$ 20.000 - R$ 40.000" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
              <div>
                <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Prazo Desejado</label>
                <input type="text" value={newContactPrazo} onChange={(e) => setState({ newContactPrazo: e.target.value })} placeholder="Ex: 45 a 60 dias" style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s(`display:block;color:${th.surfaceSubtle};font-size:12px;margin-bottom:4px`)}>Descrição dos Requisitos & Escopo</label>
              <textarea rows={3} value={newContactDescricao} onChange={(e) => setState({ newContactDescricao: e.target.value })} placeholder="Descreva os módulos, integrações e objetivos que o cliente detalhou no formulário da LP..." style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none;resize:vertical`)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setState({ newContactModalOpen: false })} style={s(`padding:10px 18px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13px`)}>Cancelar</button>
              <button onClick={submitNewContact} style={s(`padding:10px 20px;border-radius:6px;border:none;background:#2a8c97;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:${FONT}`)}>{appT.saveContactLabel || 'Salvar Lead'}</button>
            </div>
          </AnimatedModal>

          {/* ==================== DETALHES DO LEAD MODAL ==================== */}
          <AnimatedModal
            isOpen={Boolean(contactModalLead)}
            onClose={() => setState({ contactModalLead: null })}
            zIndex={56}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:480px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;overflow-y:auto;box-sizing:border-box`)}
          >
            {contactModalLead && (
              <>
                <div style={s('display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px')}>
                  <div>
                    <h2 style={s(`margin:0;color:${th.surfaceText};font-size:19px;font-weight:700`)}>{contactModalLead.empresa}</h2>
                    <div style={{ color: th.muted, fontSize: 13, marginTop: 2 }}>{contactModalLead.nome} • Recebido em {contactModalLead.criadoEm}</div>
                  </div>
                  <button onClick={() => setState({ contactModalLead: null })} style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted}`)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div style={{ background: 'rgba(42,140,151,0.12)', border: '1px solid rgba(79,209,222,0.25)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4fd1de', fontWeight: 700, marginBottom: 2 }}>Sistema / Software Solicitado</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{contactModalLead.tipoSistema}</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px`)}>Descrição & Escopo do Projeto</div>
                  <p style={s(`margin:0;color:${th.surfaceSubtle};font-size:13.5px;line-height:1.6;background:${th.inputBg};padding:12px;border-radius:8px;border:1px solid ${th.modalBorder}`)}>{contactModalLead.descricao}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>Orçamento</div>
                    <div style={s(`color:${th.surfaceText};font-size:13.5px;font-weight:600`)}>{contactModalLead.orcamento}</div>
                  </div>
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>Prazo Desejado</div>
                    <div style={s(`color:${th.surfaceText};font-size:13.5px;font-weight:600`)}>{contactModalLead.prazo}</div>
                  </div>
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>Email</div>
                    <div style={s(`color:${th.surfaceText};font-size:13px`)}>{contactModalLead.email}</div>
                  </div>
                  <div>
                    <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px`)}>Telefone / WhatsApp</div>
                    <div style={s(`color:${th.surfaceText};font-size:13px`)}>{contactModalLead.telefone}</div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${th.modalBorder}`, paddingTop: 16 }}>
                  <div style={s(`color:${th.surfaceMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px`)}>Atualizar Status do Lead</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { id: 'novo', label: 'Novo Lead', bg: '#3b82f6' },
                      { id: 'em_qualificacao', label: 'Em Qualificação', bg: '#f59e0b' },
                      { id: 'proposta_enviada', label: 'Proposta Enviada', bg: '#a855f7' },
                      { id: 'fechado', label: 'Contrato Fechado', bg: '#22c55e' },
                      { id: 'arquivado', label: 'Arquivado', bg: '#64748b' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => updateContactStatus(contactModalLead.id, st.id)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontFamily: FONT,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: contactModalLead.status === st.id ? st.bg : th.toolbarBtnBg,
                          color: contactModalLead.status === st.id ? '#052226' : th.toolbarIcon,
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </AnimatedModal>

          {/* Logout Modal */}
          <AnimatedModal
            isOpen={logoutModalOpen}
            onClose={() => setState({ logoutModalOpen: false })}
            zIndex={50}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:380px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,0.5)`)}
          >
            <h2 style={s(`margin:0 0 10px;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.logoutTitle}</h2>
            <p style={s(`margin:0 0 22px;color:${th.surfaceSubtle};font-size:14px;line-height:1.5`)}>{appT.logoutBody}</p>
            <div style={s('display:flex;gap:10px;justify-content:flex-end')}>
              <button onClick={() => setState({ logoutModalOpen: false })} style={s(`padding:10px 18px;border-radius:5px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};cursor:pointer;font-family:${FONT};font-size:13.5px`)}>{appT.logoutCancel}</button>
              <Hoverable onClick={doLogout} base={s('padding:10px 18px;border-radius:5px;border:none;background:#c0433c;color:#fff;cursor:pointer;font-family:'+FONT+';font-size:13.5px;font-weight:600')} hover={{ background: '#a6362f' }}>
                {appT.logoutConfirm}
              </Hoverable>
            </div>
          </AnimatedModal>

          {/* Toast Container */}
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

          {/* YouTube Video Player Modal */}
          <div style={playerBoxStyle}>
            <div style={{
              display: videoModalOpen ? 'flex' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.75)',
              zIndex: 2,
            }}>
              <span style={s('color:#fff;font-size:11.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%')}>{currentSongTitle}</span>
              <button onClick={() => setState({ videoModalOpen: false })} style={s('background:none;border:none;color:#fff;cursor:pointer;padding:2px')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{ width: '100%', height: '100%' }}>
              <div id="yt-player-mount" style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>

          {/* Redirecionamento Modal */}
          <AnimatedModal
            isOpen={redirectModalOpen}
            onClose={() => {
              cancelPlaylistForm();
              cancelEditSong();
              setState({ redirectModalOpen: false, addFormOpen: false });
            }}
            zIndex={65}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:560px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:24px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:88vh;display:flex;flex-direction:column;box-sizing:border-box`)}
          >
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(42,140,151,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                  <ListMusic size={17} />
                </div>
                <h2 style={s(`margin:0;color:${th.surfaceText};font-size:18px;font-weight:700`)}>{appT.redirectTitle || 'Redirecionamento'}</h2>
              </div>
              <button
                onClick={() => {
                  cancelPlaylistForm();
                  cancelEditSong();
                  setState({ redirectModalOpen: false, addFormOpen: false });
                }}
                style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};display:flex;align-items:center;justify-content:center;padding:4px`)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={s('display:flex;gap:8px;margin-bottom:12px')}>
              <input
                type="text"
                value={redirectSearch}
                onChange={(e) => setState({ redirectSearch: e.target.value, redirectPage: 0 })}
                placeholder={appT.redirectSearchPlaceholder || 'Buscar por música ou quem adicionou…'}
                style={s(`flex:1;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
              />
              <button
                onClick={() => {
                  cancelPlaylistForm();
                  cancelEditSong();
                  setState((s2) => ({
                    addFormOpen: !s2.addFormOpen,
                    newAddedBy: s2.newAddedBy || myUserAccount.name || 'Alderson',
                  }));
                }}
                style={s(`padding:9px 16px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT};white-space:nowrap;transition:all 0.15s ease`)}
              >
                {addFormOpen ? '✕ Fechar' : (appT.addLabel || '+ Adicionar Música')}
              </button>
            </div>

            {/* Playlists Bar in Redirecionamento */}
            <div style={s('display:flex;flex-direction:column;gap:6px;margin-bottom:14px')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={s(`color:${th.surfaceMuted};font-size:11.5px;font-weight:600;display:flex;align-items:center;gap:4px`)}>
                  <ListMusic size={13} style={{ color: '#4fd1de' }} />
                  {appT.playlistTitle || 'Playlists'}:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => {
                      if (playlistFormMode === 'create') cancelPlaylistForm();
                      else {
                        cancelEditSong();
                        setState({ addFormOpen: false });
                        startCreatePlaylist();
                      }
                    }}
                    style={s(`border:1px dashed ${playlistFormMode === 'create' ? '#4fd1de' : th.surfaceBorder};background:${playlistFormMode === 'create' ? 'rgba(79,209,222,0.12)' : 'transparent'};color:${playlistFormMode === 'create' ? '#4fd1de' : th.surfaceText};cursor:pointer;padding:3px 8px;border-radius:6px;font-size:11px;font-family:${FONT};display:flex;align-items:center;gap:4px;transition:all 0.15s`)}
                  >
                    <Plus size={11} />
                    <span>Nova Playlist</span>
                  </button>
                  <button
                    onClick={() => setState({ playlistModalOpen: true })}
                    style={s(`border:1px solid ${th.surfaceBorder};background:transparent;color:${th.surfaceMuted};cursor:pointer;padding:3px 8px;border-radius:6px;font-size:11px;font-family:${FONT};display:flex;align-items:center;gap:4px;transition:all 0.15s`)}
                    title="Abrir gerenciador completo de playlists"
                  >
                    <Pencil size={11} />
                    <span>Gerenciar</span>
                  </button>
                </div>
              </div>

              <div style={s('display:flex;align-items:center;gap:6px;flex-wrap:wrap')}>
                <button
                  onClick={() => setState({ currentPlaylistId: null })}
                  style={s(`border:none;cursor:pointer;padding:4px 10px;border-radius:999px;font-family:${FONT};font-size:11.5px;font-weight:${!currentPlaylistId ? 700 : 500};background:${!currentPlaylistId ? '#2a8c97' : th.hoverBg};color:${!currentPlaylistId ? '#fff' : th.surfaceText};transition:all 0.15s`)}
                >
                  Todas ({songs.length})
                </button>
                {playlists.map((pl) => {
                  const isActive = currentPlaylistId === pl.id;
                  return (
                    <div
                      key={pl.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        background: isActive ? '#2a8c97' : th.hoverBg,
                        border: `1px solid ${isActive ? '#2a8c97' : th.surfaceBorder}`,
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <button
                        onClick={() => {
                          setState({ currentPlaylistId: isActive ? null : pl.id });
                          if (!isActive && pl.songIds[0]) loadSong(pl.songIds[0], { keepPlaylist: true });
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: isActive ? '#fff' : th.surfaceText,
                          padding: '4px 8px 4px 10px',
                          fontFamily: FONT,
                          fontSize: '11.5px',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{pl.nome}</span>
                        <span style={{ opacity: 0.7, fontSize: 10 }}>({pl.songIds.length})</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditSong();
                          setState({ addFormOpen: false });
                          startEditPlaylist(pl);
                        }}
                        title={`Alterar playlist "${pl.nome}"`}
                        style={{
                          border: 'none',
                          borderLeft: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : th.surfaceBorder}`,
                          background: 'transparent',
                          color: isActive ? '#fff' : th.surfaceMuted,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isActive ? 'rgba(0,0,0,0.15)' : 'rgba(79,209,222,0.15)';
                          e.currentTarget.style.color = isActive ? '#fff' : '#4fd1de';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = isActive ? '#fff' : th.surfaceMuted;
                        }}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        title={`Excluir playlist "${pl.nome}"`}
                        style={{
                          border: 'none',
                          borderLeft: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : th.surfaceBorder}`,
                          background: 'transparent',
                          color: isActive ? '#fff' : th.surfaceMuted,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = isActive ? '#fff' : th.surfaceMuted;
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Playlist Form (Criar ou Editar Playlist no Redirecionamento) */}
            {playlistFormMode && (
              <div style={s(`background:${th.inputBg};border:1px solid ${th.modalBorder};border-radius:12px;padding:16px;margin-bottom:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.25);animation:fadeInSoft 0.15s ease both`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(79,209,222,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                      {playlistFormMode === 'create' ? <Plus size={13} /> : <Pencil size={12} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: th.surfaceText }}>
                      {playlistFormMode === 'create' ? (appT.newPlaylistLabel || 'Criar Nova Playlist') : `Alterar Playlist: "${editPlaylistName || 'Sem nome'}"`}
                    </span>
                  </div>
                  <button onClick={cancelPlaylistForm} style={{ background: 'none', border: 'none', color: th.surfaceMuted, cursor: 'pointer', padding: 2 }}>
                    <X size={15} />
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', color: th.surfaceSubtle, fontSize: 11, marginBottom: 3, fontWeight: 600 }}>Nome da Playlist *</label>
                  <input
                    type="text"
                    value={playlistFormMode === 'create' ? newPlaylistName : editPlaylistName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (playlistFormMode === 'create') setState({ newPlaylistName: val });
                      else setState({ editPlaylistName: val });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') savePlaylistChanges(); }}
                    placeholder="Ex: Favoritas, Trap, Foco..."
                    style={s(`width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.cardBg};color:${th.surfaceText};font-size:12.5px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: th.surfaceSubtle, fontSize: 11, fontWeight: 600 }}>
                      Músicas ({playlistFormMode === 'create' ? newPlaylistSongIds.length : editPlaylistSongIds.length} selecionadas)
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = songs.map((s) => s.id);
                          if (playlistFormMode === 'create') setState({ newPlaylistSongIds: allIds });
                          else setState({ editPlaylistSongIds: allIds });
                        }}
                        style={{ background: 'none', border: 'none', color: '#4fd1de', fontSize: 10.5, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', padding: 0 }}
                      >
                        Marcar todas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (playlistFormMode === 'create') setState({ newPlaylistSongIds: [] });
                          else setState({ editPlaylistSongIds: [] });
                        }}
                        style={{ background: 'none', border: 'none', color: th.surfaceMuted, fontSize: 10.5, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', padding: 0 }}
                      >
                        Desmarcar
                      </button>
                    </div>
                  </div>

                  <div style={s(`display:flex;flex-direction:column;gap:3px;max-height:140px;overflow-y:auto;padding:5px;background:${th.cardBg};border:1px solid ${th.inputBorder};border-radius:8px`)}>
                    {songs.map((sg) => {
                      const isChecked = playlistFormMode === 'create'
                        ? newPlaylistSongIds.includes(sg.id)
                        : editPlaylistSongIds.includes(sg.id);
                      return (
                        <label
                          key={sg.id}
                          style={s(`display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 7px;border-radius:5px;cursor:pointer;transition:background 0.12s ease;background:${isChecked ? 'rgba(79,209,222,0.08)' : 'transparent'}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (playlistFormMode === 'create') {
                                  setState((s2) => ({
                                    newPlaylistSongIds: s2.newPlaylistSongIds.includes(sg.id)
                                      ? s2.newPlaylistSongIds.filter((x) => x !== sg.id)
                                      : [...s2.newPlaylistSongIds, sg.id],
                                  }));
                                } else {
                                  setState((s2) => ({
                                    editPlaylistSongIds: s2.editPlaylistSongIds.includes(sg.id)
                                      ? s2.editPlaylistSongIds.filter((x) => x !== sg.id)
                                      : [...s2.editPlaylistSongIds, sg.id],
                                  }));
                                }
                              }}
                              style={{ accentColor: '#2a8c97', cursor: 'pointer' }}
                            />
                            <span style={{ color: th.surfaceText, fontSize: 12, fontWeight: isChecked ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sg.titulo}
                            </span>
                          </div>
                          <span style={{ color: th.surfaceMuted, fontSize: 10, flexShrink: 0 }}>{sg.addedBy}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={cancelPlaylistForm} style={s(`padding:7px 12px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};font-size:11.5px;cursor:pointer;font-family:${FONT}`)}>
                    Cancelar
                  </button>
                  <button type="button" onClick={savePlaylistChanges} style={s(`padding:7px 16px;border-radius:6px;border:none;background:#2a8c97;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:${FONT};display:flex;align-items:center;gap:4px`)}>
                    <Check size={13} />
                    <span>{playlistFormMode === 'create' ? 'Criar Playlist' : 'Salvar Alterações'}</span>
                  </button>
                </div>
              </div>
            )}

            {addFormOpen && (
              <div style={s(`background:${th.inputBg};border:1px solid ${th.modalBorder};border-radius:12px;padding:16px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.25)`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: th.surfaceText }}>Adicionar Nova Música</span>
                  <button onClick={() => setState({ addFormOpen: false })} style={{ background: 'none', border: 'none', color: th.surfaceMuted, cursor: 'pointer', fontSize: 13 }}>✕</button>
                </div>

                <div>
                  <label style={{ display: 'block', color: th.surfaceSubtle, fontSize: 11.5, marginBottom: 4 }}>Título da música *</label>
                  <input
                    type="text"
                    value={newTitulo}
                    onChange={(e) => setState({ newTitulo: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitNewSong(); }}
                    placeholder="Ex: Arctic Monkeys - Do I Wanna Know?"
                    style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: th.surfaceSubtle, fontSize: 11.5, marginBottom: 4 }}>Link do YouTube ou ID do vídeo *</label>
                  <input
                    type="text"
                    value={newLink}
                    onChange={(e) => setState({ newLink: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitNewSong(); }}
                    placeholder="https://www.youtube.com/watch?v=... ou ID"
                    style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: th.surfaceSubtle, fontSize: 11.5, marginBottom: 4 }}>Quem adicionou</label>
                  <input
                    type="text"
                    value={newAddedBy}
                    onChange={(e) => setState({ newAddedBy: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitNewSong(); }}
                    placeholder="Seu nome"
                    style={s(`width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:13px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  <button onClick={() => setState({ addFormOpen: false })} style={s(`padding:8px 14px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};font-size:12px;cursor:pointer;font-family:${FONT}`)}>Cancelar</button>
                  <button onClick={submitNewSong} style={s(`padding:8px 18px;border-radius:6px;border:none;background:#2a8c97;color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT}`)}>{appT.saveSongLabel || 'Salvar música'}</button>
                </div>
              </div>
            )}

            <div style={s('flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px;min-height:120px')}>
              {pagedSongs.map((song) => {
                const activePl = currentPlaylistId ? playlists.find((p) => p.id === currentPlaylistId) : null;
                const isInActivePl = activePl ? activePl.songIds.includes(song.id) : false;
                const isEditingThisSong = editingSongId === song.id;

                if (isEditingThisSong) {
                  return (
                    <div
                      key={song.id}
                      style={s(`display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:rgba(42,140,151,0.12);border:1px solid rgba(79,209,222,0.4);margin-bottom:4px;animation:fadeInSoft 0.15s ease both`)}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editSongTitle}
                        onChange={(e) => setState({ editSongTitle: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSongTitle(song.id);
                          if (e.key === 'Escape') cancelEditSong();
                        }}
                        placeholder="Nome da faixa..."
                        style={s(`flex:1;min-width:0;box-sizing:border-box;padding:7px 10px;border-radius:6px;border:1px solid ${th.inputBorder};background:${th.inputBg};color:${th.surfaceText};font-size:12.5px;font-family:${FONT};outline:none`)}
                      />
                      <button
                        onClick={() => saveSongTitle(song.id)}
                        title="Salvar nome da faixa"
                        style={s('background:#2a8c97;border:none;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;transition:all 0.15s;flex-shrink:0')}
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={cancelEditSong}
                        title="Cancelar"
                        style={s(`background:${th.hoverBg};border:none;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:${th.surfaceMuted};cursor:pointer;transition:all 0.15s;flex-shrink:0`)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={song.id} style={s('display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:8px;transition:background 0.12s ease')}>
                    <div style={s('flex:1;min-width:0')}>
                      <div
                        onClick={() => startEditSong(song)}
                        title="Clique para alterar o nome da faixa"
                        style={s(`color:${th.surfaceText};font-size:12.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:6px`)}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#4fd1de'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = th.surfaceText; }}
                      >
                        <span>{song.titulo}</span>
                      </div>
                      <div style={s(`color:${th.surfaceMuted};font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px`)}>
                        <span>{song.addedBy}</span>
                        {activePl && (
                          <span style={{ fontSize: 10, color: isInActivePl ? '#4fd1de' : th.surfaceMuted, background: isInActivePl ? 'rgba(79,209,222,0.12)' : 'transparent', padding: '1px 5px', borderRadius: 4 }}>
                            {isInActivePl ? `✓ em ${activePl.nome}` : `fora de ${activePl.nome}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {activePl && (
                      <button
                        onClick={() => toggleSongInPlaylist(activePl.id, song.id)}
                        title={isInActivePl ? `Remover de ${activePl.nome}` : `Adicionar a ${activePl.nome}`}
                        style={{
                          background: isInActivePl ? 'rgba(79,209,222,0.18)' : th.hoverBg,
                          border: `1px solid ${isInActivePl ? 'rgba(79,209,222,0.4)' : 'transparent'}`,
                          borderRadius: 6,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: isInActivePl ? '#4fd1de' : th.surfaceMuted,
                          fontSize: 11,
                          fontFamily: FONT,
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isInActivePl ? <Check size={11} /> : <Plus size={11} />}
                        <span>{isInActivePl ? 'Na Playlist' : '+ Playlist'}</span>
                      </button>
                    )}

                    <button onClick={song.playAudio} title="Tocar áudio" aria-label="Tocar" style={{ ...s(`background:${th.hoverBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;flex-shrink:0`), opacity: song.btnOpacity, pointerEvents: song.btnPointer }}>
                      <Play size={11} fill="currentColor" />
                    </button>
                    <button onClick={song.playVideo} title="Abrir vídeo" aria-label="Abrir vídeo" style={{ ...s(`background:${th.hoverBg};border:none;border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;flex-shrink:0`), opacity: song.btnOpacity, pointerEvents: song.btnPointer }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="14" height="14" rx="2"></rect><polygon points="16,9 22,6 22,18 16,15" fill="currentColor" stroke="none"></polygon></svg>
                    </button>
                    <button
                      onClick={() => startEditSong(song)}
                      title="Alterar nome da faixa"
                      aria-label="Alterar nome da faixa"
                      style={{
                        background: th.hoverBg,
                        border: 'none',
                        borderRadius: 6,
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: th.surfaceMuted,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4fd1de';
                        e.currentTarget.style.background = 'rgba(79,209,222,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = th.surfaceMuted;
                        e.currentTarget.style.background = th.hoverBg;
                      }}
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => deleteSong(song.id)}
                      title="Excluir faixa"
                      aria-label="Excluir faixa"
                      style={{
                        background: th.hoverBg,
                        border: 'none',
                        borderRadius: 6,
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: th.surfaceMuted,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = th.surfaceMuted;
                        e.currentTarget.style.background = th.hoverBg;
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={s(`display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid ${th.modalBorder}`)}>
              <button onClick={() => setState((s2) => ({ redirectPage: Math.max(0, s2.redirectPage - 1) }))} style={s(`background:none;border:1px solid ${th.inputBorder};border-radius:6px;padding:6px 12px;color:${th.surfaceText};font-size:12px;cursor:pointer;font-family:${FONT}`)}>{appT.prevPage}</button>
              <span style={s(`color:${th.surfaceSubtle};font-size:12px`)}>{pageLabel}</span>
              <button onClick={() => setState((s2) => ({ redirectPage: Math.min(totalPages - 1, s2.redirectPage + 1) }))} style={s(`background:none;border:1px solid ${th.inputBorder};border-radius:6px;padding:6px 12px;color:${th.surfaceText};font-size:12px;cursor:pointer;font-family:${FONT}`)}>{appT.nextPage}</button>
            </div>
          </AnimatedModal>

          {/* Playlists Modal */}
          <AnimatedModal
            isOpen={playlistModalOpen}
            onClose={() => {
              cancelPlaylistForm();
              setState({ playlistModalOpen: false });
            }}
            zIndex={66}
            overlayBg={th.overlayBg}
            contentStyle={s(`width:460px;max-width:100%;background:${th.modalBg};border:1px solid ${th.modalBorder};border-radius:16px;padding:24px;box-shadow:0 30px 60px rgba(0,0,0,0.5);max-height:86vh;overflow-y:auto;box-sizing:border-box`)}
          >
            <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(79,209,222,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                  <ListMusic size={17} />
                </div>
                <div>
                  <h2 style={s(`margin:0;color:${th.surfaceText};font-size:17px;font-weight:700`)}>{appT.playlistTitle || 'Playlists & Coleções'}</h2>
                  <div style={{ color: th.surfaceMuted, fontSize: 11 }}>{playlists.length} {playlists.length === 1 ? 'playlist cadastrada' : 'playlists cadastradas'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!playlistFormMode && (
                  <button
                    onClick={startCreatePlaylist}
                    style={s(`display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:8px;border:none;background:#2a8c97;color:#fff;font-family:${FONT};font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s`)}
                  >
                    <Plus size={13} />
                    <span>Nova Playlist</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    cancelPlaylistForm();
                    setState({ playlistModalOpen: false });
                  }}
                  style={s(`background:none;border:none;cursor:pointer;color:${th.surfaceMuted};display:flex;align-items:center;justify-content:center;padding:4px`)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* If in edit/create form mode inside Playlists Modal */}
            {playlistFormMode ? (
              <div style={s(`background:${th.inputBg};border:1px solid ${th.modalBorder};border-radius:12px;padding:16px;margin-bottom:14px;display:flex;flex-direction:column;gap:12px;box-shadow:0 6px 20px rgba(0,0,0,0.25);animation:fadeInSoft 0.15s ease both`)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(79,209,222,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4fd1de' }}>
                      {playlistFormMode === 'create' ? <Plus size={13} /> : <Pencil size={12} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: th.surfaceText }}>
                      {playlistFormMode === 'create' ? (appT.newPlaylistLabel || 'Criar Nova Playlist') : `Alterar Playlist: "${editPlaylistName || 'Sem nome'}"`}
                    </span>
                  </div>
                  <button onClick={cancelPlaylistForm} style={{ background: 'none', border: 'none', color: th.surfaceMuted, cursor: 'pointer', padding: 2 }}>
                    <X size={15} />
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', color: th.surfaceSubtle, fontSize: 11, marginBottom: 3, fontWeight: 600 }}>Nome da Playlist *</label>
                  <input
                    type="text"
                    value={playlistFormMode === 'create' ? newPlaylistName : editPlaylistName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (playlistFormMode === 'create') setState({ newPlaylistName: val });
                      else setState({ editPlaylistName: val });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') savePlaylistChanges(); }}
                    placeholder="Ex: Favoritas, Trap, Foco..."
                    style={s(`width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid ${th.inputBorder};background:${th.cardBg};color:${th.surfaceText};font-size:12.5px;font-family:${FONT};outline:none`)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: th.surfaceSubtle, fontSize: 11, fontWeight: 600 }}>
                      Músicas ({playlistFormMode === 'create' ? newPlaylistSongIds.length : editPlaylistSongIds.length} selecionadas)
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = songs.map((s) => s.id);
                          if (playlistFormMode === 'create') setState({ newPlaylistSongIds: allIds });
                          else setState({ editPlaylistSongIds: allIds });
                        }}
                        style={{ background: 'none', border: 'none', color: '#4fd1de', fontSize: 10.5, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', padding: 0 }}
                      >
                        Marcar todas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (playlistFormMode === 'create') setState({ newPlaylistSongIds: [] });
                          else setState({ editPlaylistSongIds: [] });
                        }}
                        style={{ background: 'none', border: 'none', color: th.surfaceMuted, fontSize: 10.5, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', padding: 0 }}
                      >
                        Desmarcar
                      </button>
                    </div>
                  </div>

                  <div style={s(`display:flex;flex-direction:column;gap:3px;max-height:160px;overflow-y:auto;padding:5px;background:${th.cardBg};border:1px solid ${th.inputBorder};border-radius:8px`)}>
                    {songs.map((sg) => {
                      const isChecked = playlistFormMode === 'create'
                        ? newPlaylistSongIds.includes(sg.id)
                        : editPlaylistSongIds.includes(sg.id);
                      return (
                        <label
                          key={sg.id}
                          style={s(`display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 7px;border-radius:5px;cursor:pointer;transition:background 0.12s ease;background:${isChecked ? 'rgba(79,209,222,0.08)' : 'transparent'}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (playlistFormMode === 'create') {
                                  setState((s2) => ({
                                    newPlaylistSongIds: s2.newPlaylistSongIds.includes(sg.id)
                                      ? s2.newPlaylistSongIds.filter((x) => x !== sg.id)
                                      : [...s2.newPlaylistSongIds, sg.id],
                                  }));
                                } else {
                                  setState((s2) => ({
                                    editPlaylistSongIds: s2.editPlaylistSongIds.includes(sg.id)
                                      ? s2.editPlaylistSongIds.filter((x) => x !== sg.id)
                                      : [...s2.editPlaylistSongIds, sg.id],
                                  }));
                                }
                              }}
                              style={{ accentColor: '#2a8c97', cursor: 'pointer' }}
                            />
                            <span style={{ color: th.surfaceText, fontSize: 12, fontWeight: isChecked ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sg.titulo}
                            </span>
                          </div>
                          <span style={{ color: th.surfaceMuted, fontSize: 10, flexShrink: 0 }}>{sg.addedBy}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={cancelPlaylistForm} style={s(`padding:7px 12px;border-radius:6px;border:1px solid ${th.inputBorder};background:none;color:${th.surfaceText};font-size:11.5px;cursor:pointer;font-family:${FONT}`)}>
                    Cancelar
                  </button>
                  <button type="button" onClick={savePlaylistChanges} style={s(`padding:7px 16px;border-radius:6px;border:none;background:#2a8c97;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:${FONT};display:flex;align-items:center;gap:4px`)}>
                    <Check size={13} />
                    <span>{playlistFormMode === 'create' ? 'Criar Playlist' : 'Salvar Alterações'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={s('display:flex;flex-direction:column;gap:8px;margin-bottom:14px')}>
                {playlists.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: th.surfaceMuted, fontSize: 13, border: `1px dashed ${th.modalBorder}`, borderRadius: 10 }}>
                    Nenhuma playlist criada ainda. Clique em "Nova Playlist" para criar uma!
                  </div>
                ) : (
                  playlists.map((pl) => {
                    const isActive = currentPlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        style={s(
                          `display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;border:1px solid ${isActive ? '#2a8c97' : th.surfaceBorder};background:${isActive ? 'rgba(42,140,151,0.18)' : th.hoverBg};color:${isActive ? '#fff' : th.surfaceText};transition:all 0.15s ease`
                        )}
                      >
                        <div
                          onClick={() => {
                            setState({ currentPlaylistId: pl.id, playlistModalOpen: false });
                            if (pl.songIds[0]) loadSong(pl.songIds[0], { keepPlaylist: true });
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1, minWidth: 0 }}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: isActive ? '#2a8c97' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : th.surfaceMuted, flexShrink: 0 }}>
                            <ListMusic size={14} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={s(`font-size:13.5px;font-weight:600;color:${isActive ? '#4fd1de' : th.surfaceText};overflow:hidden;text-overflow:ellipsis;white-space:nowrap`)}>
                              {pl.nome}
                            </div>
                            <div style={{ color: th.surfaceMuted, fontSize: 11, marginTop: 1 }}>
                              {pl.songIds.length} {pl.songIds.length === 1 ? 'música' : 'músicas'}
                              {isActive && ' • Ativa'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => {
                              setState({ currentPlaylistId: pl.id, playlistModalOpen: false });
                              if (pl.songIds[0]) loadSong(pl.songIds[0], { keepPlaylist: true });
                            }}
                            title="Tocar esta playlist"
                            style={s(
                              `background:${isActive ? '#2a8c97' : 'rgba(255,255,255,0.06)'};border:none;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;transition:all 0.15s`
                            )}
                          >
                            <Play size={12} fill="currentColor" />
                          </button>

                          <button
                            onClick={() => startEditPlaylist(pl)}
                            title={`Alterar playlist "${pl.nome}"`}
                            style={s(
                              `background:rgba(255,255,255,0.06);border:none;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:${th.surfaceText};cursor:pointer;transition:all 0.15s`
                            )}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(79,209,222,0.18)';
                              e.currentTarget.style.color = '#4fd1de';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                              e.currentTarget.style.color = th.surfaceText;
                            }}
                          >
                            <Pencil size={12} />
                          </button>

                          <button
                            onClick={() => deletePlaylist(pl.id)}
                            title={`Excluir playlist "${pl.nome}"`}
                            style={s(
                              `background:rgba(255,255,255,0.06);border:none;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:${th.surfaceMuted};cursor:pointer;transition:all 0.15s`
                            )}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                              e.currentTarget.style.color = th.surfaceMuted;
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </AnimatedModal>

          {/* QR Code Modal */}
          <AnimatedModal
            isOpen={whatsappQrModalOpen}
            onClose={() => setState({ whatsappQrModalOpen: false })}
            zIndex={999}
            overlayBg="rgba(0,0,0,0.75)"
            backdropStyle={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            contentStyle={s(`width:440px;max-width:96vw;background:#111b21;border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:26px;box-shadow:0 30px 70px rgba(0,0,0,0.65);color:#e9edef;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center`)}
          >
            <div style={s('width:100%;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
              <div style={s('display:flex;align-items:gap:8px', 'display:flex;align-items:center;gap:8px')}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9edef' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e9edef' }}>{appT.whatsappQrTitle || 'Conectar Chat'}</span>
              </div>
              <button
                onClick={() => setState({ whatsappQrModalOpen: false })}
                style={s('background:none;border:none;cursor:pointer;color:#8696a0;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:6px')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#8696a0', lineHeight: 1.5, margin: '0 0 18px', textAlign: 'center' }}>
              {appT.whatsappQrInstruction || 'Abra o aplicativo de mensagens no seu celular > Dispositivos Conectados > Conectar e aponte a câmera para esta tela.'}
            </p>

            <div style={{ marginBottom: 18 }}>
              <QRCodeSVG data={whatsappQrData || 'SESSION_AUTH'} size={210} />
            </div>

            <div style={{ fontSize: 11.5, color: '#8696a0', marginBottom: 18, background: '#202c33', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fd1de', display: 'inline-block' }} />
              <span>{appT.whatsappServerLabel || 'Servidor:'} {wahaServerUrl}</span>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => handleConnectWhatsapp(true)}
                style={s(`width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#ffffff;font-size:13.5px;font-weight:700;cursor:pointer;font-family:${FONT};transition:all 0.15s`)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {appT.whatsappQrSimulate || 'Simular Conexão'}
              </button>
              <button
                onClick={() => setState({ whatsappQrModalOpen: false })}
                style={s(`width:100%;padding:9px;border-radius:10px;border:1px solid transparent;background:transparent;color:#8696a0;font-size:12.5px;font-weight:600;cursor:pointer;font-family:${FONT}`)}
              >
                Cancelar
              </button>
            </div>
          </AnimatedModal>

          {/* Internal Chat Modal */}
          <AnimatedModal
            isOpen={whatsappChatModalOpen}
            onClose={() => setState({ whatsappChatModalOpen: false })}
            zIndex={9999}
            overlayBg="rgba(0,0,0,0.78)"
            backdropStyle={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '12px' }}
            contentStyle={{
              width: 720,
              minWidth: 360,
              maxWidth: 'calc(100vw - 24px)',
              height: 640,
              minHeight: 400,
              maxHeight: 'calc(100vh - 24px)',
              background: '#111b21',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              resize: 'both',
              fontFamily: FONT,
              boxSizing: 'border-box',
            }}
          >
            {(() => {
              const activeChat = safeWhatsappChats.find((c) => c.id === whatsappActiveChatId) || safeWhatsappChats[0];
              const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '😉', '😊', '😍', '🚀', '🔥', '👍', '👏', '🎉', '✅', '✨', '💡', '📌', '📋', '🎯'];

              return (
                <>
                  {/* Top Bar for Bate-papo Geral */}
                  <div style={{
                    minHeight: 56,
                    background: '#202c33',
                    borderBottom: '1px solid #2a3942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    flexShrink: 0,
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2a8c97 0%, #155e69 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ color: '#e9edef', fontSize: 14, fontWeight: 700, letterSpacing: '0.01em', fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {appT.generalChatTitle || 'Bate-papo Geral'}
                        </span>
                        <span style={{ fontSize: 11, color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {appT.generalChatSubtitle || 'Yeezy, Rezada, Lil Man e você'} • <span style={{ color: '#4fd1de', fontWeight: 600 }}>4 online</span>
                        </span>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={handleClearWhatsappCache}
                        title="Limpar histórico de mensagens"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8696a0',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 12,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#8696a0'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => setState({ whatsappChatModalOpen: false })}
                        title="Fechar"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8696a0',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#8696a0'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  {activeChat ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a', minHeight: 0, position: 'relative' }}>
                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                      }}>
                        <div style={{ alignSelf: 'center', margin: '2px 0 10px' }}>
                          <div style={{
                            background: '#182229',
                            color: '#8696a0',
                            fontSize: 11,
                            padding: '5px 12px',
                            borderRadius: 8,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          }}>
                            <Lock size={12} style={{ flexShrink: 0 }} />
                            <span>Bate-papo Geral • Mensagens salvas localmente no cache (mensagens efêmeras não persistem)</span>
                          </div>
                        </div>

                        {(activeChat.messages || []).map((m) => {
                          const isMe = m.sender === 'me';
                          return (
                            <div
                              key={m.id}
                              style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '78%',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <div style={{
                                background: isMe ? (m.isEphemeral ? '#263b40' : '#2a3942') : (m.isEphemeral ? '#1a2c30' : '#202c33'),
                                color: '#e9edef',
                                borderRadius: isMe ? '10px 0px 10px 10px' : '0px 10px 10px 10px',
                                padding: '7px 12px 6px',
                                border: m.isEphemeral
                                  ? '1px dashed rgba(245, 158, 11, 0.55)'
                                  : (isMe ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)'),
                                boxShadow: m.isEphemeral ? '0 1px 6px rgba(245,158,11,0.12)' : '0 1px 3px rgba(0,0,0,0.35)',
                                position: 'relative',
                                wordBreak: 'break-word',
                              }}>
                                {m.author && (
                                  <div style={{ fontSize: 11, fontWeight: 700, color: m.authorBg || '#4fd1de', marginBottom: 2 }}>
                                    {m.author}
                                  </div>
                                )}
                                <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{m.text}</div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: 4,
                                  marginTop: 3,
                                  fontSize: 10,
                                  color: '#8696a0',
                                }}>
                                  {m.isEphemeral && (
                                    <span style={{ color: '#fbbf24', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, marginRight: 2 }}>
                                      <Timer size={11} style={{ flexShrink: 0 }} />
                                      <span>{appT.ephemeralMode || 'Efêmera'}</span>
                                    </span>
                                  )}
                                  <span>{m.timestamp}</span>
                                  {isMe && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4fd1de" strokeWidth="2.4">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Emoji Picker */}
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

                      {/* Ephemeral Mode Banner */}
                      {whatsappEphemeralMode && (
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          borderTop: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '6px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#fbbf24',
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Timer size={13} style={{ flexShrink: 0 }} />
                            <span>{appT.ephemeralBanner || 'Modo Efêmero ativo: esta mensagem não é gravada no cache e sumirá ao recarregar'}</span>
                          </span>
                          <button
                            onClick={() => setState({ whatsappEphemeralMode: false })}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#fbbf24',
                              cursor: 'pointer',
                              fontSize: 11,
                              textDecoration: 'underline',
                              fontWeight: 700,
                              padding: '2px 6px',
                            }}
                          >
                            Desativar
                          </button>
                        </div>
                      )}

                      {/* Message Input Footer */}
                      <div style={{
                        minHeight: 56,
                        background: '#202c33',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexShrink: 0,
                        borderTop: '1px solid #222d34',
                      }}>
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

                        <button
                          onClick={() => setState((s2) => ({ whatsappEphemeralMode: !s2.whatsappEphemeralMode }))}
                          style={{
                            background: whatsappEphemeralMode ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                            border: whatsappEphemeralMode ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
                            color: whatsappEphemeralMode ? '#fbbf24' : '#8696a0',
                            cursor: 'pointer',
                            padding: '6px 9px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11.5,
                            fontWeight: 600,
                            fontFamily: FONT,
                            transition: 'all 0.15s ease',
                          }}
                          title={whatsappEphemeralMode ? 'Desativar modo efêmero' : 'Ativar mensagem efêmera (sem persistência)'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>{appT.ephemeralMode || 'Efêmera'}</span>
                        </button>

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
                          placeholder={whatsappEphemeralMode ? (appT.whatsappTypeEphemeralMessage || 'Digite uma mensagem efêmera...') : (appT.whatsappTypeMessage || 'Digite uma mensagem...')}
                          style={{
                            flex: 1,
                            background: whatsappEphemeralMode ? 'rgba(245, 158, 11, 0.08)' : '#2a3942',
                            border: whatsappEphemeralMode ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid transparent',
                            outline: 'none',
                            borderRadius: 8,
                            padding: '10px 14px',
                            color: '#d1d7db',
                            fontSize: 13.5,
                            fontFamily: FONT,
                            transition: 'all 0.15s ease',
                          }}
                        />

                        <button
                          onClick={sendWhatsappMessage}
                          disabled={!whatsappMessageDraft.trim()}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: whatsappEphemeralMode && whatsappMessageDraft.trim() ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                            border: whatsappMessageDraft.trim()
                              ? (whatsappEphemeralMode ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255,255,255,0.3)')
                              : '1px solid rgba(255,255,255,0.1)',
                            color: whatsappMessageDraft.trim()
                              ? (whatsappEphemeralMode ? '#fbbf24' : '#ffffff')
                              : '#8696a0',
                            cursor: whatsappMessageDraft.trim() ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            })()}
          </AnimatedModal>
        </div>
      )}
    </div>
  );
}

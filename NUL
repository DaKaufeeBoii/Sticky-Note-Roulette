// ===================================================================
// STICKY NOTE ROULETTE — CONTROLLER
// ===================================================================

const STATE = {
  activeBoard: null,
  allNotes: [],
  selectedNoteIds: new Set(),
  currentIdeas: [],
  weirderIdeas: [],
  isConnecting: false,
  isWeirding: false,
  availableBoards: []
};

// Client Settings saved in localStorage (overrides .env if set)
const SETTINGS = {
  miroToken: localStorage.getItem('snr_miro_token') || '',
  boardId: localStorage.getItem('snr_board_id') || '',
  qwenKey: localStorage.getItem('snr_qwen_key') || '',
  qwenUrl: localStorage.getItem('snr_qwen_url') || '',
  qwenModel: localStorage.getItem('snr_qwen_model') || ''
};

// Color palettes for notes
const STICKY_COLOR_CLASSES = ['note-yellow', 'note-cyan', 'note-pink', 'note-green', 'note-orange', 'note-purple'];

// Helper to construct headers with dynamic credentials
function getApiHeaders(additional = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...additional
  };

  if (SETTINGS.miroToken) headers['x-miro-token'] = SETTINGS.miroToken;
  if (SETTINGS.boardId) headers['x-miro-board-id'] = SETTINGS.boardId;
  if (SETTINGS.qwenKey) headers['x-qwen-key'] = SETTINGS.qwenKey;
  if (SETTINGS.qwenUrl) headers['x-qwen-url'] = SETTINGS.qwenUrl;
  if (SETTINGS.qwenModel) headers['x-qwen-model'] = SETTINGS.qwenModel;

  return headers;
}

// -------------------------------------------------------------
// Toast Notifications
// -------------------------------------------------------------
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    info: '💡',
    success: '✅',
    error: '⚠️',
    warning: '⚡'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// -------------------------------------------------------------
// Initialization & Config Status
// -------------------------------------------------------------
async function initApp() {
  bindEvents();
  syncSettingsModalInputs();

  try {
    // 1. Check default server status
    const statusRes = await fetch('/api/config-status', { headers: getApiHeaders() });
    if (statusRes.ok) {
      const config = await statusRes.json();
      if (!SETTINGS.boardId && config.defaultBoardId) {
        SETTINGS.boardId = config.defaultBoardId;
      }
    }

    // 2. Fetch available boards from Miro
    loadUserBoards();

    // 3. Load sticky notes for the active board
    loadStickyNotes();

  } catch (err) {
    console.error('Initialization error:', err);
    showToast('Failed to initialize: ' + err.message, 'error');
  }
}

// Fetch all accessible boards from Miro
async function loadUserBoards() {
  const dropdown = document.getElementById('boardSelectDropdown');
  try {
    const res = await fetch('/api/boards', { headers: getApiHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      dropdown.innerHTML = `<option value="">Boards unavailable (${err.error || res.statusText})</option>`;
      return;
    }

    const data = await res.json();
    STATE.availableBoards = data.boards || [];

    if (STATE.availableBoards.length === 0) {
      dropdown.innerHTML = '<option value="">No boards found on this account</option>';
      return;
    }

    dropdown.innerHTML = STATE.availableBoards.map(b => `
      <option value="${b.id}" ${b.id === SETTINGS.boardId ? 'selected' : ''}>
        ${escapeHtml(b.name)} (${b.id})
      </option>
    `).join('');

    // If no active board selected, default to the first one
    if (!SETTINGS.boardId && STATE.availableBoards.length > 0) {
      SETTINGS.boardId = STATE.availableBoards[0].id;
      loadStickyNotes();
    }

  } catch (e) {
    console.warn('Could not list boards:', e);
    dropdown.innerHTML = '<option value="">Manual Board Entry Only</option>';
  }
}

// Load sticky notes from active board
async function loadStickyNotes() {
  const grid = document.getElementById('notesCanvasGrid');
  const spinIcon = document.querySelector('.board-refresh-btn .spin-icon');
  if (spinIcon) spinIcon.classList.add('spinning');

  grid.innerHTML = `
    <div class="notes-loading-placeholder">
      <div class="spinner"></div>
      <p>Syncing notes with Miro board...</p>
    </div>
  `;

  try {
    const query = SETTINGS.boardId ? `?boardId=${encodeURIComponent(SETTINGS.boardId)}` : '';
    const res = await fetch(`/api/sticky-notes${query}`, { headers: getApiHeaders() });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: Failed to load sticky notes`);
    }

    const data = await res.json();
    STATE.activeBoard = data.board;
    STATE.allNotes = data.stickyNotes || [];

    // Select all by default
    STATE.selectedNoteIds = new Set(STATE.allNotes.map(n => n.id));

    // Update UI headers
    updateBoardMetadataUI();
    renderStickyNotesGrid();
    updateSelectionCounter();

  } catch (error) {
    console.error('Error loading notes:', error);
    grid.innerHTML = `
      <div class="notes-loading-placeholder" style="border-color: rgba(239, 68, 68, 0.4);">
        <p style="color: #f87171; font-weight: 600;">⚠️ ${escapeHtml(error.message)}</p>
        <button class="pill-btn highlight" onclick="openSettingsModal()">Check Miro Settings / Token</button>
      </div>
    `;
    showToast(error.message, 'error', 7000);
  } finally {
    if (spinIcon) spinIcon.classList.remove('spinning');
  }
}

// Update Active Board UI Elements
function updateBoardMetadataUI() {
  const boardTitleEl = document.getElementById('currentBoardTitle');
  const navBoardNameEl = document.getElementById('navBoardName');
  const miroLinkBtn = document.getElementById('openMiroLinkBtn');

  if (STATE.activeBoard) {
    boardTitleEl.textContent = STATE.activeBoard.name || 'Untitled Board';
    navBoardNameEl.textContent = STATE.activeBoard.name || 'Active Board';
    miroLinkBtn.href = STATE.activeBoard.viewLink || `https://miro.com/app/board/${STATE.activeBoard.id}/`;
    miroLinkBtn.style.display = 'inline-flex';
  } else {
    boardTitleEl.textContent = SETTINGS.boardId || 'No Board Selected';
    navBoardNameEl.textContent = SETTINGS.boardId || 'No Board';
    miroLinkBtn.style.display = 'none';
  }

  // Update dropdown selection if present
  const dropdown = document.getElementById('boardSelectDropdown');
  if (dropdown && SETTINGS.boardId) {
    dropdown.value = SETTINGS.boardId;
  }
}

// -------------------------------------------------------------
// Render Interactive Sticky Notes Grid
// -------------------------------------------------------------
function renderStickyNotesGrid(filterText = '') {
  const grid = document.getElementById('notesCanvasGrid');
  grid.innerHTML = '';

  const filteredNotes = STATE.allNotes.filter(n =>
    !filterText || n.text.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filteredNotes.length === 0) {
    if (STATE.allNotes.length === 0) {
      grid.innerHTML = `
        <div class="notes-loading-placeholder">
          <p style="font-weight: 600;">No sticky notes found on this board.</p>
          <p style="font-size: 0.9rem; color: var(--text-dim);">Add some notes in Miro or click "New Note" above!</p>
          <button class="pill-btn highlight" onclick="openAddNoteModal()">+ Add Note Now</button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="notes-loading-placeholder">
          <p>No notes matching "${escapeHtml(filterText)}"</p>
        </div>
      `;
    }
    return;
  }

  filteredNotes.forEach((note, index) => {
    const isSelected = STATE.selectedNoteIds.has(note.id);
    const colorClass = STICKY_COLOR_CLASSES[index % STICKY_COLOR_CLASSES.length];

    const card = document.createElement('div');
    card.className = `sticky-note-card ${colorClass} ${isSelected ? 'selected' : 'unselected'}`;
    card.dataset.id = note.id;

    card.innerHTML = `
      <div class="note-pin"></div>
      <div class="note-body">${escapeHtml(note.text)}</div>
      <div class="note-footer">
        <span>#${index + 1}</span>
        <div class="note-checkbox" title="${isSelected ? 'Deselect' : 'Select'}"></div>
      </div>
    `;

    card.addEventListener('click', () => toggleNoteSelection(note.id));
    grid.appendChild(card);
  });

  // Append "+ Add Note" card at the end
  const addCard = document.createElement('div');
  addCard.className = 'add-note-card';
  addCard.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    <span style="font-weight: 600; font-size: 0.9rem;">Add Note</span>
  `;
  addCard.addEventListener('click', openAddNoteModal);
  grid.appendChild(addCard);
}

function toggleNoteSelection(noteId) {
  if (STATE.selectedNoteIds.has(noteId)) {
    STATE.selectedNoteIds.delete(noteId);
  } else {
    STATE.selectedNoteIds.add(noteId);
  }

  // Update card classes without re-rendering entire grid
  const card = document.querySelector(`.sticky-note-card[data-id="${noteId}"]`);
  if (card) {
    const isSelected = STATE.selectedNoteIds.has(noteId);
    card.classList.toggle('selected', isSelected);
    card.classList.toggle('unselected', !isSelected);
  }

  updateSelectionCounter();
}

function updateSelectionCounter() {
  const counterEl = document.getElementById('selectionCounter');
  const spinBtn = document.getElementById('spinRouletteBtn');
  const tickerPreview = document.getElementById('tickerPreview');

  const count = STATE.selectedNoteIds.size;
  const total = STATE.allNotes.length;

  counterEl.textContent = `${count} of ${total} selected`;

  if (count < 2) {
    spinBtn.disabled = true;
    tickerPreview.textContent = 'Select at least 2 notes above to begin roulette';
  } else {
    spinBtn.disabled = false;
    const selectedTexts = STATE.allNotes
      .filter(n => STATE.selectedNoteIds.has(n.id))
      .map(n => n.text)
      .slice(0, 4)
      .join(', ');
    tickerPreview.textContent = `Connecting: ${selectedTexts}${count > 4 ? ` + ${count - 4} more` : ''}`;
  }
}

// -------------------------------------------------------------
// Roulette Ideation Engine (Connect & Sync)
// -------------------------------------------------------------
async function spinRoulette() {
  const selectedNotes = STATE.allNotes.filter(n => STATE.selectedNoteIds.has(n.id));
  if (selectedNotes.length < 2) {
    showToast('Please select at least 2 sticky notes to connect!', 'warning');
    return;
  }

  const spinBtn = document.getElementById('spinRouletteBtn');
  const loaderMessage = document.getElementById('loaderMessage');
  spinBtn.classList.add('loading');
  spinBtn.disabled = true;

  const messages = [
    'Rolling the Roulette...',
    'Analyzing conceptual friction...',
    'Consulting Qwen 3.8 Max...',
    'Synthesizing cross-domain synergies...',
    'Writing idea cards to Miro board...'
  ];

  let msgIdx = 0;
  loaderMessage.textContent = messages[0];
  const timer = setInterval(() => {
    msgIdx = (msgIdx + 1) % messages.length;
    loaderMessage.textContent = messages[msgIdx];
  }, 2200);

  try {
    // 1. Generate ideas with AI
    const connectRes = await fetch('/api/connect', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        notes: selectedNotes,
        boardId: SETTINGS.boardId
      })
    });

    if (!connectRes.ok) {
      const err = await connectRes.json().catch(() => ({}));
      throw new Error(err.error || `AI Error (${connectRes.status})`);
    }

    const data = await connectRes.json();
    STATE.currentIdeas = data.ideas || [];

    // Render Ideas on frontend immediately
    renderIdeasShowcase(STATE.currentIdeas);

    loaderMessage.textContent = 'Writing idea shapes & connectors to Miro...';

    // 2. Post shapes and connectors to Miro
    const saveRes = await fetch('/api/create-ideas', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        ideas: STATE.currentIdeas,
        sourceNotes: selectedNotes,
        boardId: SETTINGS.boardId
      })
    });

    if (saveRes.ok) {
      showToast('🎉 3 ideas created and connected on your Miro board!', 'success');
    } else {
      const saveErr = await saveRes.json().catch(() => ({}));
      showToast(`Ideas generated! (Miro shape notice: ${saveErr.error || 'Check board permissions'})`, 'warning');
    }

    // Scroll smoothly to ideas
    document.getElementById('ideasSection').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Spin error:', error);
    showToast(error.message, 'error', 7000);
  } finally {
    clearInterval(timer);
    spinBtn.classList.remove('loading');
    spinBtn.disabled = false;
  }
}

// Render generated idea cards
function renderIdeasShowcase(ideas) {
  const container = document.getElementById('ideasSection');
  const grid = document.getElementById('ideasShowcaseGrid');
  grid.innerHTML = '';

  const tiers = [
    { label: '🎯 The Practical Anchor', class: 'anchor' },
    { label: '⚡ The Creative Leap', class: 'leap' },
    { label: '🦄 The Borderline Ridiculous', class: 'wild' }
  ];

  ideas.forEach((idea, idx) => {
    const tier = tiers[idx % tiers.length];
    const buildability = Math.min(10, Math.max(1, Number(idea.buildability) || 7));
    const percent = buildability * 10;

    const card = document.createElement('div');
    card.className = 'idea-showcase-card';

    const sourcePills = (idea.source_notes || []).map(text =>
      `<span class="source-pill-tag">${escapeHtml(text)}</span>`
    ).join('');

    card.innerHTML = `
      <div class="idea-card-header">
        <span class="idea-tier-badge">${tier.label}</span>
        <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim);">#0${idx + 1}</span>
      </div>

      <h4 class="idea-card-title">${escapeHtml(idea.title)}</h4>
      <p class="idea-card-description">${escapeHtml(idea.description)}</p>

      <div class="idea-source-notes-row">
        ${sourcePills}
      </div>

      <div class="idea-connection-quote">
        <strong>Why it connects:</strong> "${escapeHtml(idea.connection)}"
      </div>

      <div class="idea-card-footer">
        <div class="buildability-gauge-wrap" title="Buildability score: ${buildability}/10">
          <span class="gauge-label">Buildability</span>
          <div class="gauge-track">
            <div class="gauge-fill" style="width: ${percent}%;"></div>
          </div>
          <span class="gauge-value">${buildability}/10</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.style.display = 'block';
}

// -------------------------------------------------------------
// Make It Weirder (Amplify to 11)
// -------------------------------------------------------------
async function amplifyWeirder() {
  const selectedNotes = STATE.allNotes.filter(n => STATE.selectedNoteIds.has(n.id));
  const btn = document.getElementById('amplifyWeirdnessBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Amplifying Weirdness...`;

  try {
    const res = await fetch('/api/make-weirder', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        ideas: STATE.currentIdeas,
        sourceNotes: selectedNotes,
        boardId: SETTINGS.boardId
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to amplify weirdness');
    }

    const data = await res.json();
    STATE.weirderIdeas = data.ideas || [];

    renderWeirderShowcase(STATE.weirderIdeas);
    showToast('🌀 3 high-weirdness cards created at x=2100 on your Miro board!', 'success');

    document.getElementById('weirderSection').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Weirder error:', error);
    showToast(error.message, 'error', 7000);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span class="fire-icon">🌀</span><span>MAKE IT WEIRDER</span>`;
  }
}

function renderWeirderShowcase(ideas) {
  const container = document.getElementById('weirderSection');
  const grid = document.getElementById('weirderShowcaseGrid');
  grid.innerHTML = '';

  ideas.forEach((idea, idx) => {
    const buildability = Math.min(10, Math.max(1, Number(idea.buildability) || 5));
    const percent = buildability * 10;

    const card = document.createElement('div');
    card.className = 'idea-showcase-card weirder';

    const sourcePills = (idea.source_notes || []).map(text =>
      `<span class="source-pill-tag" style="background: rgba(255,107,53,0.15); border-color: rgba(255,107,53,0.3); color: #ff9d6c;">${escapeHtml(text)}</span>`
    ).join('');

    card.innerHTML = `
      <div class="idea-card-header">
        <span class="idea-tier-badge" style="color: #ff9d6c;">🌀 Dimension Shift #0${idx + 1}</span>
      </div>

      <h4 class="idea-card-title">🌀 ${escapeHtml(idea.title)}</h4>
      <p class="idea-card-description">${escapeHtml(idea.description)}</p>

      <div class="idea-source-notes-row">
        ${sourcePills}
      </div>

      <div class="idea-connection-quote" style="border-left-color: var(--accent-orange);">
        <strong>Core logic:</strong> "${escapeHtml(idea.connection)}"
      </div>

      <div class="idea-card-footer">
        <div class="buildability-gauge-wrap">
          <span class="gauge-label">Buildability</span>
          <div class="gauge-track">
            <div class="gauge-fill" style="width: ${percent}%; background: linear-gradient(90deg, #ff6b35 0%, #ea580c 100%);"></div>
          </div>
          <span class="gauge-value">${buildability}/10</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  container.style.display = 'block';
}

// -------------------------------------------------------------
// Quick Note Creation on Miro
// -------------------------------------------------------------
let selectedNoteColor = 'light_yellow';

function openAddNoteModal() {
  document.getElementById('newNoteContent').value = '';
  document.getElementById('addNoteModalBackdrop').classList.add('show');
  document.getElementById('newNoteContent').focus();
}

function closeAddNoteModal() {
  document.getElementById('addNoteModalBackdrop').classList.remove('show');
}

async function submitNewStickyNote() {
  const contentEl = document.getElementById('newNoteContent');
  const text = contentEl.value.trim();
  if (!text) {
    showToast('Please type some text for your note.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('submitNewNoteBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Posting...';

  try {
    const res = await fetch('/api/sticky-notes', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        text,
        fillColor: selectedNoteColor,
        boardId: SETTINGS.boardId
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create sticky note on Miro');
    }

    const newNote = await res.json();
    STATE.allNotes.push(newNote);
    STATE.selectedNoteIds.add(newNote.id);

    renderStickyNotesGrid();
    updateSelectionCounter();
    closeAddNoteModal();
    showToast(`Sticky note "${text}" added to your Miro board!`, 'success');

  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post to Board';
  }
}

// -------------------------------------------------------------
// Settings Modal
// -------------------------------------------------------------
function openSettingsModal() {
  syncSettingsModalInputs();
  document.getElementById('settingsModalBackdrop').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModalBackdrop').classList.remove('show');
}

function syncSettingsModalInputs() {
  document.getElementById('settingsMiroToken').value = SETTINGS.miroToken || '';
  document.getElementById('settingsBoardId').value = SETTINGS.boardId || '';
  document.getElementById('settingsQwenModel').value = SETTINGS.qwenModel || 'Qwen-Ambassador/Qwen3.8-Max';
  document.getElementById('settingsQwenUrl').value = SETTINGS.qwenUrl || '';
  document.getElementById('settingsQwenKey').value = SETTINGS.qwenKey || '';
}

function saveSettings() {
  const token = document.getElementById('settingsMiroToken').value.trim();
  let boardId = document.getElementById('settingsBoardId').value.trim();
  const qwenModel = document.getElementById('settingsQwenModel').value.trim();
  const qwenUrl = document.getElementById('settingsQwenUrl').value.trim();
  const qwenKey = document.getElementById('settingsQwenKey').value.trim();

  // Clean Board ID from URL if pasted
  const urlMatch = boardId.match(/board\/([a-zA-Z0-9_\-=]+)/);
  if (urlMatch) boardId = urlMatch[1];
  boardId = boardId.replace(/[\/'"]/g, '');

  SETTINGS.miroToken = token;
  SETTINGS.boardId = boardId;
  SETTINGS.qwenModel = qwenModel;
  SETTINGS.qwenUrl = qwenUrl;
  SETTINGS.qwenKey = qwenKey;

  // Persist in localStorage
  localStorage.setItem('snr_miro_token', token);
  localStorage.setItem('snr_board_id', boardId);
  localStorage.setItem('snr_qwen_model', qwenModel);
  localStorage.setItem('snr_qwen_url', qwenUrl);
  localStorage.setItem('snr_qwen_key', qwenKey);

  closeSettingsModal();
  showToast('Settings saved & applied!', 'success');

  // Reload board and notes
  loadUserBoards();
  loadStickyNotes();
}

function resetSettingsToDefaults() {
  SETTINGS.miroToken = '';
  SETTINGS.boardId = '';
  SETTINGS.qwenModel = '';
  SETTINGS.qwenUrl = '';
  SETTINGS.qwenKey = '';

  localStorage.removeItem('snr_miro_token');
  localStorage.removeItem('snr_board_id');
  localStorage.removeItem('snr_qwen_model');
  localStorage.removeItem('snr_qwen_url');
  localStorage.removeItem('snr_qwen_key');

  syncSettingsModalInputs();
  closeSettingsModal();
  showToast('Reset to server .env defaults.', 'info');

  loadUserBoards();
  loadStickyNotes();
}

// -------------------------------------------------------------
// Bind All Event Listeners
// -------------------------------------------------------------
function bindEvents() {
  // Board Switcher Dropdown
  document.getElementById('boardSelectDropdown').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && val !== SETTINGS.boardId) {
      SETTINGS.boardId = val;
      localStorage.setItem('snr_board_id', val);
      loadStickyNotes();
      showToast(`Switched to board: ${val}`, 'info');
    }
  });

  // Custom Board URL / ID input
  document.getElementById('applyCustomBoardBtn').addEventListener('click', () => {
    const input = document.getElementById('customBoardInput');
    let val = input.value.trim();
    if (!val) return;

    const urlMatch = val.match(/board\/([a-zA-Z0-9_\-=]+)/);
    if (urlMatch) val = urlMatch[1];
    val = val.replace(/[\/'"]/g, '');

    SETTINGS.boardId = val;
    localStorage.setItem('snr_board_id', val);
    input.value = '';
    loadStickyNotes();
    showToast(`Loaded board: ${val}`, 'success');
  });

  // Refresh Board Notes
  document.getElementById('refreshBoardBtn').addEventListener('click', loadStickyNotes);

  // Search Notes Filter
  document.getElementById('noteSearchInput').addEventListener('input', (e) => {
    renderStickyNotesGrid(e.target.value);
  });

  // Selection Buttons
  document.getElementById('selectAllNotesBtn').addEventListener('click', () => {
    STATE.selectedNoteIds = new Set(STATE.allNotes.map(n => n.id));
    renderStickyNotesGrid(document.getElementById('noteSearchInput').value);
    updateSelectionCounter();
  });

  document.getElementById('deselectAllNotesBtn').addEventListener('click', () => {
    STATE.selectedNoteIds.clear();
    renderStickyNotesGrid(document.getElementById('noteSearchInput').value);
    updateSelectionCounter();
  });

  document.getElementById('randomPickNotesBtn').addEventListener('click', () => {
    if (STATE.allNotes.length === 0) return;
    const shuffled = [...STATE.allNotes].sort(() => 0.5 - Math.random());
    const count = Math.min(4, Math.max(2, Math.floor(STATE.allNotes.length / 2)));
    STATE.selectedNoteIds = new Set(shuffled.slice(0, count).map(n => n.id));
    renderStickyNotesGrid(document.getElementById('noteSearchInput').value);
    updateSelectionCounter();
    showToast(`Randomly picked ${count} notes!`, 'info');
  });

  // Spin Roulette
  document.getElementById('spinRouletteBtn').addEventListener('click', spinRoulette);

  // Amplify Weirdness
  document.getElementById('amplifyWeirdnessBtn').addEventListener('click', amplifyWeirder);

  // Settings Modal Triggers
  document.getElementById('openSettingsBtn').addEventListener('click', openSettingsModal);
  document.getElementById('closeSettingsModalBtn').addEventListener('click', closeSettingsModal);
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('resetDefaultsBtn').addEventListener('click', resetSettingsToDefaults);

  // Add Note Modal Triggers
  document.getElementById('openAddNoteBtn').addEventListener('click', openAddNoteModal);
  document.getElementById('closeAddNoteModalBtn').addEventListener('click', closeAddNoteModal);
  document.getElementById('cancelAddNoteBtn').addEventListener('click', closeAddNoteModal);
  document.getElementById('submitNewNoteBtn').addEventListener('click', submitNewStickyNote);

  // Color picker choices
  document.querySelectorAll('.color-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedNoteColor = btn.dataset.color;
    });
  });

  // Toggle token password visibility
  document.getElementById('toggleTokenVisibilityBtn').addEventListener('click', (e) => {
    const input = document.getElementById('settingsMiroToken');
    if (input.type === 'password') {
      input.type = 'text';
      e.target.textContent = 'Hide';
    } else {
      input.type = 'password';
      e.target.textContent = 'Show';
    }
  });

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettingsModal();
      closeAddNoteModal();
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeSettingsModal();
        closeAddNoteModal();
      }
    });
  });
}

// Utility to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Start app
window.addEventListener('DOMContentLoaded', initApp);

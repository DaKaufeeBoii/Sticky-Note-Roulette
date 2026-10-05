import { AppSettings, ConfigStatus, GeneratedIdea, MiroBoard, StickyNote } from '../types';

export function cleanBoardId(boardIdOrUrl: string): string {
  if (!boardIdOrUrl) return '';
  const match = boardIdOrUrl.match(/board\/([a-zA-Z0-9_\-=]+)/);
  if (match) {
    return match[1].replace(/[\/'"]/g, '');
  }
  return boardIdOrUrl.replace(/[\/'"]/g, '').trim();
}

function getHeaders(settings: AppSettings, customBoardId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const boardId = cleanBoardId(customBoardId || settings.boardId);

  if (settings.miroToken) headers['x-miro-token'] = settings.miroToken.trim();
  if (boardId) headers['x-miro-board-id'] = boardId;
  if (settings.qwenKey) headers['x-qwen-key'] = settings.qwenKey.trim();
  if (settings.qwenUrl) headers['x-qwen-url'] = settings.qwenUrl.trim();
  if (settings.qwenModel) headers['x-qwen-model'] = settings.qwenModel.trim();

  return headers;
}

function formatUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export const ApiService = {
  async getConfigStatus(settings: AppSettings): Promise<ConfigStatus> {
    const url = formatUrl(settings.apiUrl, '/api/config-status');
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(settings),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch config status (${res.status})`);
    }

    return await res.json();
  },

  async getBoards(settings: AppSettings): Promise<MiroBoard[]> {
    const url = formatUrl(settings.apiUrl, '/api/boards');
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(settings),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch boards (${res.status})`);
    }

    const data = await res.json();
    return data.boards || [];
  },

  async getStickyNotes(
    settings: AppSettings,
    boardIdOverride?: string
  ): Promise<{ board: MiroBoard; stickyNotes: StickyNote[] }> {
    const targetBoardId = cleanBoardId(boardIdOverride || settings.boardId);
    const query = targetBoardId ? `?boardId=${encodeURIComponent(targetBoardId)}` : '';
    const url = formatUrl(settings.apiUrl, `/api/sticky-notes${query}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(settings, targetBoardId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch sticky notes (${res.status})`);
    }

    return await res.json();
  },

  async createStickyNote(
    settings: AppSettings,
    text: string,
    fillColor = 'light_yellow',
    boardIdOverride?: string
  ): Promise<StickyNote> {
    const targetBoardId = cleanBoardId(boardIdOverride || settings.boardId);
    const url = formatUrl(settings.apiUrl, '/api/sticky-notes');

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(settings, targetBoardId),
      body: JSON.stringify({
        text,
        fillColor,
        boardId: targetBoardId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create sticky note (${res.status})`);
    }

    return await res.json();
  },

  async connectIdeas(
    settings: AppSettings,
    notes: StickyNote[],
    boardIdOverride?: string
  ): Promise<{ ideas: GeneratedIdea[] }> {
    const targetBoardId = cleanBoardId(boardIdOverride || settings.boardId);
    const url = formatUrl(settings.apiUrl, '/api/connect');

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(settings, targetBoardId),
      body: JSON.stringify({
        notes,
        boardId: targetBoardId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `AI Ideation Error (${res.status})`);
    }

    return await res.json();
  },

  async createIdeasOnMiro(
    settings: AppSettings,
    ideas: GeneratedIdea[],
    sourceNotes: StickyNote[],
    boardIdOverride?: string
  ): Promise<{ success: boolean; ideas: GeneratedIdea[]; boardUrl?: string }> {
    const targetBoardId = cleanBoardId(boardIdOverride || settings.boardId);
    const url = formatUrl(settings.apiUrl, '/api/create-ideas');

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(settings, targetBoardId),
      body: JSON.stringify({
        ideas,
        sourceNotes,
        boardId: targetBoardId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create ideas on Miro (${res.status})`);
    }

    return await res.json();
  },

  async makeIdeasWeirder(
    settings: AppSettings,
    ideas: GeneratedIdea[],
    sourceNotes: StickyNote[],
    boardIdOverride?: string
  ): Promise<{ ideas: GeneratedIdea[]; created: GeneratedIdea[]; boardUrl?: string }> {
    const targetBoardId = cleanBoardId(boardIdOverride || settings.boardId);
    const url = formatUrl(settings.apiUrl, '/api/make-weirder');

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(settings, targetBoardId),
      body: JSON.stringify({
        ideas,
        sourceNotes,
        boardId: targetBoardId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to amplify weirdness (${res.status})`);
    }

    return await res.json();
  },
};

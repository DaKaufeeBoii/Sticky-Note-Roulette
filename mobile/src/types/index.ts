export interface StickyNote {
  id: string;
  text: string;
  fillColor?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface MiroBoard {
  id: string;
  name: string;
  description?: string;
  viewLink?: string;
}

export interface GeneratedIdea {
  title: string;
  description: string;
  source_notes: string[];
  connection: string;
  buildability: number;
  shapeId?: string;
}

export interface ConfigStatus {
  hasMiroToken: boolean;
  defaultBoardId: string;
  hasQwenKey: boolean;
  qwenApiUrl: string;
  qwenModel: string;
}

export interface AppSettings {
  apiUrl: string;
  miroToken: string;
  boardId: string;
  qwenKey: string;
  qwenUrl: string;
  qwenModel: string;
}

export type ActiveTab = 'roulette' | 'notes' | 'settings';

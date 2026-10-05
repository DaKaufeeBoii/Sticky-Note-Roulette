export const COLORS = {
  bgPrimary: '#07080d',
  bgSurface1: '#0f121d',
  bgSurface2: '#161a29',
  bgSurface3: '#1f2438',
  bgGlass: 'rgba(18, 22, 36, 0.85)',
  bgGlassCard: 'rgba(22, 27, 44, 0.75)',

  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderGlow: 'rgba(139, 92, 246, 0.45)',
  borderFocus: '#a855f7',
  borderOrange: 'rgba(255, 107, 53, 0.5)',

  accentViolet: '#8b5cf6',
  accentVioletDark: '#7c3aed',
  accentFuchsia: '#ec4899',
  accentCyan: '#06b6d4',
  accentOrange: '#ff6b35',
  accentEmerald: '#10b981',
  accentGold: '#f59e0b',
  accentRed: '#ef4444',

  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textDim: '#64748b',

  stickyPalette: [
    { name: 'light_yellow', bg: '#fff9b1', text: '#3e2723', label: 'Yellow' },
    { name: 'cyan', bg: '#a6e3e9', text: '#004d40', label: 'Cyan' },
    { name: 'pink', bg: '#ffb7b2', text: '#4a154b', label: 'Pink' },
    { name: 'light_green', bg: '#c7ceea', text: '#1a237e', label: 'Lavender' },
    { name: 'orange', bg: '#ffdac1', text: '#bf360c', label: 'Peach' },
    { name: 'purple', bg: '#e2d4f0', text: '#311b92', label: 'Violet' },
  ]
};

export const GRADIENTS = {
  violetGlow: ['#8b5cf6', '#ec4899'] as const,
  orangeFire: ['#ff6b35', '#ea580c'] as const,
  cyanStream: ['#06b6d4', '#3b82f6'] as const,
  emeraldSuccess: ['#10b981', '#059669'] as const,
  darkCard: ['rgba(26, 32, 53, 0.85)', 'rgba(16, 20, 35, 0.85)'] as const,
  goldAnchor: ['#f59e0b', '#d97706'] as const,
};

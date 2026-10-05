import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { RefreshCw, ExternalLink, Plus, Layers } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { MiroBoard } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  activeBoard: MiroBoard | null;
  onOpenBoards: () => void;
  onOpenAddNote: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeBoard,
  onOpenBoards,
  onOpenAddNote,
  onSync,
  isSyncing,
}) => {
  const handleOpenMiro = () => {
    triggerHaptic.light();
    if (activeBoard?.viewLink) {
      Linking.openURL(activeBoard.viewLink).catch(() => {});
    } else if (activeBoard?.id) {
      Linking.openURL(`https://miro.com/app/board/${activeBoard.id}/`).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand row */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🎰</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>STICKY NOTE ROULETTE</Text>
            <Text style={styles.brandSubtitle}>Miro × Qwen AI Engine</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addNoteBtn}
          onPress={() => {
            triggerHaptic.light();
            onOpenAddNote();
          }}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.addNoteBtnText}>Note</Text>
        </TouchableOpacity>
      </View>

      {/* Board status banner */}
      <View style={styles.boardCard}>
        <TouchableOpacity
          style={styles.boardSelectBtn}
          onPress={() => {
            triggerHaptic.selection();
            onOpenBoards();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.boardStatusDot} />
          <View style={styles.boardTitleGroup}>
            <Text style={styles.boardLabel}>ACTIVE MIRO BOARD</Text>
            <Text style={styles.boardName} numberOfLines={1}>
              {activeBoard?.name || 'Tap to select board...'}
            </Text>
          </View>
          <Layers size={16} color={COLORS.textDim} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <View style={styles.boardActions}>
          {activeBoard?.id && (
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={handleOpenMiro}
              activeOpacity={0.7}
              accessibilityLabel="Open in Miro"
            >
              <ExternalLink size={16} color={COLORS.accentCyan} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.iconActionBtn, isSyncing && styles.iconActionBtnActive]}
            onPress={() => {
              triggerHaptic.medium();
              onSync();
            }}
            disabled={isSyncing}
            activeOpacity={0.7}
            accessibilityLabel="Sync notes"
          >
            <RefreshCw
              size={16}
              color={isSyncing ? COLORS.accentViolet : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.bgSurface2,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: COLORS.accentViolet,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentViolet,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addNoteBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgSurface1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  boardSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  boardStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentEmerald,
    marginRight: 8,
  },
  boardTitleGroup: {
    flex: 1,
  },
  boardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textDim,
    letterSpacing: 0.5,
  },
  boardName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  boardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bgSurface2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    borderColor: COLORS.accentViolet,
  },
});

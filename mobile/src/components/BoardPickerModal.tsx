import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { X, Check, ArrowRight, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { MiroBoard } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { cleanBoardId } from '../services/api';

interface BoardPickerModalProps {
  visible: boolean;
  onClose: () => void;
  boards: MiroBoard[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onRefreshBoards: () => void;
  isRefreshing: boolean;
}

export const BoardPickerModal: React.FC<BoardPickerModalProps> = ({
  visible,
  onClose,
  boards,
  activeBoardId,
  onSelectBoard,
  onRefreshBoards,
  isRefreshing,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleApplyCustom = () => {
    const cleaned = cleanBoardId(customInput.trim());
    if (!cleaned) {
      triggerHaptic.warning();
      return;
    }
    triggerHaptic.success();
    onSelectBoard(cleaned);
    setCustomInput('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Switch Miro Board</Text>
              <Text style={styles.subtitle}>Select from account or paste board URL</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                triggerHaptic.light();
                onClose();
              }}
            >
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Paste Board URL / ID */}
          <View style={styles.customSection}>
            <Text style={styles.fieldLabel}>PASTE BOARD URL OR ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. uXjVEerKs70= or board URL..."
                placeholderTextColor={COLORS.textDim}
                value={customInput}
                onChangeText={setCustomInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.loadBtn}
                onPress={handleApplyCustom}
                activeOpacity={0.8}
              >
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Boards List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.fieldLabel}>ACCESSIBLE BOARDS ({boards.length})</Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                onRefreshBoards();
              }}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={COLORS.accentViolet} />
              ) : (
                <RefreshCw size={14} color={COLORS.textDim} />
              )}
            </TouchableOpacity>
          </View>

          {/* Boards List */}
          <FlatList
            data={boards}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={boards.length === 0 ? styles.emptyContainer : undefined}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {isRefreshing
                    ? 'Loading boards from Miro...'
                    : 'No boards found. Paste your board ID above or check your Miro Access Token in Settings.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === activeBoardId;
              return (
                <TouchableOpacity
                  style={[styles.boardItem, isSelected && styles.boardItemSelected]}
                  onPress={() => {
                    triggerHaptic.selection();
                    onSelectBoard(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.boardItemName,
                        isSelected && { color: COLORS.accentViolet },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.boardItemId}>{item.id}</Text>
                  </View>
                  {isSelected && (
                    <Check size={18} color={COLORS.accentViolet} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: COLORS.bgSurface1,
    borderRadius: 16,
    padding: 18,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.bgSurface2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  loadBtn: {
    width: 40,
    backgroundColor: COLORS.accentViolet,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  list: {
    maxHeight: 280,
  },
  boardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgSurface2,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  boardItemSelected: {
    borderColor: COLORS.accentViolet,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  boardItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  boardItemId: {
    fontSize: 11,
    color: COLORS.textDim,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    paddingVertical: 20,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

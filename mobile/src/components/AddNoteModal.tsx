import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string, color: string) => Promise<void>;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('light_yellow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      triggerHaptic.warning();
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(trimmed, selectedColor);
      triggerHaptic.success();
      setText('');
      onClose();
    } catch {
      triggerHaptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerEmoji}>📝</Text>
              <View>
                <Text style={styles.title}>New Sticky Note</Text>
                <Text style={styles.subtitle}>Post directly to your active Miro board</Text>
              </View>
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

          {/* Content Input */}
          <TextInput
            style={styles.input}
            placeholder="Type your idea, e.g. Quantum Coffee, Medieval Castles..."
            placeholderTextColor={COLORS.textDim}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            autoFocus
          />

          {/* Color Picker Swatches */}
          <View style={styles.colorSection}>
            <Text style={styles.sectionLabel}>STICKY COLOR</Text>
            <View style={styles.swatchRow}>
              {COLORS.stickyPalette.map(swatch => {
                const isChosen = selectedColor === swatch.name;
                return (
                  <TouchableOpacity
                    key={swatch.name}
                    style={[
                      styles.swatch,
                      { backgroundColor: swatch.bg },
                      isChosen && styles.swatchActive,
                    ]}
                    onPress={() => {
                      triggerHaptic.selection();
                      setSelectedColor(swatch.name);
                    }}
                    activeOpacity={0.8}
                  >
                    {isChosen && <Check size={14} color="#000000" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!text.trim() || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!text.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Post to Board</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.bgSurface1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEmoji: {
    fontSize: 22,
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
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.bgSurface2,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 16,
  },
  colorSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: COLORS.accentViolet,
    transform: [{ scale: 1.1 }],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.accentViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

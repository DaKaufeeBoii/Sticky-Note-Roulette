import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { StickyNote } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface StickyNoteCardProps {
  note: StickyNote;
  index: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  index,
  isSelected,
  onToggle,
}) => {
  // Map or cycle pastel color
  const palette = COLORS.stickyPalette;
  const colorItem = palette[index % palette.length];
  const bgColor = note.fillColor && note.fillColor.startsWith('#')
    ? note.fillColor
    : colorItem.bg;

  const handlePress = () => {
    triggerHaptic.selection();
    onToggle(note.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: bgColor },
        isSelected ? styles.selectedCard : styles.unselectedCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Top Pushpin */}
      <View style={styles.pinWrapper}>
        <View style={styles.pinHead} />
      </View>

      {/* Note Body Text */}
      <Text style={[styles.bodyText, { color: colorItem.text }]} numberOfLines={5}>
        {note.text}
      </Text>

      {/* Card Footer: #index & Checkbox */}
      <View style={styles.footerRow}>
        <Text style={[styles.indexTag, { color: colorItem.text }]}>#{index + 1}</Text>
        <View
          style={[
            styles.checkbox,
            isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
          ]}
        >
          {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    minHeight: 120,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
  },
  selectedCard: {
    borderColor: COLORS.accentViolet,
    transform: [{ scale: 1.02 }],
  },
  unselectedCard: {
    borderColor: 'transparent',
    opacity: 0.65,
  },
  pinWrapper: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pinHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc2626',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    flex: 1,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  indexTag: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.accentViolet,
  },
  checkboxUnselected: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

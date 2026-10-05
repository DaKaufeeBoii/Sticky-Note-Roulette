import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { GeneratedIdea } from '../types';

interface IdeaCardProps {
  idea: GeneratedIdea;
  index: number;
  isWeirder?: boolean;
}

const TIERS = [
  { label: '🎯 The Practical Anchor', color: COLORS.accentGold },
  { label: '⚡ The Creative Leap', color: COLORS.accentCyan },
  { label: '🦄 The Borderline Ridiculous', color: COLORS.accentFuchsia },
];

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, isWeirder = false }) => {
  const tier = TIERS[index % TIERS.length];
  const buildability = Math.min(10, Math.max(1, Number(idea.buildability) || 7));
  const percent = buildability * 10;

  const cardBorderColor = isWeirder ? COLORS.borderOrange : COLORS.borderGlow;
  const quoteBorderColor = isWeirder ? COLORS.accentOrange : COLORS.accentViolet;

  return (
    <View style={[styles.card, { borderColor: cardBorderColor }]}>
      {/* Header: Tier Badge & Index */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.tierBadge,
            {
              backgroundColor: isWeirder
                ? 'rgba(255, 107, 53, 0.15)'
                : 'rgba(139, 92, 246, 0.15)',
              borderColor: isWeirder
                ? 'rgba(255, 107, 53, 0.4)'
                : 'rgba(139, 92, 246, 0.4)',
            },
          ]}
        >
          <Text
            style={[
              styles.tierText,
              { color: isWeirder ? COLORS.accentOrange : tier.color },
            ]}
          >
            {isWeirder ? `🌀 Dimension Shift #0${index + 1}` : tier.label}
          </Text>
        </View>

        <Text style={styles.indexNum}>#0{index + 1}</Text>
      </View>

      {/* Idea Title */}
      <Text style={styles.titleText}>{idea.title}</Text>

      {/* Idea Description */}
      <Text style={styles.descriptionText}>{idea.description}</Text>

      {/* Source Notes Pill Tags */}
      {idea.source_notes && idea.source_notes.length > 0 && (
        <View style={styles.sourcePillsRow}>
          {idea.source_notes.map((noteText, idx) => (
            <View
              key={idx}
              style={[
                styles.sourcePill,
                isWeirder && {
                  backgroundColor: 'rgba(255, 107, 53, 0.12)',
                  borderColor: 'rgba(255, 107, 53, 0.3)',
                },
              ]}
            >
              <Text
                style={[
                  styles.sourcePillText,
                  isWeirder && { color: '#ff9d6c' },
                ]}
                numberOfLines={1}
              >
                {noteText}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Connection Quote */}
      <View style={[styles.quoteBox, { borderLeftColor: quoteBorderColor }]}>
        <Text style={styles.quoteTitle}>Why it connects:</Text>
        <Text style={styles.quoteBody}>"{idea.connection}"</Text>
      </View>

      {/* Footer: Buildability Gauge & Miro Sync Tag */}
      <View style={styles.footerRow}>
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeHeader}>
            <Text style={styles.gaugeLabel}>Buildability</Text>
            <Text style={styles.gaugeScore}>{buildability}/10</Text>
          </View>
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${percent}%`,
                  backgroundColor: isWeirder ? COLORS.accentOrange : COLORS.accentViolet,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.syncTag}>
          <Check size={12} color={isWeirder ? COLORS.accentOrange : COLORS.accentEmerald} />
          <Text
            style={[
              styles.syncTagText,
              { color: isWeirder ? COLORS.accentOrange : COLORS.accentEmerald },
            ]}
          >
            {isWeirder ? 'x:2100' : 'x:1500'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgSurface1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  indexNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  sourcePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  sourcePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c4b5fd',
  },
  quoteBox: {
    backgroundColor: COLORS.bgSurface2,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 14,
  },
  quoteTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  quoteBody: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  gaugeContainer: {
    flex: 1,
    marginRight: 16,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  gaugeScore: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gaugeTrack: {
    height: 6,
    backgroundColor: COLORS.bgSurface3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  syncTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

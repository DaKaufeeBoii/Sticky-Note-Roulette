import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, Layers } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { GeneratedIdea, StickyNote } from '../types';
import { RouletteReel } from '../components/RouletteReel';
import { IdeaCard } from '../components/IdeaCard';
import { WeirderBanner } from '../components/WeirderBanner';
import { triggerHaptic } from '../utils/haptics';

interface RouletteScreenProps {
  selectedNotes: StickyNote[];
  allNotesCount: number;
  onNavigateToNotes: () => void;
  isSpinning: boolean;
  onSpin: () => void;
  ideas: GeneratedIdea[];
  weirderIdeas: GeneratedIdea[];
  isWeirding: boolean;
  onMakeWeirder: () => void;
}

export const RouletteScreen: React.FC<RouletteScreenProps> = ({
  selectedNotes,
  allNotesCount,
  onNavigateToNotes,
  isSpinning,
  onSpin,
  ideas,
  weirderIdeas,
  isWeirding,
  onMakeWeirder,
}) => {
  const selectedPreviewText =
    selectedNotes.length > 0
      ? `Connecting: ${selectedNotes.map(n => n.text).slice(0, 3).join(', ')}${
          selectedNotes.length > 3 ? ` + ${selectedNotes.length - 3} more` : ''
        }`
      : 'No notes selected yet';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Mission */}
      <View style={styles.heroBox}>
        <View style={styles.headlineRow}>
          <Text style={styles.headline}>Forge </Text>
          <Text style={[styles.headline, styles.gradientText]}>
            Impossible Connections
          </Text>
        </View>
        <Text style={styles.heroDescription}>
          Random sticky notes from your Miro board are fed into Qwen's AI creativity
          engine to uncover non-obvious synergies and automatically generate
          structured idea cards with live connectors on your board.
        </Text>
      </View>

      {/* Selected Notes Summary Pill */}
      <TouchableOpacity
        style={styles.notesSummaryPill}
        onPress={() => {
          triggerHaptic.selection();
          onNavigateToNotes();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.summaryLeft}>
          <Layers size={14} color={COLORS.accentViolet} />
          <Text style={styles.summaryText}>
            <Text style={{ fontWeight: '800', color: '#ffffff' }}>
              {selectedNotes.length}
            </Text>{' '}
            of {allNotesCount} notes selected
          </Text>
        </View>
        <Text style={styles.summaryAction}>Change Notes →</Text>
      </TouchableOpacity>

      {/* Roulette Reel */}
      <RouletteReel
        selectedCount={selectedNotes.length}
        selectedPreviewText={selectedPreviewText}
        isSpinning={isSpinning}
        onSpin={onSpin}
      />

      {/* Generated Ideas Section */}
      {ideas.length > 0 && (
        <View style={styles.ideasSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.neonBadge}>
              <Sparkles size={12} color={COLORS.accentViolet} />
              <Text style={styles.neonBadgeText}>Synergistic Breakthroughs</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Synced to Miro at x:1500</Text>
          </View>

          {ideas.map((idea, idx) => (
            <IdeaCard key={idx} idea={idea} index={idx} />
          ))}

          {/* Weirdness Amplifier Banner */}
          <WeirderBanner
            onAmplify={onMakeWeirder}
            isAmplifying={isWeirding}
          />
        </View>
      )}

      {/* Amplified Weirdness Section */}
      {weirderIdeas.length > 0 && (
        <View style={styles.weirderSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.neonBadge, styles.neonBadgeOrange]}>
              <Text style={styles.vortexEmoji}>🌀</Text>
              <Text style={[styles.neonBadgeText, { color: COLORS.accentOrange }]}>
                Level 11 Creativity Anomalies
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: COLORS.accentOrange }]}>
              Synced to Miro at x:2100
            </Text>
          </View>

          {weirderIdeas.map((idea, idx) => (
            <IdeaCard key={idx} idea={idea} index={idx} isWeirder />
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  contentContainer: {
    padding: 16,
  },
  heroBox: {
    marginBottom: 14,
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  gradientText: {
    color: COLORS.accentViolet,
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  notesSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgSurface1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 6,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryAction: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentViolet,
  },
  ideasSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  neonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  neonBadgeOrange: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.35)',
  },
  neonBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accentViolet,
    letterSpacing: 0.4,
  },
  vortexEmoji: {
    fontSize: 12,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  weirderSection: {
    marginTop: 16,
  },
});

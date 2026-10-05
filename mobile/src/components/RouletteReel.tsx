import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { COLORS, GRADIENTS } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface RouletteReelProps {
  selectedCount: number;
  selectedPreviewText: string;
  isSpinning: boolean;
  onSpin: () => void;
}

const SPIN_MESSAGES = [
  'Rolling the Roulette...',
  'Analyzing conceptual friction...',
  'Consulting Qwen 3.8 Max...',
  'Synthesizing cross-domain synergies...',
  'Writing cards & connectors to Miro...',
];

export const RouletteReel: React.FC<RouletteReelProps> = ({
  selectedCount,
  selectedPreviewText,
  isSpinning,
  onSpin,
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isSpinning) {
      setMsgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % SPIN_MESSAGES.length);
      triggerHaptic.light();
    }, 2200);

    return () => clearInterval(interval);
  }, [isSpinning]);

  const canSpin = selectedCount >= 2 && !isSpinning;

  const handlePress = () => {
    if (!canSpin) {
      triggerHaptic.warning();
      return;
    }
    triggerHaptic.heavy();
    onSpin();
  };

  return (
    <View style={styles.container}>
      {/* Ticker Row */}
      <View style={styles.tickerCard}>
        <View style={styles.tickerBadge}>
          <Text style={styles.tickerBadgeText}>ROULETTE READY</Text>
        </View>
        <Text style={styles.tickerText} numberOfLines={1}>
          {isSpinning
            ? SPIN_MESSAGES[msgIndex]
            : selectedCount < 2
            ? 'Select at least 2 notes above to begin'
            : selectedPreviewText}
        </Text>
      </View>

      {/* Main Spin Button with Gradient Border / Background */}
      <TouchableOpacity
        style={[styles.buttonWrapper, !canSpin && !isSpinning && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={!canSpin}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={canSpin ? GRADIENTS.violetGlow : ['#2a2b3d', '#1e1f2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {isSpinning ? (
            <View style={styles.spinnerContent}>
              <ActivityIndicator size="small" color="#ffffff" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.spinningTitle}>IGNITING IDEATION ENGINE</Text>
                <Text style={styles.spinningSubtitle}>{SPIN_MESSAGES[msgIndex]}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.slotIcon}>🎰</Text>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.spinTitle}>SPIN THE ROULETTE</Text>
                  <Sparkles size={16} color="#ffd700" style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.spinSubtitle}>CONNECT THE IMPOSSIBLE</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  tickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 10,
  },
  tickerBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  tickerBadgeText: {
    color: COLORS.accentViolet,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tickerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  buttonWrapper: {
    borderRadius: 14,
    elevation: 8,
    shadowColor: COLORS.accentViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  spinSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  spinnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinningTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  spinningSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

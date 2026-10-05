import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { COLORS, GRADIENTS } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

interface WeirderBannerProps {
  onAmplify: () => void;
  isAmplifying: boolean;
}

export const WeirderBanner: React.FC<WeirderBannerProps> = ({
  onAmplify,
  isAmplifying,
}) => {
  const handlePress = () => {
    triggerHaptic.heavy();
    onAmplify();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Flame size={18} color={COLORS.accentOrange} />
          <Text style={styles.title}>Push Conceptual Boundaries?</Text>
        </View>

        <Text style={styles.description}>
          Amplify the creativity to "11". We will synthesize 3 borderline absurd yet defensible ideas and plot them at{' '}
          <Text style={styles.coordHighlight}>x:2100</Text> on your Miro board.
        </Text>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handlePress}
          disabled={isAmplifying}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.orangeFire}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {isAmplifying ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>AMPLIFYING WEIRDNESS...</Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <Text style={styles.vortexEmoji}>🌀</Text>
                <Text style={styles.buttonText}>MAKE IT WEIRDER</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.35)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ff9d6c',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  coordHighlight: {
    color: COLORS.accentOrange,
    fontWeight: '700',
  },
  buttonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vortexEmoji: {
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});

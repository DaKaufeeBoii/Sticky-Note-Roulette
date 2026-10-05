import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dices, StickyNote, Settings } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { ActiveTab } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedNotesCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  selectedNotesCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Tab: Roulette */}
      <TouchableOpacity
        style={[styles.tab, activeTab === 'roulette' && styles.tabActive]}
        onPress={() => {
          triggerHaptic.selection();
          onSelectTab('roulette');
        }}
        activeOpacity={0.8}
      >
        <Dices
          size={20}
          color={activeTab === 'roulette' ? COLORS.accentViolet : COLORS.textDim}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'roulette' && styles.tabLabelActive,
          ]}
        >
          Roulette
        </Text>
      </TouchableOpacity>

      {/* Tab: Notes */}
      <TouchableOpacity
        style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
        onPress={() => {
          triggerHaptic.selection();
          onSelectTab('notes');
        }}
        activeOpacity={0.8}
      >
        <View>
          <StickyNote
            size={20}
            color={activeTab === 'notes' ? COLORS.accentViolet : COLORS.textDim}
          />
          {selectedNotesCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedNotesCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.tabLabel, activeTab === 'notes' && styles.tabLabelActive]}
        >
          Notes
        </Text>
      </TouchableOpacity>

      {/* Tab: Settings */}
      <TouchableOpacity
        style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
        onPress={() => {
          triggerHaptic.selection();
          onSelectTab('settings');
        }}
        activeOpacity={0.8}
      >
        <Settings
          size={20}
          color={activeTab === 'settings' ? COLORS.accentViolet : COLORS.textDim}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'settings' && styles.tabLabelActive,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSurface1,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDim,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.accentViolet,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.accentViolet,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});

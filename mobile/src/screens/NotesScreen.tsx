import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Search, X, Dices, Plus } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { StickyNote } from '../types';
import { StickyNoteCard } from '../components/StickyNoteCard';
import { triggerHaptic } from '../utils/haptics';

interface NotesScreenProps {
  notes: StickyNote[];
  selectedNoteIds: Set<string>;
  onToggleNote: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRandomPick: (count?: number) => void;
  onOpenAddNote: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  notes,
  selectedNoteIds,
  onToggleNote,
  onSelectAll,
  onClearSelection,
  onRandomPick,
  onOpenAddNote,
  onRefresh,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase().trim();
    return notes.filter(n => n.text.toLowerCase().includes(query));
  }, [notes, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={16} color={COLORS.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter sticky notes..."
          placeholderTextColor={COLORS.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={COLORS.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Pills Row */}
      <View style={styles.actionPillsRow}>
        <Text style={styles.counterText}>
          {selectedNoteIds.size} of {notes.length} selected
        </Text>

        <View style={styles.pillsGroup}>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => {
              triggerHaptic.light();
              onSelectAll();
            }}
          >
            <Text style={styles.pillText}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pill}
            onPress={() => {
              triggerHaptic.light();
              onClearSelection();
            }}
          >
            <Text style={styles.pillText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, styles.pillHighlight]}
            onPress={() => {
              triggerHaptic.medium();
              onRandomPick(4);
            }}
          >
            <Dices size={12} color="#ffffff" style={{ marginRight: 3 }} />
            <Text style={[styles.pillText, { color: '#ffffff', fontWeight: '800' }]}>
              Random 4
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes Grid */}
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              triggerHaptic.light();
              onRefresh();
            }}
            tintColor={COLORS.accentViolet}
            colors={[COLORS.accentViolet]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {notes.length === 0
                ? 'No Sticky Notes on Board'
                : `No notes matching "${searchQuery}"`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {notes.length === 0
                ? 'Create a sticky note now or add some on your Miro board.'
                : 'Try clearing your search query.'}
            </Text>
            {notes.length === 0 && (
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => {
                  triggerHaptic.light();
                  onOpenAddNote();
                }}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={styles.emptyAddBtnText}>Add Sticky Note</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ flex: 1 }}>
            <StickyNoteCard
              note={item}
              index={index}
              isSelected={selectedNoteIds.has(item.id)}
              onToggle={onToggleNote}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface1,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    padding: 0,
  },
  actionPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  pillsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.bgSurface2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillHighlight: {
    backgroundColor: COLORS.accentViolet,
    borderColor: COLORS.accentViolet,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentViolet,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

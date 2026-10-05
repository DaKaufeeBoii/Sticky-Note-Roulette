import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from './src/theme/colors';
import {
  ActiveTab,
  AppSettings,
  GeneratedIdea,
  MiroBoard,
  StickyNote,
} from './src/types';
import { DEFAULT_SETTINGS, StorageService } from './src/services/storage';
import { ApiService, cleanBoardId } from './src/services/api';
import { triggerHaptic } from './src/utils/haptics';

import { Header } from './src/components/Header';
import { BottomTabBar } from './src/components/BottomTabBar';
import { ToastHUD, ToastMessage } from './src/components/ToastHUD';
import { AddNoteModal } from './src/components/AddNoteModal';
import { BoardPickerModal } from './src/components/BoardPickerModal';
import { SettingsModal } from './src/components/SettingsModal';

import { RouletteScreen } from './src/screens/RouletteScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeBoard, setActiveBoard] = useState<MiroBoard | null>(null);
  const [availableBoards, setAvailableBoards] = useState<MiroBoard[]>([]);
  const [allNotes, setAllNotes] = useState<StickyNote[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [weirderIdeas, setWeirderIdeas] = useState<GeneratedIdea[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('roulette');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWeirding, setIsWeirding] = useState(false);
  const [isRefreshingBoards, setIsRefreshingBoards] = useState(false);

  // Modals
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showBoardPickerModal, setShowBoardPickerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Floating Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
      setToast({ id: Date.now().toString(), text, type });
    },
    []
  );

  // Load Boards from Miro
  const fetchBoardsList = useCallback(
    async (currentSettings: AppSettings) => {
      try {
        setIsRefreshingBoards(true);
        const boards = await ApiService.getBoards(currentSettings);
        setAvailableBoards(boards);

        if (!currentSettings.boardId && boards.length > 0) {
          const firstBoard = boards[0];
          const updated = { ...currentSettings, boardId: firstBoard.id };
          setSettings(updated);
          await StorageService.saveSettings(updated);
          return firstBoard.id;
        }
      } catch (err: any) {
        console.warn('Could not list boards:', err.message);
      } finally {
        setIsRefreshingBoards(false);
      }
      return currentSettings.boardId;
    },
    []
  );

  // Load Sticky Notes from Miro
  const loadStickyNotes = useCallback(
    async (currentSettings: AppSettings, targetBoardId?: string) => {
      setIsSyncing(true);
      try {
        const boardId = targetBoardId || currentSettings.boardId;
        const res = await ApiService.getStickyNotes(currentSettings, boardId);
        setActiveBoard(res.board);
        setAllNotes(res.stickyNotes || []);
        // Select all by default
        setSelectedNoteIds(new Set((res.stickyNotes || []).map(n => n.id)));
      } catch (err: any) {
        console.warn('Failed to load sticky notes:', err.message);
        showToast(err.message, 'error');
      } finally {
        setIsSyncing(false);
      }
    },
    [showToast]
  );

  // Initialization
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const loadedSettings = await StorageService.loadSettings();
        if (!isMounted) return;
        setSettings(loadedSettings);

        // Ping config status to see if server has default board
        try {
          const config = await ApiService.getConfigStatus(loadedSettings);
          if (!loadedSettings.boardId && config.defaultBoardId) {
            loadedSettings.boardId = config.defaultBoardId;
            setSettings({ ...loadedSettings });
          }
        } catch {
          // If server is not yet running or URL needs updating, fallback gracefully
        }

        // Fetch user boards & sticky notes
        const activeId = await fetchBoardsList(loadedSettings);
        await loadStickyNotes(loadedSettings, activeId);
      } catch (e: any) {
        showToast('App init warning: ' + e.message, 'warning');
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [fetchBoardsList, loadStickyNotes, showToast]);

  // Selected notes array
  const selectedNotes = useMemo(
    () => allNotes.filter(n => selectedNoteIds.has(n.id)),
    [allNotes, selectedNoteIds]
  );

  // Toggle single note
  const handleToggleNote = (id: string) => {
    setSelectedNoteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all notes
  const handleSelectAll = () => {
    setSelectedNoteIds(new Set(allNotes.map(n => n.id)));
  };

  // Clear note selection
  const handleClearSelection = () => {
    setSelectedNoteIds(new Set());
  };

  // Random pick N notes
  const handleRandomPick = (count = 4) => {
    if (allNotes.length === 0) return;
    const shuffled = [...allNotes].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(count, allNotes.length));
    setSelectedNoteIds(new Set(picked.map(n => n.id)));
  };

  // Switch Active Board
  const handleSelectBoard = async (newBoardId: string) => {
    const cleaned = cleanBoardId(newBoardId);
    const updated = { ...settings, boardId: cleaned };
    setSettings(updated);
    await StorageService.saveSettings(updated);
    setIdeas([]);
    setWeirderIdeas([]);
    await loadStickyNotes(updated, cleaned);
    showToast('Switched to board: ' + cleaned, 'info');
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
    await loadStickyNotes(newSettings);
    await fetchBoardsList(newSettings);
  };

  // Create new note on Miro board
  const handleAddNote = async (text: string, color: string) => {
    const newNote = await ApiService.createStickyNote(settings, text, color);
    setAllNotes(prev => [...prev, newNote]);
    setSelectedNoteIds(prev => new Set([...prev, newNote.id]));
    showToast(`Sticky note "${text}" posted to Miro!`, 'success');
  };

  // Spin Roulette (Connect the Impossible)
  const handleSpinRoulette = async () => {
    if (selectedNotes.length < 2) {
      showToast('Please select at least 2 sticky notes to connect!', 'warning');
      return;
    }

    setIsSpinning(true);
    try {
      // 1. Generate ideas with AI
      const connectRes = await ApiService.connectIdeas(settings, selectedNotes);
      const generatedIdeas = connectRes.ideas || [];
      setIdeas(generatedIdeas);
      triggerHaptic.success();

      // 2. Automatically sync shapes & connectors to Miro board
      try {
        await ApiService.createIdeasOnMiro(settings, generatedIdeas, selectedNotes);
        showToast('🎉 3 ideas created and connected on your Miro board!', 'success');
      } catch (shapeErr: any) {
        showToast(`Ideas generated! (Miro shape notice: ${shapeErr.message})`, 'warning');
      }
    } catch (err: any) {
      triggerHaptic.error();
      showToast(err.message, 'error');
    } finally {
      setIsSpinning(false);
    }
  };

  // Make It Weirder (Amplify to 11)
  const handleMakeWeirder = async () => {
    if (ideas.length === 0) return;

    setIsWeirding(true);
    try {
      const res = await ApiService.makeIdeasWeirder(settings, ideas, selectedNotes);
      setWeirderIdeas(res.ideas || []);
      triggerHaptic.success();
      showToast('🌀 3 high-weirdness cards created at x=2100 on Miro!', 'success');
    } catch (err: any) {
      triggerHaptic.error();
      showToast(err.message, 'error');
    } finally {
      setIsWeirding(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Global Toast HUD */}
        <ToastHUD toast={toast} onDismiss={() => setToast(null)} />

        {/* Top Header */}
        <Header
          activeBoard={activeBoard}
          onOpenBoards={() => setShowBoardPickerModal(true)}
          onOpenAddNote={() => setShowAddNoteModal(true)}
          onSync={() => loadStickyNotes(settings)}
          isSyncing={isSyncing}
        />

        {/* Screen Switcher */}
        <View style={styles.screenContainer}>
          {activeTab === 'roulette' && (
            <RouletteScreen
              selectedNotes={selectedNotes}
              allNotesCount={allNotes.length}
              onNavigateToNotes={() => setActiveTab('notes')}
              isSpinning={isSpinning}
              onSpin={handleSpinRoulette}
              ideas={ideas}
              weirderIdeas={weirderIdeas}
              isWeirding={isWeirding}
              onMakeWeirder={handleMakeWeirder}
            />
          )}

          {activeTab === 'notes' && (
            <NotesScreen
              notes={allNotes}
              selectedNoteIds={selectedNoteIds}
              onToggleNote={handleToggleNote}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onRandomPick={handleRandomPick}
              onOpenAddNote={() => setShowAddNoteModal(true)}
              onRefresh={() => loadStickyNotes(settings)}
              isRefreshing={isSyncing}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onSave={handleSaveSettings}
              onShowToast={showToast}
            />
          )}
        </View>

        {/* Bottom Tab Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          selectedNotesCount={selectedNoteIds.size}
        />

        {/* Modals */}
        <AddNoteModal
          visible={showAddNoteModal}
          onClose={() => setShowAddNoteModal(false)}
          onSubmit={handleAddNote}
        />

        <BoardPickerModal
          visible={showBoardPickerModal}
          onClose={() => setShowBoardPickerModal(false)}
          boards={availableBoards}
          activeBoardId={settings.boardId}
          onSelectBoard={handleSelectBoard}
          onRefreshBoards={() => fetchBoardsList(settings)}
          isRefreshing={isRefreshingBoards}
        />

        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  screenContainer: {
    flex: 1,
  },
});

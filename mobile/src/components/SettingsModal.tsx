import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Eye, EyeOff, CheckCircle2, AlertCircle, Wifi } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { AppSettings } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { ApiService, cleanBoardId } from '../services/api';
import { getAutoDetectedApiUrl } from '../services/storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<void>;
}

const MODEL_OPTIONS = [
  { label: 'Qwen 3.8 Max (ModelScope)', value: 'Qwen-Ambassador/Qwen3.8-Max' },
  { label: 'Qwen 3.8 27B (Groq)', value: 'qwen/qwen3.8-27b' },
  { label: 'qwen-plus (DashScope)', value: 'qwen-plus' },
  { label: 'qwen-turbo (DashScope)', value: 'qwen-turbo' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSave,
}) => {
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);
  const [miroToken, setMiroToken] = useState(settings.miroToken);
  const [boardId, setBoardId] = useState(settings.boardId);
  const [qwenModel, setQwenModel] = useState(settings.qwenModel);
  const [qwenUrl, setQwenUrl] = useState(settings.qwenUrl);
  const [qwenKey, setQwenKey] = useState(settings.qwenKey);

  const [showMiroToken, setShowMiroToken] = useState(false);
  const [showQwenKey, setShowQwenKey] = useState(false);

  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestingStatus(null);
    triggerHaptic.medium();

    try {
      const draftSettings: AppSettings = {
        apiUrl: apiUrl.trim(),
        miroToken: miroToken.trim(),
        boardId: cleanBoardId(boardId.trim()),
        qwenModel: qwenModel.trim(),
        qwenUrl: qwenUrl.trim(),
        qwenKey: qwenKey.trim(),
      };

      const status = await ApiService.getConfigStatus(draftSettings);
      triggerHaptic.success();
      setTestingStatus(
        `Connected! Miro: ${status.hasMiroToken ? 'Ready ✅' : 'No Token ⚠️'}, AI: ${
          status.hasQwenKey ? 'Ready ✅' : 'No Key ⚠️'
        }`
      );
    } catch (e: any) {
      triggerHaptic.error();
      setTestingStatus(`Connection Failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanedSettings: AppSettings = {
        apiUrl: apiUrl.trim(),
        miroToken: miroToken.trim(),
        boardId: cleanBoardId(boardId.trim()),
        qwenModel: qwenModel.trim(),
        qwenUrl: qwenUrl.trim(),
        qwenKey: qwenKey.trim(),
      };

      await onSave(cleanedSettings);
      triggerHaptic.success();
      onClose();
    } catch {
      triggerHaptic.error();
    } finally {
      setIsSaving(false);
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
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Integration & API Settings</Text>
              <Text style={styles.subtitle}>Configure mobile backend, Miro and Qwen AI</Text>
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

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Backend URL Group */}
            <View style={styles.group}>
              <Text style={styles.groupTitle}>MOBILE BACKEND API</Text>
              <Text style={styles.fieldHint}>
                The Express server URL (Vercel deployment or your local IP:3000)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="http://192.168.x.x:3000 or https://...vercel.app"
                placeholderTextColor={COLORS.textDim}
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={styles.presetPill}
                  onPress={() => {
                    triggerHaptic.selection();
                    setApiUrl(getAutoDetectedApiUrl());
                  }}
                >
                  <Text style={styles.presetPillText}>⚡ Auto Host ({getAutoDetectedApiUrl()})</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Miro Config Group */}
            <View style={styles.group}>
              <Text style={styles.groupTitle}>MIRO INTEGRATION</Text>

              <Text style={styles.fieldLabel}>Miro Access Token</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="eyJ..."
                  placeholderTextColor={COLORS.textDim}
                  value={miroToken}
                  onChangeText={setMiroToken}
                  secureTextEntry={!showMiroToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowMiroToken(!showMiroToken)}
                >
                  {showMiroToken ? (
                    <EyeOff size={16} color={COLORS.textDim} />
                  ) : (
                    <Eye size={16} color={COLORS.textDim} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Default Board ID / URL</Text>
              <TextInput
                style={styles.input}
                placeholder="uXjVEerKs70= or paste full board link"
                placeholderTextColor={COLORS.textDim}
                value={boardId}
                onChangeText={setBoardId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* AI Config Group */}
            <View style={styles.group}>
              <Text style={styles.groupTitle}>QWEN AI CONFIGURATION</Text>

              <Text style={styles.fieldLabel}>AI Model</Text>
              <View style={styles.modelPillRow}>
                {MODEL_OPTIONS.map(opt => {
                  const isSelected = qwenModel === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.modelPill,
                        isSelected && styles.modelPillSelected,
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setQwenModel(opt.value);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modelPillText,
                          isSelected && styles.modelPillTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 10 }]}>API Endpoint URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://api-inference.modelscope.ai/v1/chat/completions"
                placeholderTextColor={COLORS.textDim}
                value={qwenUrl}
                onChangeText={setQwenUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.fieldLabel, { marginTop: 10 }]}>API Key / Token</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Your ModelScope / DashScope token"
                  placeholderTextColor={COLORS.textDim}
                  value={qwenKey}
                  onChangeText={setQwenKey}
                  secureTextEntry={!showQwenKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowQwenKey(!showQwenKey)}
                >
                  {showQwenKey ? (
                    <EyeOff size={16} color={COLORS.textDim} />
                  ) : (
                    <Eye size={16} color={COLORS.textDim} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Test Status Feedback */}
            {testingStatus && (
              <View
                style={[
                  styles.statusCard,
                  testingStatus.includes('Failed')
                    ? styles.statusCardError
                    : styles.statusCardSuccess,
                ]}
              >
                {testingStatus.includes('Failed') ? (
                  <AlertCircle size={16} color={COLORS.accentRed} />
                ) : (
                  <CheckCircle2 size={16} color={COLORS.accentEmerald} />
                )}
                <Text style={styles.statusText}>{testingStatus}</Text>
              </View>
            )}

            {/* Diagnostics Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTesting}
              activeOpacity={0.8}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color={COLORS.accentViolet} />
              ) : (
                <View style={styles.testBtnContent}>
                  <Wifi size={16} color={COLORS.accentViolet} />
                  <Text style={styles.testBtnText}>Test Server & Credentials</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Save Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save & Apply</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgSurface1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  scrollBody: {
    marginBottom: 14,
  },
  group: {
    marginBottom: 18,
    backgroundColor: COLORS.bgSurface2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  groupTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accentViolet,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.bgSurface1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingRight: 8,
  },
  iconBtn: {
    padding: 6,
  },
  modelPillRow: {
    flexDirection: 'column',
    gap: 6,
    marginVertical: 4,
  },
  modelPill: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.bgSurface1,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  modelPillSelected: {
    borderColor: COLORS.accentViolet,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  modelPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  modelPillTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  testBtn: {
    borderWidth: 1,
    borderColor: COLORS.accentViolet,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  testBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testBtnText: {
    color: COLORS.accentViolet,
    fontSize: 12,
    fontWeight: '700',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  statusCardSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusCardError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  footer: {
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
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.accentViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  presetPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentViolet,
  },
});

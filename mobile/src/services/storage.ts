import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { AppSettings } from '../types';

const SECURE_KEYS = {
  MIRO_TOKEN: 'snr_secure_miro_token',
  QWEN_KEY: 'snr_secure_qwen_key',
};

const STORAGE_KEYS = {
  API_URL: 'snr_api_url',
  BOARD_ID: 'snr_board_id',
  QWEN_URL: 'snr_qwen_url',
  QWEN_MODEL: 'snr_qwen_model',
  CACHED_NOTES: 'snr_cached_notes',
};

// Auto-detect host IP from Expo Metro bundler connection or fallback to local LAN
export function getAutoDetectedApiUrl(): string {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:3000`;
      }
    }
  } catch {
    // Ignore and fallback
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // Detected LAN IP for the dev machine
  return 'http://192.168.31.68:3000';
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: getAutoDetectedApiUrl(),
  miroToken: '',
  boardId: '',
  qwenKey: '',
  qwenUrl: 'https://api-inference.modelscope.ai/v1/chat/completions',
  qwenModel: 'Qwen-Ambassador/Qwen3.8-Max',
};

async function getSecureItem(key: string): Promise<string> {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      return (await SecureStore.getItemAsync(key)) || '';
    }
    return (await AsyncStorage.getItem(key)) || '';
  } catch {
    return (await AsyncStorage.getItem(key)) || '';
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export const StorageService = {
  async loadSettings(): Promise<AppSettings> {
    try {
      const [storedApiUrl, boardId, qwenUrl, qwenModel, miroToken, qwenKey] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.API_URL),
        AsyncStorage.getItem(STORAGE_KEYS.BOARD_ID),
        AsyncStorage.getItem(STORAGE_KEYS.QWEN_URL),
        AsyncStorage.getItem(STORAGE_KEYS.QWEN_MODEL),
        getSecureItem(SECURE_KEYS.MIRO_TOKEN),
        getSecureItem(SECURE_KEYS.QWEN_KEY),
      ]);

      let resolvedApiUrl = storedApiUrl || getAutoDetectedApiUrl();

      // If mobile device had previously saved localhost/127.0.0.1, auto-repair to the host IP
      if (
        Platform.OS !== 'web' &&
        (resolvedApiUrl.includes('localhost') || resolvedApiUrl.includes('127.0.0.1'))
      ) {
        resolvedApiUrl = getAutoDetectedApiUrl();
        await AsyncStorage.setItem(STORAGE_KEYS.API_URL, resolvedApiUrl);
      }

      return {
        apiUrl: resolvedApiUrl,
        boardId: boardId || DEFAULT_SETTINGS.boardId,
        qwenUrl: qwenUrl || DEFAULT_SETTINGS.qwenUrl,
        qwenModel: qwenModel || DEFAULT_SETTINGS.qwenModel,
        miroToken: miroToken || DEFAULT_SETTINGS.miroToken,
        qwenKey: qwenKey || DEFAULT_SETTINGS.qwenKey,
      };
    } catch (e) {
      console.warn('Error loading settings:', e);
      return {
        ...DEFAULT_SETTINGS,
        apiUrl: getAutoDetectedApiUrl(),
      };
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.API_URL, settings.apiUrl.trim()),
        AsyncStorage.setItem(STORAGE_KEYS.BOARD_ID, settings.boardId.trim()),
        AsyncStorage.setItem(STORAGE_KEYS.QWEN_URL, settings.qwenUrl.trim()),
        AsyncStorage.setItem(STORAGE_KEYS.QWEN_MODEL, settings.qwenModel.trim()),
        setSecureItem(SECURE_KEYS.MIRO_TOKEN, settings.miroToken.trim()),
        setSecureItem(SECURE_KEYS.QWEN_KEY, settings.qwenKey.trim()),
      ]);
    } catch (e) {
      console.error('Error saving settings:', e);
      throw e;
    }
  },

  async clearCredentials(): Promise<void> {
    await Promise.all([
      deleteSecureItem(SECURE_KEYS.MIRO_TOKEN),
      deleteSecureItem(SECURE_KEYS.QWEN_KEY),
      AsyncStorage.removeItem(STORAGE_KEYS.BOARD_ID),
    ]);
  },
};

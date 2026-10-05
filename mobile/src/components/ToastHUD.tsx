import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  text: string;
}

interface ToastHUDProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastHUD: React.FC<ToastHUDProps> = ({ toast, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!toast) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return COLORS.accentEmerald;
      case 'error':
        return COLORS.accentRed;
      case 'warning':
        return COLORS.accentOrange;
      default:
        return COLORS.accentViolet;
    }
  };

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={16} color={COLORS.accentEmerald} />;
      case 'error':
        return <AlertCircle size={16} color={COLORS.accentRed} />;
      default:
        return <Info size={16} color={COLORS.accentViolet} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          opacity,
          transform: [{ translateY }],
          borderColor: getBorderColor(),
        },
      ]}
    >
      {renderIcon()}
      <Text style={styles.toastText} numberOfLines={3}>
        {toast.text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: 'rgba(15, 18, 29, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  toastText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
});

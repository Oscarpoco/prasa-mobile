import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '../data/network';
import { Colors, Radii, Shadow } from '../theme';

interface Props {
  alerts: Alert[];
  onDismiss: (id: number) => void;
}

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const config = {
    warning: { bg: Colors.amberDim, border: Colors.amber, icon: 'warning' as const, label: 'DELAY', color: Colors.amber },
    error:   { bg: Colors.redDim,   border: Colors.red,   icon: 'alert-circle' as const, label: 'CRITICAL', color: Colors.red },
    info:    { bg: Colors.prasaBlueDim, border: Colors.prasaBlue, icon: 'information-circle' as const, label: 'INFO', color: Colors.prasaBlue },
    success: { bg: Colors.greenDim, border: Colors.green, icon: 'checkmark-circle' as const, label: 'RESOLVED', color: Colors.green },
  }[alert.type] ?? {
    bg: Colors.prasaBlueDim, border: Colors.prasaBlue, icon: 'information-circle' as const, label: 'INFO', color: Colors.prasaBlue
  };

  const time = alert.timestamp.toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <Animated.View
      style={[
        styles.item,
        { backgroundColor: config.bg, borderColor: config.border },
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.tag, { color: config.color }]}>{config.label}</Text>
      <Text style={styles.msg} numberOfLines={2}>{alert.message}</Text>
      <Text style={styles.time}>{time}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Ionicons name="close" size={14} color={Colors.textDim} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AlertBanner({ alerts, onDismiss }: Props) {
  if (!alerts.length) return null;
  return (
    <View style={styles.container}>
      {alerts.slice(0, 3).map(a => (
        <AlertItem key={a.id} alert={a} onDismiss={() => onDismiss(a.id)} />
      ))}
      {alerts.length > 3 && (
        <Text style={styles.more}>+{alerts.length - 3} more alerts</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, marginBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...Shadow.sm,
  },
  tag: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    minWidth: 52,
  },
  msg: {
    flex: 1,
    fontSize: 11,
    color: Colors.text,
    lineHeight: 15,
  },
  time: {
    fontSize: 10,
    color: Colors.textDim,
    fontVariant: ['tabular-nums'],
  },
  more: {
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    paddingVertical: 4,
  },
});

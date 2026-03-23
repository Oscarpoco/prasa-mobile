import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../theme';

interface Props {
  load: number;
  capacity: number;
  showLabel?: boolean;
}

function getLoadColor(pct: number) {
  if (pct >= 100) return Colors.red;
  if (pct >= 80)  return Colors.busOrange;
  if (pct >= 50)  return Colors.amber;
  return Colors.green;
}

function getLoadLabel(pct: number) {
  if (pct >= 100) return 'At Capacity';
  if (pct >= 80)  return 'Crowded';
  if (pct >= 50)  return 'Moderate';
  return 'Light';
}

export function LoadBar({ load, capacity, showLabel = true }: Props) {
  const pct = Math.min(100, Math.round((load / capacity) * 100));
  const color = getLoadColor(pct);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{load}/{capacity} pax</Text>
          <Text style={[styles.category, { color }]}>{getLoadLabel(pct)}</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: Colors.textDim,
    fontVariant: ['tabular-nums'],
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    // borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    // borderRadius: Radii.pill,
  },
});

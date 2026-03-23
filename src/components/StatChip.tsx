import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii, Shadow } from '../theme';

interface Props {
  value: number;
  label: string;
  color: string;
  index: number;
}

export function StatChip({ value, label, color, index }: Props) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const displayVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 70, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 70, useNativeDriver: true }),
      Animated.timing(displayVal, { toValue: value, duration: 600, delay: index * 70 + 200, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.chip,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Animated.Text style={[styles.value, { color }]}>
        {value}
      </Animated.Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.lg,
    padding: 14,
    width: '48.5%',
    gap: 4,
    ...Shadow.sm,
  },
  bar: {
    height: 3,
    width: 28,
    // borderRadius: Radii.pill,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radii } from '../theme';

interface Props {
  shortName: string;
  color: string;
  type?: 'train' | 'bus';
}

export function RouteBadge({ shortName, color, type }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{shortName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    // borderRadius: Radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '../theme';

type Status = 'On Time' | 'Delayed' | 'Boarding' | string;

interface Props {
  status: Status;
  small?: boolean;
}

function getColors(status: Status) {
  if (status === 'Delayed')  return { bg: Colors.redDim,   text: Colors.red,        border: Colors.red };
  if (status === 'Boarding') return { bg: Colors.amberDim, text: Colors.amber,      border: Colors.amber };
  return                            { bg: Colors.greenDim, text: Colors.green,      border: Colors.green };
}

export function StatusBadge({ status, small = false }: Props) {
  const c = getColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, small && styles.small]}>
      <Text style={[styles.text, { color: c.text }, small && styles.textSmall]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    // borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 10,
  },
});

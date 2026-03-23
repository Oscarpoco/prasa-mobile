import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Route } from '../data/network';
import { Colors, Radii, Shadow } from '../theme';

interface Band {
  label: string;
  price: number;
}

interface Props {
  route: Route;
  stops: number;
  bands: Band[];
  index: number;
}

export function PriceCard({ route, stops, bands, index }: Props) {
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 90, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: route.color },
        { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: route.color }]}>
            <Ionicons
              name={route.vehicleType === 'bus' ? 'bus' : 'train'}
              size={10}
              color="#fff"
            />
            <Text style={styles.badgeText}>{route.shortName}</Text>
          </View>
          <Text style={styles.name}>{route.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.meta}>{stops} stops</Text>
          <Text style={[styles.meta, { color: Colors.textDim }]}>· {route.operator}</Text>
        </View>
      </View>

      <View style={styles.bands}>
        {bands.map((band, i) => (
          <View key={i} style={styles.bandRow}>
            <View style={[styles.bandDot, { backgroundColor: route.color + '80' }]} />
            <Text style={styles.bandLabel}>{band.label}</Text>
            <View style={styles.bandFill} />
            <View style={[styles.pricePill, { borderColor: route.color + '60', backgroundColor: route.color + '18' }]}>
              <Text style={[styles.price, { color: route.color }]}>R {band.price.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={11} color={Colors.textDim} />
        <Text style={styles.disclaimerText}>Indicative demo fares only</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.xl,
    borderLeftWidth: 4,
    marginBottom: 12,
    padding: 14,
    gap: 12,
    ...Shadow.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    // borderRadius: Radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 11, color: Colors.textMuted },
  bands: { gap: 8 },
  bandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bandDot: { width: 6, height: 6, borderRadius: 3 },
  bandLabel: { fontSize: 12, color: Colors.textMuted, flex: 0, minWidth: 90 },
  bandFill: { flex: 1 },
  pricePill: {
    borderWidth: 1,
    // borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  price: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  disclaimerText: { fontSize: 10, color: Colors.textDim, fontStyle: 'italic' },
});

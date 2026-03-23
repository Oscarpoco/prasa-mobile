import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Route, Vehicle } from '../data/network';
import { Colors, Radii, Shadow } from '../theme';
import { PulsingDot } from './PulsingDot';

interface Props {
  route: Route;
  vehicles: Vehicle[];
  index: number;
}

export function RouteCard({ route, vehicles, index }: Props) {
  const delayed = vehicles.filter(v => v.status === 'Delayed').length;
  const boarding = vehicles.filter(v => (v.dwellRemaining ?? 0) > 0).length;
  const onTime = vehicles.filter(v => v.status === 'On Time' && (v.dwellRemaining ?? 0) === 0).length;

  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }),
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
      <View style={styles.top}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: route.color }]}>
            <Ionicons
              name={route.vehicleType === 'bus' ? 'bus' : 'train'}
              size={10}
              color="#fff"
            />
            <Text style={styles.badgeText}>{route.shortName}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.name}>{route.name}</Text>
            <Text style={styles.operator}>· {route.operator}</Text>
          </View>
          {delayed > 0 && (
            <View style={styles.warnBadge}>
              <Ionicons name="warning" size={10} color={Colors.red} />
              <Text style={styles.warnText}>{delayed} delayed</Text>
            </View>
          )}
        </View>
        <Text style={styles.desc}>{route.description}</Text>
      </View>

      <View style={styles.bottom}>
        {/* Vehicle dots */}
        <View style={styles.dots}>
          {vehicles.map(v => {
            const isDwelling = (v.dwellRemaining ?? 0) > 0;
            const color = v.status === 'Delayed' ? Colors.red : isDwelling ? Colors.amber : Colors.green;
            return (
              <View key={v.id} style={styles.dotWrap}>
                <PulsingDot color={color} size={9} />
              </View>
            );
          })}
        </View>

        <View style={styles.counts}>
          {onTime > 0 && <Text style={[styles.countPill, { color: Colors.green }]}>{onTime} on time</Text>}
          {boarding > 0 && <Text style={[styles.countPill, { color: Colors.amber }]}>{boarding} boarding</Text>}
          {delayed > 0 && <Text style={[styles.countPill, { color: Colors.red }]}>{delayed} delayed</Text>}
        </View>
      </View>

      {/* Station line */}
      <View style={styles.stationRow}>
        {route.stations.slice(0, 4).map((sid, i) => (
          <React.Fragment key={sid}>
            {i > 0 && <View style={[styles.track, { backgroundColor: route.color + '60' }]} />}
            <View style={[styles.stationDot, { borderColor: route.color }]} />
          </React.Fragment>
        ))}
        {route.stations.length > 4 && (
          <Text style={[styles.moreStns, { color: route.color }]}>+{route.stations.length - 4}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.xl,
    borderLeftWidth: 3,
    marginBottom: 10,
    padding: 14,
    gap: 10,
    ...Shadow.sm,
  },
  top: { gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    // borderRadius: Radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text },
  operator: { fontSize: 11, color: Colors.textDim },
  warnBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.redDim, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radii.pill },
  warnText: { fontSize: 10, color: Colors.red, fontWeight: '600' },
  desc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dotWrap: {},
  counts: { flexDirection: 'row', gap: 8 },
  countPill: { fontSize: 10, fontWeight: '600' },
  stationRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stationDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, backgroundColor: Colors.bgPanel },
  track: { flex: 1, height: 2 },
  moreStns: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
});

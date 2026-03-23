import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../data/network';
import { ROUTES } from '../data/network';
import { Colors, Radii, Shadow } from '../theme';
import { StatusBadge } from './StatusBadge';
import { RouteBadge } from './RouteBadge';
import { LoadBar } from './LoadBar';
import { PulsingDot } from './PulsingDot';

interface Props {
  vehicle: Vehicle;
  index: number;
}

export function VehicleCard({ vehicle: v, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const route = ROUTES[v.routeId];
  const isDwelling = (v.dwellRemaining ?? 0) > 0;
  const isDelayed = v.status === 'Delayed';
  const displayStatus = isDwelling ? 'Boarding' : v.status;

  // Entry animation
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Delayed pulse
  const delayedOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isDelayed) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(delayedOpacity, { toValue: 0.5, duration: 750, useNativeDriver: true }),
          Animated.timing(delayedOpacity, { toValue: 1,   duration: 750, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      delayedOpacity.setValue(1);
    }
  }, [isDelayed]);

  const expandAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const pct = Math.round(((v.passengerLoad ?? 0) / (v.capacity ?? 1)) * 100);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: route.color },
        isDelayed && styles.cardDelayed,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Header Row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(e => !e)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.idRow}>
            {isDwelling && <PulsingDot color={Colors.amber} size={7} />}
            {isDelayed && !isDwelling && <PulsingDot color={Colors.red} size={7} />}
            <Text style={[styles.vehicleId, { color: route.color }]}>{v.id}</Text>
            <RouteBadge shortName={route.shortName} color={route.color} />
          </View>
          <Text style={styles.vehicleName}>{v.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <Animated.View style={{ opacity: isDelayed ? delayedOpacity : 1 }}>
            <StatusBadge status={displayStatus} small />
          </Animated.View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.textDim}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>CURRENT</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{v.currentStation}</Text>
        </View>
        <Ionicons name="arrow-forward" size={12} color={Colors.textDim} style={styles.arrow} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>NEXT STOP</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {isDwelling ? `● ${v.nextStation}` : v.nextStation}
          </Text>
        </View>
        <View style={styles.infoItemRight}>
          <Text style={styles.infoLabel}>ETA</Text>
          <Text style={[styles.infoValue, styles.mono, isDelayed && { color: Colors.red }]}>
            {isDwelling ? '—' : `${v.eta}m`}
          </Text>
        </View>
      </View>

      {/* Expandable Details */}
      <Animated.View
        style={[
          styles.expandable,
          {
            maxHeight: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }),
            opacity: expandAnim,
          },
        ]}
      >
        <View style={[styles.divider, { backgroundColor: route.color + '30' }]} />
        <View style={styles.expandContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SPEED</Text>
              <Text style={[styles.statVal, styles.mono]}>{isDwelling ? 0 : v.speed} km/h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DIRECTION</Text>
              <Text style={styles.statVal} numberOfLines={1}>{v.dirLabel}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>OPERATOR</Text>
              <Text style={styles.statVal}>{route.operator}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TYPE</Text>
              <Text style={styles.statVal}>{v.vehicleType === 'train' ? '🚆 Train' : '🚌 Bus'}</Text>
            </View>
          </View>
          <View style={styles.loadSection}>
            <Text style={styles.statLabel}>PASSENGER LOAD</Text>
            <LoadBar load={v.passengerLoad ?? 0} capacity={v.capacity ?? 1} />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.xl,
    borderLeftWidth: 3,
    marginBottom: 10,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardDelayed: {
    backgroundColor: Colors.bgPanel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: { flex: 1, gap: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleId: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  vehicleName: { fontSize: 12, color: Colors.textMuted },
  chevron: { marginLeft: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 4,
  },
  infoItem: { flex: 1 },
  infoItemRight: { alignItems: 'flex-end' },
  infoLabel: { fontSize: 9, color: Colors.textDim, fontWeight: '600', letterSpacing: 0.8, marginBottom: 2 },
  infoValue: { fontSize: 12, color: Colors.text, fontWeight: '500' },
  mono: { fontVariant: ['tabular-nums'] },
  arrow: { marginHorizontal: 2 },
  expandable: { overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 14 },
  expandContent: { padding: 14, gap: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: { width: '45%' },
  statLabel: { fontSize: 9, color: Colors.textDim, fontWeight: '600', letterSpacing: 0.8, marginBottom: 3 },
  statVal: { fontSize: 12, color: Colors.text, fontWeight: '500' },
  loadSection: { gap: 6 },
});

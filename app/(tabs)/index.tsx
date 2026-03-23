import React, { useEffect, useRef } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSim } from '../../src/context/SimContext';
import { ROUTES } from '../../src/data/network';
import { Colors, Radii, Shadow } from '../../src/theme';
import { AppHeader } from '../../src/components/AppHeader';
import { AlertBanner } from '../../src/components/AlertBanner';
import { StatChip } from '../../src/components/StatChip';
import { PulsingDot } from '../../src/components/PulsingDot';

export default function OverviewScreen() {
  const { vehicles, alerts, dismissAlert } = useSim();
  const [refreshing, setRefreshing] = React.useState(false);

  const trains = vehicles.filter(v => v.vehicleType === 'train');
  const buses  = vehicles.filter(v => v.vehicleType === 'bus');
  const onTime = vehicles.filter(v => v.status === 'On Time').length;
  const delayed = vehicles.filter(v => v.status === 'Delayed').length;
  const boarding = vehicles.filter(v => (v.dwellRemaining ?? 0) > 0).length;

  const stats = [
    { value: vehicles.length, label: 'Active Vehicles',   color: Colors.prasaBlue },
    { value: trains.length,   label: 'Metrorail Trains',  color: Colors.prasaBlue },
    { value: buses.length,    label: 'Autopax Buses',     color: Colors.busOrange },
    { value: onTime,          label: 'On Time',            color: Colors.green },
    { value: boarding,        label: 'At Platform',        color: Colors.amber },
    { value: delayed,         label: 'Delayed',            color: Colors.red },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Overview" subtitle="PRASA Network Operations Centre" showLive />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.prasaBlue} />
        }
      >

        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* Stats Grid */}
        <View style={styles.statsWrapper}>

          {/* AMOUNT */}
          <View style={styles.statsHeader}>
            <View style={styles.statsHeaderBar} />
            <Text style={styles.statsHeaderText}>ACCOUNT BALANCE</Text>
            <View style={styles.statsHeaderLine} />
          </View>

          <View style={[styles.statsGrid, {flexDirection: 'row'}]}>
            <View style={styles.accountCards}>
              <Text style={styles.balance}>R600</Text>
              <Text style={styles.balanceText}>Available Balance</Text>
            </View>

            <View style={styles.accountCards}>
              <Text style={styles.balance}>R200</Text>
              <Text style={styles.balanceText}>Used Balance</Text>
            </View>
           
          </View>
          {/* ENDS */}

          <View style={styles.statsHeader}>
            <View style={styles.statsHeaderBar} />
            <Text style={styles.statsHeaderText}>SYSTEM METRICS</Text>
            <View style={styles.statsHeaderLine} />
          </View>

          <View style={styles.statsGrid}>
            {stats.map((s, i) => (
              <StatChip key={s.label} value={s.value} label={s.label} color={s.color} index={i} />
            ))}
          </View>
        </View>

        {/* Network Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderBar} />
            <Text style={styles.sectionTitle}>NETWORK STATUS</Text>
            <View style={styles.sectionHeaderDots}>
              <View style={styles.headerDot} />
              <View style={styles.headerDot} />
              <View style={styles.headerDot} />
            </View>
          </View>
          
          <View style={styles.networkList}>
            {Object.values(ROUTES).map((route, i) => {
              const routeVehicles = vehicles.filter(v => v.routeId === route.id);
              const hasDelay = routeVehicles.some(v => v.status === 'Delayed');
              const hasBoarders = routeVehicles.some(v => (v.dwellRemaining ?? 0) > 0);
              const statusColor = hasDelay ? Colors.red : hasBoarders ? Colors.amber : Colors.green;
              const statusLabel = hasDelay ? 'Delays' : hasBoarders ? 'Boarding' : 'Operational';

              return (
                <NetworkRow
                  key={route.id}
                  route={route}
                  vehicles={routeVehicles}
                  statusColor={statusColor}
                  statusLabel={statusLabel}
                  index={i}
                />
              );
            })}
          </View>
        </View>

        {/* Recent Alerts Footer */}
        {alerts.length > 0 && (
          <View style={styles.alertCount}>
            <View style={styles.alertCountBracket}>
              <Text style={styles.bracketText}>{'['}</Text>
            </View>
            <Ionicons name="notifications" size={12} color={Colors.amber} />
            <Text style={styles.alertCountText}>
              {alerts.length} active alert{alerts.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.alertCountBracket}>
              <Text style={styles.bracketText}>{']'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NetworkRow({ route, vehicles, statusColor, statusLabel, index }: any) {
  const slideAnim = useRef(new Animated.Value(16)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 70, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay: index * 70, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.networkRow,
        { borderLeftColor: route.color },
        { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
      ]}
    >
      {/* Corner accent */}
      <View style={styles.networkCorner} />
      
      <View style={[styles.routeColorBar, { backgroundColor: route.color }]} />
      <View style={[styles.routeColorDot, { backgroundColor: route.color }]} />
      
      <View style={styles.networkRowContent}>
        <View style={styles.networkRowTop}>
          <Text style={styles.networkRouteName}>{route.name}</Text>
          <View style={styles.operatorPill}>
            <Text style={styles.networkOperator}>{route.operator}</Text>
          </View>
        </View>
        <Text style={styles.networkDesc} numberOfLines={2}>{route.description}</Text>
      </View>
      
      <View style={styles.networkRowRight}>
        <View style={styles.statusPill}>
          <PulsingDot color={statusColor} size={6} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <View style={styles.vehicleCountBadge}>
          <Text style={styles.vehicleCount}>{vehicles.length}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgDeep },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 90 },

  statsWrapper: { gap: 10, marginBottom: 24, marginTop: 5 },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsHeaderBar: {
    width: 3,
    height: 16,
    backgroundColor: Colors.prasaBlue,
    borderRadius: 0,
  },
  statsHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  statsHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  section: { gap: 12, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionHeaderBar: {
    width: 3,
    height: 16,
    backgroundColor: Colors.prasaBlue,
    // borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  sectionHeaderDots: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 'auto',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },

  networkList: { gap: 8 },
  networkRow: {
    backgroundColor: Colors.bgPanel,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  networkCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: Radii.lg,
    opacity: 0.4,
  },
  routeColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.15,
  },
  routeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.bgPanel,
  },
  networkRowContent: { flex: 1, gap: 3 },
  networkRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  networkRouteName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  operatorPill: {
    backgroundColor: Colors.bgDeep,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  networkOperator: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  networkDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  networkRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: .7,
    borderColor: Colors.prasaBlue,
    position: 'absolute',
    right: 0,
    bottom: -22,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '400',
    letterSpacing: 0.3,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  vehicleCountBadge: {
    backgroundColor: Colors.bgDeep,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  vehicleCount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  
  alertCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgPanel,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  alertCountBracket: {
    opacity: 0.3,
  },
  bracketText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  alertCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDim,
    letterSpacing: 0.2,
  },
  accountCards:{
    width: '48%',
    backgroundColor: Colors.bg,
    height: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 10,
    gap: 2
  },

  balance:{
    fontSize: 26,
    color: Colors.prasaBlue,
    fontWeight: 'bold',
  },
  balanceText:{
    fontSize: 14,
    color: Colors.textDim
  }
});
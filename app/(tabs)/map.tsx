import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSim } from '../../src/context/SimContext';
import { ROUTES, STATIONS, Vehicle } from '../../src/data/network';
import { Colors, Radii, Shadow } from '../../src/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

type FilterMode = 'all' | 'train' | 'bus';

const JHB_CENTER = { latitude: -26.08, longitude: 28.12 };

function getRouteCoords(routeId: string) {
  const route = ROUTES[routeId];
  return route.stations.map(sid => {
    const stn = STATIONS[sid];
    return { latitude: stn.lat, longitude: stn.lng };
  });
}

export default function MapScreen() {
  const { vehicles } = useSim();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const mapRef = useRef<MapView>(null);

  const filteredVehicles = vehicles.filter(v => {
    if (filter === 'all') return true;
    return v.vehicleType === filter;
  });

  const visibleRouteIds = new Set(filteredVehicles.map(v => v.routeId));
  const allRoutes = Object.values(ROUTES).filter(r =>
    filter === 'all' || r.vehicleType === filter
  );

  const pillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pillAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Filter Pills */}
      <Animated.View style={[styles.filterRow, { opacity: pillAnim, transform: [{ translateY: pillAnim.interpolate({ inputRange: [0,1], outputRange: [-20, 0] }) }] }]}>
        <View style={styles.filterWrap}>
          {(['all', 'train', 'bus'] as FilterMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.filterPill, filter === mode && styles.filterPillActive]}
              onPress={() => setFilter(mode)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={mode === 'all' ? 'map' : mode === 'train' ? 'train' : 'bus'}
                size={12}
                color={filter === mode ? Colors.white : Colors.textDim}
              />
              <Text style={[styles.filterLabel, filter === mode && styles.filterLabelActive]}>
                {mode === 'all' ? 'All' : mode === 'train' ? 'Trains' : 'Buses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </Animated.View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...JHB_CENTER,
          latitudeDelta: 0.8,
          longitudeDelta: 0.8,
        }}
        showsUserLocation={false}
        showsCompass={false}
        mapType="standard"
      >
        {/* Route Lines */}
        {allRoutes.map(route => (
          <Polyline
            key={route.id}
            coordinates={getRouteCoords(route.id)}
            strokeColor={route.color}
            strokeWidth={route.vehicleType === 'bus' ? 3 : 4}
            lineDashPattern={route.vehicleType === 'bus' ? [12, 8] : undefined}
            lineJoin="round"
          />
        ))}

        {/* Station Markers */}
        {Object.values(STATIONS).filter(stn =>
          stn.routes.some(rid => visibleRouteIds.has(rid))
        ).map(stn => (
          <Marker
            key={stn.id}
            coordinate={{ latitude: stn.lat, longitude: stn.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.stationDot,
              stn.type === 'interchange' && styles.stationDotLarge,
            ]}>
              <View style={[styles.stationInner, stn.type === 'interchange' && styles.stationInnerLarge]} />
            </View>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{stn.name}</Text>
                <Text style={styles.calloutSub}>{stn.zone} · {stn.platforms}p</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Vehicle Markers */}
        {filteredVehicles.map(v => {
          if (!v.lat || !v.lng) return null;
          const route = ROUTES[v.routeId];
          const isDelayed = v.status === 'Delayed';
          const isDwelling = (v.dwellRemaining ?? 0) > 0;
          const dotColor = isDelayed ? Colors.red : isDwelling ? Colors.amber : route.color;

          return (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.lat, longitude: v.lng }}
              onPress={() => setSelectedVehicle(selectedVehicle?.id === v.id ? null : v)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.vehicleMarker, { backgroundColor: dotColor, borderColor: dotColor + '60' }]}>
                <Ionicons
                  name={v.vehicleType === 'train' ? 'train' : 'bus'}
                  size={10}
                  color="#fff"
                />
              </View>
              <Callout tooltip onPress={() => {}}>
                <View style={styles.vehicleCallout}>
                  <View style={[styles.calloutAccent, { backgroundColor: route.color }]} />
                  <View style={styles.calloutBody}>
                    <Text style={[styles.calloutId, { color: route.color }]}>{v.id}</Text>
                    <Text style={styles.calloutVName}>{v.name}</Text>
                    <Text style={styles.calloutSub}>
                      {route.name} · {v.dirLabel}
                    </Text>
                    <Text style={styles.calloutSub}>
                      → {v.nextStation} {isDwelling ? '(Boarding)' : `ETA ${v.eta}m`}
                    </Text>
                    <View style={styles.calloutStatus}>
                      <StatusBadge status={isDwelling ? 'Boarding' : v.status} small />
                    </View>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Vehicle count chip */}
      <View style={styles.countChip}>
        <Ionicons
          name={filter === 'bus' ? 'bus' : 'train'}
          size={12}
          color={Colors.prasaBlue}
        />
        <Text style={styles.countText}>{filteredVehicles.length} active</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgDeep },
  map: { flex: 1 },

  filterRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterWrap: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    // borderRadius: Radii.pill,
    padding: 3,
    gap: 2,
    ...Shadow.md,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    // borderRadius: Radii.pill,
  },
  filterPillActive: { backgroundColor: Colors.prasaBlue },
  filterLabel: { fontSize: 12, fontWeight: '600', color: Colors.textDim },
  filterLabelActive: { color: Colors.white },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    // borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 10,
    ...Shadow.sm,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  liveText: { fontSize: 10, fontWeight: '700', color: Colors.green, letterSpacing: 0.8 },

  stationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.prasaGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationDotLarge: { width: 14, height: 14, borderRadius: 7, borderColor: Colors.prasaBlue, borderWidth: 2.5 },
  stationInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.prasaGray },
  stationInnerLarge: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.prasaBlue },

  vehicleMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Shadow.sm,
  },

  callout: {
    backgroundColor: Colors.white,
    borderRadius: Radii.md,
    padding: 8,
    minWidth: 120,
    ...Shadow.md,
  },
  calloutName: { fontSize: 12, fontWeight: '700', color: Colors.text },
  calloutSub: { fontSize: 10, color: Colors.textDim, marginTop: 2 },

  vehicleCallout: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    minWidth: 180,
    flexDirection: 'row',
    ...Shadow.lg,
  },
  calloutAccent: { width: 4 },
  calloutBody: { padding: 10, gap: 2, flex: 1 },
  calloutId: { fontSize: 12, fontWeight: '700' },
  calloutVName: { fontSize: 12, fontWeight: '600', color: Colors.text },
  calloutStatus: { marginTop: 4 },

  countChip: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: Radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Shadow.md,
  },
  countText: { fontSize: 12, fontWeight: '600', color: Colors.prasaBlue },
});

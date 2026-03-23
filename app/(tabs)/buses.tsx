import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSim } from '../../src/context/SimContext';
import { ROUTES, Vehicle } from '../../src/data/network';
import { Colors, Radii, Shadow } from '../../src/theme';
import { AppHeader } from '../../src/components/AppHeader';
import { VehicleCard } from '../../src/components/VehicleCard';
import { RouteCard } from '../../src/components/RouteCard';

type TabKey = 'status' | 'lines';

export default function BusesScreen() {
  const { vehicles } = useSim();
  const [activeTab, setActiveTab] = useState<TabKey>('status');
  const buses = vehicles.filter(v => v.vehicleType === 'bus');
  const busRoutes = Object.values(ROUTES).filter(r => r.vehicleType === 'bus');

  const tabAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(tabAnim, {
      toValue: activeTab === 'status' ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Buses" subtitle="Find your next bus" />
      <View style={styles.headerWrap}>

        <View style={styles.segControl}>
          <Animated.View
            style={[
              styles.segIndicator,
              {
                left: tabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['2%', '52%'],
                }),
              },
            ]}
          />
          {(['status', 'lines'] as TabKey[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.segBtn}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab === 'status' ? 'list' : 'git-branch-outline'}
                size={13}
                color={activeTab === tab ? Colors.busOrange : Colors.textDim}
              />
              <Text style={[styles.segLabel, activeTab === tab && styles.segLabelActive]}>
                {tab === 'status' ? 'Bus Status' : 'Bus Lines'}
              </Text>
              <View style={[styles.countBadge, activeTab === tab && styles.countBadgeActive]}>
                <Text style={[styles.countText, activeTab === tab && styles.countTextActive]}>
                  {tab === 'status' ? buses.length : busRoutes.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={activeTab === 'status' ? buses : busRoutes}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) =>
          activeTab === 'status' ? (
            <VehicleCard vehicle={item as Vehicle} index={index} />
          ) : (
            <RouteCard
              route={item as any}
              vehicles={vehicles.filter((v: Vehicle) => v.routeId === (item as any).id)}
              index={index}
            />
          )
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bus-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No buses found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgDeep },
  headerWrap: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 8, backgroundColor: Colors.bgDeep },

  segControl: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    // borderRadius: Radii.lg,
    paddingVertical: 3,
    marginBottom: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segIndicator: {
    position: 'absolute',
    top: 3,
    width: '46%',
    bottom: 3,
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.md,
    ...Shadow.sm,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    // borderRadius: Radii.md,
    zIndex: 1,
  },
  segLabel: { fontSize: 12, fontWeight: '600', color: Colors.textDim },
  segLabelActive: { color: Colors.busOrange },
  countBadge: { backgroundColor: Colors.border, borderRadius: Radii.pill, paddingHorizontal: 6, paddingVertical: 1 },
  countBadgeActive: { backgroundColor: 'rgba(255,140,0,0.15)' },
  countText: { fontSize: 10, fontWeight: '700', color: Colors.textDim },
  countTextActive: { color: Colors.busOrange },
  list: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textDim },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ScrollView,
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

export default function TrainsScreen() {
  const { vehicles } = useSim();
  const [activeTab, setActiveTab] = useState<TabKey>('status');
  const trains = vehicles.filter(v => v.vehicleType === 'train');
  const trainRoutes = Object.values(ROUTES).filter(r => r.vehicleType === 'train');

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
        <AppHeader title="Trains" subtitle="Find your next train" /> 
      <View style={styles.headerWrap}>

        {/* Segment Control */}
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
                color={activeTab === tab ? Colors.prasaBlue : Colors.textDim}
              />
              <Text style={[styles.segLabel, activeTab === tab && styles.segLabelActive]}>
                {tab === 'status' ? 'Train Status' : 'Rail Lines'}
              </Text>
              <View style={[styles.countBadge, activeTab === tab && styles.countBadgeActive]}>
                <Text style={[styles.countText, activeTab === tab && styles.countTextActive]}>
                  {tab === 'status' ? trains.length : trainRoutes.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={activeTab === 'status' ? trains : trainRoutes}
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
        ListEmptyComponent={<EmptyState type="train" />}
      />
    </SafeAreaView>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="train-outline" size={48} color={Colors.border} />
      <Text style={styles.emptyText}>No {type}s found</Text>
    </View>
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
    width: '47%',
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
  segLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDim,
  },
  segLabelActive: { color: Colors.prasaBlue },
  countBadge: {
    backgroundColor: Colors.border,
    // borderRadius: Radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeActive: { backgroundColor: Colors.prasaBlueDim },
  countText: { fontSize: 10, fontWeight: '700', color: Colors.textDim },
  countTextActive: { color: Colors.prasaBlue },
  list: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textDim },
});

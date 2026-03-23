import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../src/data/network';
import { Colors, Radii, Shadow } from '../../src/theme';
import { AppHeader } from '../../src/components/AppHeader';
import { PriceCard } from '../../src/components/PriceCard';

function calcFares(route: typeof ROUTES[string]) {
  const stops = route.stations.length;
  const base = route.vehicleType === 'bus' ? 12 : 10;
  const step = route.vehicleType === 'bus' ? 4 : 3;
  return {
    stops,
    bands: [
      { label: '1–3 stops',  price: base },
      { label: '4–7 stops',  price: base + step },
      { label: '8+ stops',   price: base + step * 2 },
    ],
  };
}

export default function PricesScreen() {
  const routes = Object.values(ROUTES);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Fares"
        subtitle="Indicative prices for all routes"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Disclaimer Banner */}
        <Animated.View style={[styles.disclaimer, { opacity: fadeAnim }]}>
          <Ionicons name="information-circle" size={16} color={Colors.prasaBlue} />
          <View style={styles.disclaimerText}>
            <Text style={styles.disclaimerTitle}>Demo Fares Only</Text>
            <Text style={styles.disclaimerBody}>
              Prices shown are indicative estimates for demonstration purposes.
              Contact PRASA for official tariff schedules.
            </Text>
          </View>
        </Animated.View>

        {/* Train Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="train" size={22} color={Colors.prasaBlue} />
            <Text style={styles.sectionTitle}>Metrorail Trains</Text>
          </View>
          {routes.filter(r => r.vehicleType === 'train').map((route, i) => {
            const { stops, bands } = calcFares(route);
            return <PriceCard key={route.id} route={route} stops={stops} bands={bands} index={i} />;
          })}
        </View>

        {/* Bus Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bus" size={22} color={Colors.busOrange} />
            <Text style={[styles.sectionTitle, { color: Colors.busOrange }]}>Autopax Buses</Text>
          </View>
          {routes.filter(r => r.vehicleType === 'bus').map((route, i) => {
            const { stops, bands } = calcFares(route);
            return <PriceCard key={route.id} route={route} stops={stops} bands={bands} index={i + 3} />;
          })}
        </View>

        {/* Fare Classes Info */}
        <Animated.View style={[styles.fareClassBox, { opacity: fadeAnim }]}>
          <Text style={styles.fareClassTitle}>Fare Bands Explained</Text>
          <View style={styles.fareClassGrid}>
            {[
              { label: '1–3 stops', desc: 'Short local trip', color: Colors.green },
              { label: '4–7 stops', desc: 'Medium corridor',   color: Colors.amber },
              { label: '8+ stops',  desc: 'Long distance',     color: Colors.busOrange },
            ].map(fc => (
              <View key={fc.label} style={styles.fareClassItem}>
                <View style={[styles.fareClassDot, { backgroundColor: fc.color }]} />
                <View>
                  <Text style={styles.fareClassLabel}>{fc.label}</Text>
                  <Text style={styles.fareClassDesc}>{fc.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgDeep },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 110 },

  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.prasaBlueDim,
    // borderRadius: Radii.lg,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderHi,
    alignItems: 'flex-start',
  },
  disclaimerText: { flex: 1, gap: 2 },
  disclaimerTitle: { fontSize: 12, fontWeight: '700', color: Colors.prasaBlue },
  disclaimerBody: { fontSize: 11, color: Colors.textMuted, lineHeight: 16 },

  section: { gap: 0, marginBottom: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.prasaBlue,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  fareClassBox: {
    backgroundColor: Colors.bgPanel,
    padding: 16,
    gap: 12,
    ...Shadow.sm,
  },
  fareClassTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  fareClassGrid: { gap: 10 },
  fareClassItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fareClassDot: { width: 10, height: 10, borderRadius: 5 },
  fareClassLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },
  fareClassDesc: { fontSize: 11, color: Colors.textDim },
});

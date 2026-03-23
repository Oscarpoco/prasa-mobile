import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadow } from '../../src/theme';
import { useSim } from '../../src/context/SimContext';

function TabIcon({
  name,
  focused,
  color,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  badge?: number;
}) {
  return (
    <View style={tabStyles.iconWrap}>
      {/* Glow effect when focused */}
      {focused && <View style={[tabStyles.iconGlow, { backgroundColor: color }]} />}
      
      {/* Corner brackets when focused */}
      {focused && (
        <>
          <View style={[tabStyles.cornerTL, { borderColor: color }]} />
          <View style={[tabStyles.cornerBR, { borderColor: color }]} />
        </>
      )}
      
      <Ionicons name={name} size={22} color={color} />
      
      {badge != null && badge > 0 && (
        <View style={tabStyles.badge}>
          <View style={tabStyles.badgeGlow} />
          <Text style={tabStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { alerts, vehicles } = useSim();
  const delayed = vehicles.filter(v => v.status === 'Delayed').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: Colors.prasaBlue,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: tabStyles.label,
        tabBarItemStyle: tabStyles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'grid' : 'grid-outline'}
              focused={focused}
              color={color}
              badge={alerts.length > 0 ? alerts.length : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trains"
        options={{
          title: 'Trains',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'train' : 'train-outline'}
              focused={focused}
              color={color}
              badge={delayed > 0 ? delayed : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notificationsScreen"
        options={{
          title: 'Updates',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'notifications' : 'notifications-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buses"
        options={{
          title: 'Buses',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'bus' : 'bus-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: 'Fares',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'ticket' : 'ticket-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'map' : 'map-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'ios' ? 18 : 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    height: Platform.OS === 'ios' ? 82 : 70,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingHorizontal: 4,
    overflow: 'hidden',
    // ...Shadow.lg,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 3,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  item: {
    paddingTop: 4,
    gap: 2,
  },
  iconWrap: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    // borderRadius: 8,
    opacity: 0.08,
  },
  cornerTL: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 10,
    height: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    // borderTopLeftRadius: 2,
    opacity: 0.4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    // borderBottomRightRadius: 2,
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: Colors.red,
    borderRadius: Radii.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.bgPanel,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  badgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    opacity: 0.15,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
    fontFamily: 'monospace',
  },
});
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSim } from '../../src/context/SimContext';
import { ROUTES, Vehicle } from '../../src/data/network';
import { Colors, Radii, Shadow } from '../../src/theme';
import { AppHeader } from '../../src/components/AppHeader';
import { PulsingDot } from '../../src/components/PulsingDot';

type FilterMode = 'all' | 'alerts' | 'delays' | 'updates';

interface Notification {
  id: string;
  type: 'alert' | 'delay' | 'update' | 'boarding' | 'arrived';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  vehicleId?: string;
  routeId?: string;
  read?: boolean;
}

// Generate stable notifications - only create once and update based on vehicle state
function generateNotifications(vehicles: Vehicle[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Fixed timestamps for consistent notifications
  const baseTime = new Date('2024-03-18T10:00:00');

  vehicles.forEach((v, idx) => {
    const route = ROUTES[v.routeId];
    
    // Delay notifications - stable
    if (v.status === 'Delayed') {
      notifications.push({
        id: `delay-${v.id}`,
        type: 'delay',
        title: `${v.id} Delayed`,
        message: `${v.name} on ${route.name} is running behind schedule. Current status: ${v.eta}m to ${v.nextStation}.`,
        timestamp: new Date(baseTime.getTime() + idx * 60000),
        severity: 'warning',
        vehicleId: v.id,
        routeId: v.routeId,
      });
    }

    // Boarding notifications - stable
    if ((v.dwellRemaining ?? 0) > 0) {
      notifications.push({
        id: `boarding-${v.id}`,
        type: 'boarding',
        title: `${v.id} Now Boarding`,
        message: `${v.name} is now boarding at ${v.nextStation}. Departure in ${v.dwellRemaining}s.`,
        timestamp: new Date(baseTime.getTime() + idx * 45000),
        severity: 'info',
        vehicleId: v.id,
        routeId: v.routeId,
      });
    }
  });

  // System alerts - fixed timestamps
  notifications.push(
    {
      id: 'alert-1',
      type: 'alert',
      title: 'Service Advisory',
      message: 'Platform 3 at Johannesburg Park Station temporarily closed for maintenance. Please use alternative platforms.',
      timestamp: new Date(baseTime.getTime() - 1800000),
      severity: 'warning',
    },
    {
      id: 'update-1',
      type: 'update',
      title: 'System Update',
      message: 'Real-time tracking accuracy improved. All vehicle positions now updating every 10 seconds.',
      timestamp: new Date(baseTime.getTime() - 3600000),
      severity: 'info',
    },
    {
      id: 'alert-2',
      type: 'alert',
      title: 'Weather Alert',
      message: 'Heavy rain expected in Gauteng region. Expect minor delays on outdoor platforms.',
      timestamp: new Date(baseTime.getTime() - 5400000),
      severity: 'critical',
    }
  );

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function NotificationsScreen() {
  const { vehicles } = useSim();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate notifications only once on mount, not on every vehicle update
  useEffect(() => {
    setNotifications(generateNotifications(vehicles));
  }, []); // Empty dependency array - only run once

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return n.type === 'alert';
    if (filter === 'delays') return n.type === 'delay';
    if (filter === 'updates') return n.type === 'update' || n.type === 'boarding' || n.type === 'arrived';
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setNotifications(generateNotifications(vehicles));
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerContainer}>
        <AppHeader 
          title="Notifications" 
          subtitle="System Updates & Alerts" 
          showLive 
        />
      {/* Header using AppHeader component */}

        {/* Filter Pills */}
        <View style={styles.filterWrap}>
          {(['all', 'alerts', 'delays', 'updates'] as FilterMode[]).map(mode => {
            const count = notifications.filter(n => {
              if (mode === 'all') return true;
              if (mode === 'alerts') return n.type === 'alert';
              if (mode === 'delays') return n.type === 'delay';
              if (mode === 'updates') return n.type === 'update' || n.type === 'boarding' || n.type === 'arrived';
              return true;
            }).length;

            return (
              <TouchableOpacity
                key={mode}
                style={[styles.filterPill, filter === mode && styles.filterPillActive]}
                onPress={() => setFilter(mode)}
                activeOpacity={0.7}
              >
                <View style={styles.filterContent}>
                  <Text style={[styles.filterLabel, filter === mode && styles.filterLabelActive]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                  <View style={[styles.filterBadge, filter === mode && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, filter === mode && styles.filterBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.prasaBlue} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textDim} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        ) : (
          filteredNotifications.map((notification, index) => (
            <NotificationCard key={notification.id} notification={notification} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({ notification, index }: { notification: Notification; index: number }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'alert': return 'warning';
      case 'delay': return 'time';
      case 'boarding': return 'people';
      case 'arrived': return 'checkmark-circle';
      case 'update': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getColor = () => {
    switch (notification.severity) {
      case 'critical': return Colors.red;
      case 'warning': return Colors.amber;
      case 'info': return Colors.prasaBlue;
      default: return Colors.textDim;
    }
  };

  const route = notification.routeId ? ROUTES[notification.routeId] : null;

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Corner accent */}
      <View style={styles.cardCorner} />
      
      {/* Severity indicator */}
      <View style={[styles.severityBar, { backgroundColor: getColor() }]} />

      <View style={styles.cardContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: getColor() + '15' }]}>
          <Ionicons name={getIcon()} size={20} color={getColor()} />
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{notification.title}</Text>
            <Text style={styles.cardTime}>{formatTime(notification.timestamp)}</Text>
          </View>

          <Text style={styles.cardMessage}>{notification.message}</Text>

          {/* Route badge if applicable */}
          {route && (
            <View style={styles.routeBadge}>
              <View style={[styles.routeDot, { backgroundColor: route.color }]} />
              <Text style={styles.routeText}>{route.name}</Text>
            </View>
          )}

          {/* Type badge */}
          <View style={styles.cardFooter}>
            <View style={[styles.typePill, { borderColor: getColor() + '40' }]}>
              <Text style={[styles.typeText, { color: getColor() }]}>
                {notification.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgDeep },
  scroll: { flex: 1 },
  content: { padding: 10, paddingTop: 24, gap: 10, paddingBottom: 100 },

  headerContainer: {
    backgroundColor: Colors.bgDeep,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 14,
  },

  filterWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
  },
  filterPill: {
    flex: 1,
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  filterPillActive: {
    backgroundColor: Colors.prasaBlue,
    borderColor: Colors.prasaBlue,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  filterLabelActive: {
    color: Colors.white,
  },
  filterBadge: {
    backgroundColor: Colors.bg,
    borderRadius: Radii.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: "absolute", 
    top: -20,
    right: -10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterBadgeActive: {
    backgroundColor: Colors.prasaBlue,
    borderColor: Colors.white
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  filterBadgeTextActive: {
    color: Colors.white,
  },

  card: {
    backgroundColor: Colors.bgPanel,
    // borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.sm,
  },
  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    // borderTopRightRadius: Radii.lg,
    opacity: 0.4,
  },
  severityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    paddingLeft: 18,
  },
  iconContainer: {
    width: 40,
    height: 40,
    // borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  cardTime: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDim,
    fontFamily: 'monospace',
  },
  cardMessage: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgDeep,
    paddingHorizontal: 8,
    paddingVertical: 4,
    // borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  typePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDim,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
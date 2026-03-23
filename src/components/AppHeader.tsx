import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii, Shadow } from '../theme';
import { PulsingDot } from './PulsingDot';

interface Props {
  appName?: string;
  title: string;
  subtitle?: string;
  showLive?: boolean;
}

const iconSource = require('../../assets/icon.png');

export function AppHeader({ appName = 'RailTrack PRASA', title, subtitle, showLive = false }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Subtle shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.03, 0.08, 0.03],
  });

  return (
    <Animated.View style={[styles.wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Tech grid overlay */}
      <Animated.View style={[styles.gridOverlay, { opacity: shimmerOpacity }]} />
      
      {/* Corner accents */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />

      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoContainer}>
            <View style={styles.logoRing} />
            <Image source={iconSource} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.brandText}>
            <View style={styles.appNameRow}>
              <View style={styles.bracket}><Text style={styles.bracketText}>{'['}</Text></View>
              <Text style={styles.appName} numberOfLines={1}>
                {appName}
              </Text>
              <View style={styles.bracket}><Text style={styles.bracketText}>{']'}</Text></View>
            </View>
            <Text style={styles.meta} numberOfLines={1}>{subtitle ?? 'Live tracking demo'}</Text>
          </View>
        </View>
        
      </View>

      <View style={styles.divider} />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && (
          <View style={styles.subtitleRow}>
            <View style={styles.subtitleBar} />
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bg,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.prasaBlue + '80',
    // borderTopLeftRadius: Radii.xl,
    zIndex: 1000,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.prasaBlue + '80',
    // borderBottomRightRadius: Radii.xl,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.prasaBlue + '80',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.prasaBlue,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
    // width: 44,
    // height: 44,
  },
  logoRing: {
   
  },
  logo: {
    width: 100,
    height: 44,
    marginLeft: -10,
    backgroundColor: Colors.white,
    // ...Shadow.sm,
  },
  brandText: {
    flex: 1,
    gap: 3,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bracket: {
    opacity: 0.4,
  },
  bracketText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  meta: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDim,
    letterSpacing: 0.3,
    opacity: 0.7,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
 
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
    marginHorizontal: -4,
  },
  titleBlock: {
    gap: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitleBar: {
    width: 3,
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    letterSpacing: 0.2,
    flex: 1,
    textTransform: 'uppercase'
  },
});
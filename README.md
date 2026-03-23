# 🚆 PRASA RailTrack Mobile

A React Native Expo mobile app for the PRASA passenger-facing rail and bus tracking experience — mirroring the web RailTrack demo with full live simulation, bottom navigation, and native animations.

---

## Tech Stack

- **Expo SDK 54** (forced)
- **Expo Router 4** (file-based routing, bottom tabs)
- **React Native Reanimated 3** + React Native `Animated` API (entry anims, pulsing dots, expand/collapse)
- **react-native-maps** (live vehicle positions on Leaflet-equivalent native map)
- **TypeScript** throughout
- **StyleSheet** only — no Tailwind, no NativeWind
- **No login required**

---

## Screens (Bottom Tabs)

| Tab | Screen | Features |
|-----|--------|---------|
| 🏠 Overview | `index.tsx` | Live stats, network status per route, alert banners |
| 🚆 Trains | `trains.tsx` | Train Status Board + Rail Lines, expandable vehicle cards |
| 🗺️ Map | `map.tsx` | Live map with route polylines, station markers, vehicle markers + callouts |
| 🚌 Buses | `buses.tsx` | Bus Status Board + Bus Lines, same cards as trains |
| 🎫 Fares | `prices.tsx` | Indicative fare bands per route |

---

## Setup

### 1. Install dependencies

```bash
cd prasa-railtrack-mobile
npm install
```

### 2. Start with Expo Go

```bash
npx expo start
```

Then scan the QR code with **Expo Go** (make sure you have Expo Go installed from the App Store or Play Store).

> ⚠️ Use Expo Go SDK 54. If prompted to update, accept.

### 3. Android / iOS Simulator

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## Project Structure

```
prasa-railtrack-mobile/
├── app/
│   ├── _layout.tsx          # Root layout (GestureHandler, SafeArea, SimProvider)
│   └── (tabs)/
│       ├── _layout.tsx      # Bottom tab navigator
│       ├── index.tsx        # Overview screen
│       ├── trains.tsx       # Trains screen
│       ├── map.tsx          # Live map screen
│       ├── buses.tsx        # Buses screen
│       └── prices.tsx       # Fares screen
├── src/
│   ├── theme.ts             # Colors, Radii, Shadow — matches web brand
│   ├── data/
│   │   └── network.ts       # Stations, Routes, Initial Vehicles (identical to web)
│   ├── hooks/
│   │   └── useSimulation.ts # Live simulation engine (same logic as web)
│   ├── context/
│   │   └── SimContext.tsx   # React context wrapping the sim
│   └── components/
│       ├── AppHeader.tsx    # PRASA logo + screen title + LIVE badge
│       ├── AlertBanner.tsx  # Slide-in alert notifications
│       ├── VehicleCard.tsx  # Expandable vehicle info card
│       ├── RouteCard.tsx    # Route summary card with live dots
│       ├── PriceCard.tsx    # Fare band card
│       ├── StatChip.tsx     # Overview stat chips
│       ├── StatusBadge.tsx  # On Time / Delayed / Boarding badge
│       ├── RouteBadge.tsx   # Route shortname colored badge
│       ├── LoadBar.tsx      # Animated passenger load bar
│       └── PulsingDot.tsx   # Animated pulsing status dot
```

---

## Brand Colors (from web source)

```
--prasa-blue:   #00A8E1
--prasa-blue-dk: #0082B0
--green:        #00C87A
--amber:        #F59E0B
--red:          #E53E3E
--bus-orange:   #FF8C00
--bus-red:      #C0392B
```

---

## Simulation

The app runs the same live simulation as the web version:
- Vehicles move along routes in real time
- They dwell at stations (4s boarding period — amber pulsing)
- Delays can be manually applied (future: admin screen)
- Alerts are auto-dismissed after TTL
- Simulation ticks every 200ms

---

## Notes

- Map uses `PROVIDER_DEFAULT` for Expo Go compatibility (Apple Maps on iOS, Google Maps on Android requires API key)
- For Google Maps on Android in production, add your API key in `app.json` under `android.config.googleMaps.apiKey`

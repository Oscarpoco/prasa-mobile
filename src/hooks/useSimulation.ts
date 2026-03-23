import { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_VEHICLES, ROUTES, STATIONS, Vehicle, Alert } from '../data/network';

const TICK_MS = 200;
const DWELL_MS = 4000;

const ALERT_TTL: Record<string, number> = {
  warning: 120_000,
  error:   120_000,
  info:     60_000,
  success:  45_000,
};

// ── Helpers ──────────────────────────────────────────────────────
function getStation(id: string) {
  return STATIONS[id];
}

function getStationCount(routeId: string) {
  return ROUTES[routeId].stations.length;
}

function getStationAtIndex(routeId: string, idx: number) {
  const stations = ROUTES[routeId].stations;
  const clamped = Math.max(0, Math.min(stations.length - 1, idx));
  return getStation(stations[clamped]);
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lerp(a: { lat: number; lng: number }, b: { lat: number; lng: number }, t: number) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

function calcEta(progress: number, speed: number, from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const dist = haversine(from.lat, from.lng, to.lat, to.lng) * (1 - progress);
  return Math.max(1, Math.round((dist / speed) * 60));
}

function getDirLabel(routeId: string, direction: 1 | -1) {
  const stations = ROUTES[routeId].stations;
  if (direction === 1) {
    return `→ ${getStation(stations[stations.length - 1]).name}`;
  }
  return `← ${getStation(stations[0]).name}`;
}

function computeVehicle(v: Vehicle): Vehicle {
  const stationCount = getStationCount(v.routeId);
  const current = getStationAtIndex(v.routeId, v.routeIndex);
  const nextIdx = Math.max(0, Math.min(stationCount - 1, v.routeIndex + v.direction));
  const next = getStationAtIndex(v.routeId, nextIdx);
  const pos = lerp(current, next, v.progress);
  return {
    ...v,
    lat: pos.lat,
    lng: pos.lng,
    currentStation: current.name,
    nextStation: next.name,
    nextStationId: next.id,
    eta: calcEta(v.progress, v.speed, current, next),
    dirLabel: getDirLabel(v.routeId, v.direction),
    dwellRemaining: 0,
    routeColor: ROUTES[v.routeId].color,
  };
}

// ── Simulation Hook ───────────────────────────────────────────
export function useSimulation() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    INITIAL_VEHICLES.map(computeVehicle)
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertCounter = useRef(0);

  const addAlert = useCallback((message: string, type: Alert['type'] = 'warning') => {
    const id = ++alertCounter.current;
    setAlerts(prev => [{ id, message, type, timestamp: new Date() }, ...prev.slice(0, 29)]);
    const ttl = ALERT_TTL[type] ?? ALERT_TTL.warning;
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), ttl);
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const simulateDelay = useCallback((vehicleId: string, minutes = 10) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const newEta = (v.eta ?? 0) + minutes;
      const route = ROUTES[v.routeId];
      addAlert(
        `${v.id} — ${v.name} is delayed by ${minutes} min on ${route.name}. New ETA to ${v.nextStation}: ${newEta} min`,
        'warning'
      );
      return { ...v, status: 'Delayed', speed: Math.max(10, Math.round(v.speed * 0.4)), eta: newEta };
    }));
  }, [addAlert]);

  const clearDelay = useCallback((vehicleId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const original = INITIAL_VEHICLES.find(iv => iv.id === vehicleId);
      addAlert(`${v.id} — ${v.name} has resumed normal service`, 'success');
      return { ...v, status: 'On Time', speed: original?.speed ?? 60 };
    }));
  }, [addAlert]);

  // Live simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if ((v.dwellRemaining ?? 0) > 0) {
          return { ...v, dwellRemaining: (v.dwellRemaining ?? 0) - TICK_MS };
        }

        const stationCount = getStationCount(v.routeId);
        const current = getStationAtIndex(v.routeId, v.routeIndex);
        let dir = v.direction;
        let nextIdx = v.routeIndex + dir;

        if (nextIdx < 0) { dir = 1; nextIdx = 1; }
        if (nextIdx >= stationCount) { dir = -1; nextIdx = stationCount - 2; }

        const nextStn = getStationAtIndex(v.routeId, nextIdx);
        const dist = haversine(current.lat, current.lng, nextStn.lat, nextStn.lng);
        const step = (v.speed / 3600) * (TICK_MS / 1000) / dist;
        const newProgress = v.progress + step;

        if (newProgress >= 1) {
          let newDir = dir;
          const afterIdx = nextIdx + newDir;
          if (afterIdx < 0 || afterIdx >= stationCount) newDir = -newDir as 1 | -1;
          const finalNextIdx = Math.max(0, Math.min(stationCount - 1, nextIdx + newDir));
          const finalNext = getStationAtIndex(v.routeId, finalNextIdx);

          return {
            ...v,
            direction: newDir as 1 | -1,
            routeIndex: nextIdx,
            progress: 0,
            lat: nextStn.lat,
            lng: nextStn.lng,
            currentStation: nextStn.name,
            nextStation: finalNext.name,
            nextStationId: finalNext.id,
            eta: calcEta(0, v.speed, nextStn, finalNext),
            dirLabel: getDirLabel(v.routeId, newDir as 1 | -1),
            dwellRemaining: DWELL_MS,
          };
        }

        const pos = lerp(current, nextStn, newProgress);
        return {
          ...v,
          direction: dir as 1 | -1,
          progress: newProgress,
          lat: pos.lat,
          lng: pos.lng,
          currentStation: current.name,
          nextStation: nextStn.name,
          nextStationId: nextStn.id,
          eta: calcEta(newProgress, v.speed, current, nextStn),
          dirLabel: getDirLabel(v.routeId, dir as 1 | -1),
        };
      }));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  return { vehicles, alerts, simulateDelay, clearDelay, dismissAlert, addAlert };
}

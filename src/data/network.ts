// PRASA Network Data — Stations, Routes, Vehicles

export interface Station {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  platforms: number;
  zone: string;
  routes: string[];
  type: 'train' | 'bus' | 'interchange';
}

export interface Route {
  id: string;
  vehicleType: 'train' | 'bus';
  name: string;
  shortName: string;
  color: string;
  colorDim: string;
  stations: string[];
  description: string;
  operator: string;
}

export interface Vehicle {
  id: string;
  name: string;
  routeId: string;
  vehicleType: 'train' | 'bus';
  routeIndex: number;
  progress: number;
  speed: number;
  status: 'On Time' | 'Delayed';
  direction: 1 | -1;
  passengerLoad: number;
  capacity: number;
  // computed
  lat?: number;
  lng?: number;
  currentStation?: string;
  nextStation?: string;
  nextStationId?: string;
  eta?: number;
  dirLabel?: string;
  dwellRemaining?: number;
  routeColor?: string;
}

export interface Alert {
  id: number;
  message: string;
  type: 'warning' | 'error' | 'info' | 'success';
  timestamp: Date;
}

// ─── Stations ────────────────────────────────────────────────
export const STATIONS: Record<string, Station> = {
  STN_PARK: { id: 'STN_PARK', name: 'Park Station', shortName: 'PARK', lat: -26.2041, lng: 28.0473, platforms: 8, zone: 'JHB CBD', routes: ['R1','R2','R3','B1','B2'], type: 'interchange' },
  STN_ROS:  { id: 'STN_ROS',  name: 'Rosebank',     shortName: 'RBNK', lat: -26.1452, lng: 28.0434, platforms: 2, zone: 'Northern Suburbs', routes: ['R1'], type: 'train' },
  STN_SAN:  { id: 'STN_SAN',  name: 'Sandton',      shortName: 'SNDT', lat: -26.1076, lng: 28.0567, platforms: 3, zone: 'Sandton', routes: ['R1'], type: 'train' },
  STN_MID:  { id: 'STN_MID',  name: 'Midrand',      shortName: 'MDRD', lat: -25.9992, lng: 28.1263, platforms: 2, zone: 'Midrand', routes: ['R1'], type: 'train' },
  STN_CEN:  { id: 'STN_CEN',  name: 'Centurion',    shortName: 'CNTV', lat: -25.8607, lng: 28.1892, platforms: 2, zone: 'Centurion', routes: ['R1'], type: 'train' },
  STN_PTA:  { id: 'STN_PTA',  name: 'Pretoria',     shortName: 'PRET', lat: -25.7479, lng: 28.2293, platforms: 6, zone: 'Pretoria CBD', routes: ['R1'], type: 'train' },
  STN_DOO:  { id: 'STN_DOO',  name: 'Doornfontein', shortName: 'DOOF', lat: -26.198,  lng: 28.068,  platforms: 2, zone: 'Inner East', routes: ['R2'], type: 'train' },
  STN_GER:  { id: 'STN_GER',  name: 'Germiston',    shortName: 'GERM', lat: -26.2167, lng: 28.1667, platforms: 4, zone: 'Germiston', routes: ['R2'], type: 'train' },
  STN_BOK:  { id: 'STN_BOK',  name: 'Boksburg',     shortName: 'BOKS', lat: -26.2134, lng: 28.2585, platforms: 2, zone: 'East Rand', routes: ['R2'], type: 'train' },
  STN_SPR:  { id: 'STN_SPR',  name: 'Springs',      shortName: 'SPRG', lat: -26.2539, lng: 28.4432, platforms: 3, zone: 'East Rand', routes: ['R2'], type: 'train' },
  STN_NCA:  { id: 'STN_NCA',  name: 'New Canada',   shortName: 'NCAN', lat: -26.2366, lng: 27.9877, platforms: 2, zone: 'West JHB', routes: ['R3'], type: 'train' },
  STN_KLP:  { id: 'STN_KLP',  name: 'Kliptown',     shortName: 'KLIP', lat: -26.2551, lng: 27.8889, platforms: 2, zone: 'Soweto', routes: ['R3'], type: 'train' },
  STN_NAL:  { id: 'STN_NAL',  name: 'Naledi',       shortName: 'NALD', lat: -26.278,  lng: 27.847,  platforms: 2, zone: 'Soweto', routes: ['R3'], type: 'train' },
  STN_LEN:  { id: 'STN_LEN',  name: 'Lenasia',      shortName: 'LENA', lat: -26.3061, lng: 27.835,  platforms: 2, zone: 'South JHB', routes: ['R3'], type: 'train' },
  BUS_PARK: { id: 'BUS_PARK', name: 'Park Stn Bus Term',  shortName: 'PKBS', lat: -26.2055, lng: 28.046,  platforms: 6, zone: 'JHB CBD', routes: ['B1'], type: 'bus' },
  BUS_DOO:  { id: 'BUS_DOO',  name: 'Doornfontein Depot', shortName: 'DFBS', lat: -26.199,  lng: 28.07,   platforms: 2, zone: 'Inner East', routes: ['B1'], type: 'bus' },
  BUS_GER:  { id: 'BUS_GER',  name: 'Germiston Terminal', shortName: 'GTBS', lat: -26.218,  lng: 28.165,  platforms: 3, zone: 'Germiston', routes: ['B1'], type: 'bus' },
  BUS_KMP:  { id: 'BUS_KMP',  name: 'Kempton Park',       shortName: 'KMBS', lat: -26.1,    lng: 28.2333, platforms: 2, zone: 'East Rand', routes: ['B1'], type: 'bus' },
  BUS_ORT:  { id: 'BUS_ORT',  name: 'OR Tambo Airport',   shortName: 'ORBS', lat: -26.1333, lng: 28.25,   platforms: 4, zone: 'OR Tambo', routes: ['B1'], type: 'bus' },
  BUS_CRW:  { id: 'BUS_CRW',  name: 'Crown Mines',        shortName: 'CWBS', lat: -26.23,   lng: 27.98,   platforms: 2, zone: 'West JHB', routes: ['B2'], type: 'bus' },
  BUS_SOW:  { id: 'BUS_SOW',  name: 'Soweto Maponya',     shortName: 'SWBS', lat: -26.2623, lng: 27.871,  platforms: 2, zone: 'Soweto', routes: ['B2'], type: 'bus' },
  BUS_LENA: { id: 'BUS_LENA', name: 'Lenasia Hub',         shortName: 'LNBS', lat: -26.3061, lng: 27.835,  platforms: 2, zone: 'South JHB', routes: ['B2'], type: 'bus' },
  BUS_ENN:  { id: 'BUS_ENN',  name: 'Ennerdale',           shortName: 'ENBS', lat: -26.35,   lng: 27.805,  platforms: 2, zone: 'South JHB', routes: ['B2'], type: 'bus' },
};

// ─── Routes ──────────────────────────────────────────────────
export const ROUTES: Record<string, Route> = {
  R1: { id: 'R1', vehicleType: 'train', name: 'Northern Line', shortName: 'NORTH', color: '#00A8E1', colorDim: 'rgba(0,168,225,0.16)', stations: ['STN_PARK','STN_ROS','STN_SAN','STN_MID','STN_CEN','STN_PTA'], description: 'Park Station → Pretoria via Sandton', operator: 'Metrorail' },
  R2: { id: 'R2', vehicleType: 'train', name: 'Eastern Line',  shortName: 'EAST',  color: '#0077B6', colorDim: 'rgba(0,119,182,0.16)',  stations: ['STN_PARK','STN_DOO','STN_GER','STN_BOK','STN_SPR'],      description: 'Park Station → Springs via Germiston', operator: 'Metrorail' },
  R3: { id: 'R3', vehicleType: 'train', name: 'Soweto Line',   shortName: 'SOWETO',color: '#00C896', colorDim: 'rgba(0,200,150,0.16)',  stations: ['STN_PARK','STN_NCA','STN_KLP','STN_NAL','STN_LEN'],      description: 'Park Station → Lenasia via Soweto', operator: 'Metrorail' },
  B1: { id: 'B1', vehicleType: 'bus',   name: 'City to City',  shortName: 'C2C',   color: '#FF8C00', colorDim: 'rgba(255,140,0,0.16)',   stations: ['BUS_PARK','BUS_DOO','BUS_GER','BUS_KMP','BUS_ORT'],      description: 'Park Station → OR Tambo via East Rand', operator: 'Autopax' },
  B2: { id: 'B2', vehicleType: 'bus',   name: 'Translux',      shortName: 'TLUX',  color: '#C0392B', colorDim: 'rgba(192,57,43,0.16)',   stations: ['STN_PARK','BUS_CRW','BUS_SOW','BUS_LENA','BUS_ENN'],     description: 'Park Station → Ennerdale via Soweto', operator: 'Autopax' },
};

// ─── Initial Vehicles ─────────────────────────────────────────
export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'PRASA_101', name: 'Metrorail 101', routeId: 'R1', vehicleType: 'train', routeIndex: 0, progress: 0,   speed: 65, status: 'On Time', direction: 1,  passengerLoad: 274, capacity: 400 },
  { id: 'PRASA_102', name: 'Metrorail 102', routeId: 'R1', vehicleType: 'train', routeIndex: 3, progress: 0.5, speed: 70, status: 'On Time', direction: -1, passengerLoad: 210, capacity: 400 },
  { id: 'PRASA_201', name: 'Metrorail 201', routeId: 'R2', vehicleType: 'train', routeIndex: 0, progress: 0.2, speed: 60, status: 'On Time', direction: 1,  passengerLoad: 195, capacity: 380 },
  { id: 'PRASA_202', name: 'Metrorail 202', routeId: 'R2', vehicleType: 'train', routeIndex: 2, progress: 0.7, speed: 68, status: 'On Time', direction: -1, passengerLoad: 350, capacity: 380 },
  { id: 'PRASA_301', name: 'Metrorail 301', routeId: 'R3', vehicleType: 'train', routeIndex: 0, progress: 0.4, speed: 55, status: 'On Time', direction: 1,  passengerLoad: 356, capacity: 380 },
  { id: 'PRASA_302', name: 'Metrorail 302', routeId: 'R3', vehicleType: 'train', routeIndex: 3, progress: 0.2, speed: 58, status: 'On Time', direction: -1, passengerLoad: 220, capacity: 380 },
  { id: 'AUTOPX_B11', name: 'City to City 11', routeId: 'B1', vehicleType: 'bus', routeIndex: 0, progress: 0.3, speed: 85, status: 'On Time', direction: 1,  passengerLoad: 42, capacity: 55 },
  { id: 'AUTOPX_B12', name: 'City to City 12', routeId: 'B1', vehicleType: 'bus', routeIndex: 2, progress: 0.6, speed: 80, status: 'On Time', direction: -1, passengerLoad: 38, capacity: 55 },
  { id: 'AUTOPX_T21', name: 'Translux 21',     routeId: 'B2', vehicleType: 'bus', routeIndex: 0, progress: 0.5, speed: 90, status: 'On Time', direction: 1,  passengerLoad: 48, capacity: 60 },
  { id: 'AUTOPX_T22', name: 'Translux 22',     routeId: 'B2', vehicleType: 'bus', routeIndex: 3, progress: 0.1, speed: 88, status: 'On Time', direction: -1, passengerLoad: 22, capacity: 60 },
];

// Shared constants and parameters for the Humanoid Ninja Robot
// Path: 2026/05/25/ninja-robot/lib/constants.js

const COLORS = {
  steel: '#dfe6e9',       // Light polished steel
  darkMetal: '#2d3436',   // Dark mechanical iron/steel
  chrome: '#b2bec3',      // Medium chrome plating
  eyes: '#00e5ff',        // Glowing cyan blue optics
  black: '#0f1115',       // Deep black for internal cavities
  darkBrushedMetal: '#5b6772',
  blackOxide: '#111820',
  panelGap: '#05080c',
  eyeGlass: '#58cfff',
  cableRubber: '#090b0f',
  fastenerDark: '#202a32',
  neckBearing: '#78838d',
  gold: '#d4af37',        // Polished mechanical gold
  brass: '#e5c158',       // Metallic brass accents
  teethSocket: '#0d0d0d', // Extra dark recess for teeth
};

// Robot Proportions (mm)
// Total target height is 2.0m (2000mm)
const DIMS = {
  head: {
    width: 160,
    height: 260,
    depth: 180,
    eyeLensDiameter: 40,
    eyeCenterSpacing: 90,
    neckBearingDiameter: 70,
    pitchAxisHeight: 80,
  },
  torso: {
    width: 480,
    height: 510,
    depth: 240,
    chestEmblemSize: 45,
  },
  pelvis: {
    width: 280,
    height: 180,
    depth: 220,
  },
  upperArm: {
    length: 380,
    radius: 55,
  },
  forearm: {
    length: 340,
    radius: 45,
  },
  hand: {
    length: 200,
    width: 140,
  },
  thigh: {
    length: 470,
    radius: 80,
  },
  shin: {
    length: 430,
    radius: 60,
  },
  foot: {
    length: 340,
    width: 150,
    height: 250,
  },
  sword: {
    bladeLength: 700,
    bladeWidth: 30,
    bladeThick: 6,
    handleLength: 220,
    guardRadius: 40,
  }
};

// Joint Limits (degrees)
const JOINTS = {
  neck: { yawMin: -60, yawMax: 60, pitchMin: -30, pitchMax: 45, rollMin: -35, rollMax: 35 },
  eyes: { yawMin: -18, yawMax: 18, pitchMin: -14, pitchMax: 14 },
  mandible: { pitchMin: 0, pitchMax: 38 },
  spine: { bendMin: -15, bendMax: 30 },
  shoulder: { yawMin: -90, yawMax: 90, pitchMin: -120, pitchMax: 180, rollMin: -20, rollMax: 120 },
  elbow: { pitchMin: 0, pitchMax: 140 },
  wrist: { yawMin: -45, yawMax: 45, rollMin: -45, rollMax: 45 },
  hip: { pitchMin: -30, pitchMax: 110, rollMin: -10, rollMax: 45 },
  knee: { pitchMin: 0, pitchMax: 130 },
  ankle: { pitchMin: -30, pitchMax: 30 },
};

const MATERIALS = {
  M_dark_brushed_metal: { metalness: 0.8, roughness: 0.3 },
  M_black_oxide: { metalness: 0.2, roughness: 0.8 },
  M_eye_blue_emissive: { emissive: COLORS.eyes, emissiveIntensity: 2.5 },
  M_eye_glass: { opacity: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.05 },
  M_cable_rubber: { metalness: 0.0, roughness: 0.9 },
  M_fastener_dark: { metalness: 0.5, roughness: 0.5 },
  M_neck_bearing: { metalness: 0.9, roughness: 0.2 }
};

module.exports = {
  COLORS,
  MATERIALS,
  DIMS,
  JOINTS,
};

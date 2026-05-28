// Neck turntable and pitch yoke for the robot head
// Path: 2026/05/25/ninja-robot/parts/neck.forge.js

const { COLORS, MATERIALS, DIMS } = require("../lib/constants.js");

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [180, -260, 110], target: [0, 0, 45], fov: 38 },
  environment: { preset: "studio", intensity: 0.3 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.2 },
    { type: "directional", position: [120, -150, 190], color: "#ffffff", intensity: 1.5, castShadow: true },
  ],
});

const neckDia = DIMS.head.neckBearingDiameter;
const pitchZ = DIMS.head.pitchAxisHeight;

function makeCableBundle() {
  const cables = [];
  
  // Inner ring: 8 cables at radius 14 (rubber)
  const innerRad = 14;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const x = Math.cos(angle) * innerRad;
    const y = Math.sin(angle) * innerRad;
    cables.push({
      name: `inner_cable_${i + 1}`,
      shape: cylinder(pitchZ - 46, 1.4, undefined, 12)
        .translate(x, y, 20)
        .color(COLORS.cableRubber),
    });
  }
  
  // Middle ring: 10 cables at radius 21 (alternating chrome and rubber)
  const midRad = 21;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const x = Math.cos(angle) * midRad;
    const y = Math.sin(angle) * midRad;
    const color = i % 2 === 0 ? COLORS.chrome : COLORS.cableRubber;
    cables.push({
      name: `mid_cable_${i + 1}`,
      shape: cylinder(pitchZ - 46, 1.6, undefined, 12)
        .translate(x, y, 20)
        .color(color),
    });
  }
  return cables;
}

function makeActuators() {
  const actuators = [];
  const radius = 29; // Outer ring (expanded from 28 to clear mid cables)
  
  // 4 Hydraulic cylinder bodies in gold + rods in chrome
  const angles = [45, 135, 225, 315];
  for (let i = 0; i < angles.length; i++) {
    const rad = (angles[i] * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    
    const body = cylinder(24, 3.5, undefined, 16)
      .translate(x, y, 10)
      .color(COLORS.gold);
    
    const rod = cylinder(26, 1.8, undefined, 12)
      .translate(x, y, 22)
      .color(COLORS.chrome);
      
    actuators.push({ name: `actuator_body_${i + 1}`, shape: body });
    actuators.push({ name: `actuator_rod_${i + 1}`, shape: rod });
  }

  // 4 Chrome structural guide shafts interspersed between actuators
  const guideAngles = [0, 90, 180, 270];
  for (let i = 0; i < guideAngles.length; i++) {
    const rad = (guideAngles[i] * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    
    const guide = cylinder(pitchZ - 32, 2.2, undefined, 12)
      .translate(x, y, 10)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal);
      
    actuators.push({ name: `guide_shaft_${i + 1}`, shape: guide });
  }
  return actuators;
}

function makeNeckTurntable() {
  const lowerBearing = torus(neckDia / 2, 4.2, 64)
    .translate(0, 0, 6)
    .color(COLORS.neckBearing)
    .material(MATERIALS.M_neck_bearing);

  const upperBearing = torus(neckDia / 2 - 2, 4, 64)
    .translate(0, 0, pitchZ - 30)
    .color(COLORS.neckBearing)
    .material(MATERIALS.M_neck_bearing);

  const rotatingColumn = cylinder(pitchZ - 42, 11, undefined, 40)
    .translate(0, 0, 18)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  // Spine-like vertebrae rings around the central column
  const spineFlange1 = torus(13.5, 2.2, 32)
    .rotateX(90)
    .translate(0, 0, 24)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const spineFlange2 = torus(13.5, 2.2, 32)
    .rotateX(90)
    .translate(0, 0, 36)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const yawDatumBand = cylinder(10, neckDia / 2 - 5, undefined, 48)
    .translate(0, 0, 8)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const leftPitchCheekBlank = box(14, 34, 42)
    .translate(-48, 0, pitchZ - 22);

  const leftPitchCheek = difference(leftPitchCheekBlank, [
    cylinder(20, 8.5, undefined, 32)
      .pointAlong([1, 0, 0])
      .translate(-58, 0, pitchZ),
  ]).color(COLORS.darkBrushedMetal)
    .material(MATERIALS.M_dark_brushed_metal);

  const rightPitchCheekBlank = box(14, 34, 42)
    .translate(48, 0, pitchZ - 22);

  const rightPitchCheek = difference(rightPitchCheekBlank, [
    cylinder(20, 8.5, undefined, 32)
      .pointAlong([1, 0, 0])
      .translate(38, 0, pitchZ),
  ]).color(COLORS.darkBrushedMetal)
    .material(MATERIALS.M_dark_brushed_metal);

  const pitchPin = cylinder(112, 7, undefined, 32)
    .pointAlong([1, 0, 0])
    .translate(-56, 0, pitchZ)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const leftRetainer = cylinder(4, 12, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-62, 0, pitchZ)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);

  const rightRetainer = cylinder(4, 12, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(58, 0, pitchZ)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);

  return group(
    { name: "yaw_bearing_lower_ring", shape: lowerBearing },
    { name: "yaw_datum_band", shape: yawDatumBand },
    { name: "rotating_cable_column", shape: rotatingColumn },
    { name: "spine_flange_1", shape: spineFlange1 },
    { name: "spine_flange_2", shape: spineFlange2 },
    ...makeCableBundle(),
    ...makeActuators(),
    { name: "yaw_bearing_upper_ring", shape: upperBearing },
    { name: "left_pitch_yoke_cheek", shape: leftPitchCheek },
    { name: "right_pitch_yoke_cheek", shape: rightPitchCheek },
    { name: "pitch_axis_pin", shape: pitchPin },
    { name: "left_pitch_pin_retainer", shape: leftRetainer },
    { name: "right_pitch_pin_retainer", shape: rightRetainer }
  ).withConnectors({
    yaw_axis: connector("neck-yaw", { origin: [0, 0, 0], axis: [0, 0, -1], kind: "revolute" }),
    pitch_axis: connector("neck-pitch", { origin: [0, 0, pitchZ], axis: [1, 0, 0], kind: "revolute" }),
  });
}

return makeNeckTurntable();

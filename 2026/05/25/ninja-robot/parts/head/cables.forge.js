// Cable Harness Bundles - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/cables.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

function item(name, shape) {
  return { name, shape };
}

function rubber(shape, color = COLORS.cableRubber, material = MATERIALS.M_cable_rubber) {
  return shape.color(color).material(material);
}

function distance(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function trimmedEnds(start, end, trim = 3) {
  const len = distance(start, end);
  if (len <= trim * 2.5) {
    return { start, end };
  }
  const unit = [
    (end[0] - start[0]) / len,
    (end[1] - start[1]) / len,
    (end[2] - start[2]) / len,
  ];
  return {
    start: [start[0] + unit[0] * trim, start[1] + unit[1] * trim, start[2] + unit[2] * trim],
    end: [end[0] - unit[0] * trim, end[1] - unit[1] * trim, end[2] - unit[2] * trim],
  };
}

function cableBetween(name, start, end, radius, color = COLORS.cableRubber, material = MATERIALS.M_cable_rubber) {
  const trimmed = trimmedEnds(start, end, radius + 1);
  const vector = [
    trimmed.end[0] - trimmed.start[0],
    trimmed.end[1] - trimmed.start[1],
    trimmed.end[2] - trimmed.start[2],
  ];
  return item(
    name,
    rubber(
      cylinder(distance(trimmed.start, trimmed.end), radius, undefined, 16)
        .pointAlong(vector)
        .translate(...trimmed.start),
      color,
      material
    )
  );
}

function clampRing(name, center, radius) {
  return item(
    name,
    box(radius * 3.0, 4, 6)
      .translate(center[0], center[1] - 9, center[2] - 1)
      .color(COLORS.brass)
      .material(MATERIALS.M_fastener_dark)
  );
}

function cablePolyline(prefix, points, radius, color = COLORS.cableRubber) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push(cableBetween(`${prefix}_${i + 1}`, points[i], points[i + 1], radius, color));
  }
  return segments;
}

function ribSleeve(name, center, width, height = 5) {
  return item(
    name,
    box(width, 4, height)
      .translate(center[0], center[1], center[2])
      .color(COLORS.fastenerDark)
      .material(MATERIALS.M_fastener_dark)
  );
}

function makeCableHarnesses() {
  // Cables route from various parts of the head down to the neck pass-through manifold area (Z = -30)
  // Adjusted slightly inwards and further down to [±15, -15, -32] to pass cleanly through the neck collar hole
  const neckEntryL = [15, -15, 0];
  const neckEntryR = [-15, -15, 0];
  
  // Separated neck entry coordinates for cranial and mandible cables to prevent merging collision
  const neckEntryCranial = [0, -58, 0];
  const neckEntryMandible = [0, -14, 0];

  // 1. Temple Module Data Cables (Left & Right)
  // Routed to mid-points (X = ±62, Y = -45, Z = 10) which are entirely outside and behind the jaw hinge mounts (X = ±55, Y = -20, Z = 10..40)
  // Re-routed through intermediate point [±15, -15, -15] to run vertically through the neck collar, preventing wall collisions.
  const templeL = [66, -42, 66];
  const templeR = [-66, -42, 66];
  const midL = [64, -62, 10];
  const midR = [-64, -62, 10];
  const neckTopL = [15, -15, 8];
  const neckTopR = [-15, -15, 8];

  const templeCableL_1 = cableBetween("temple_cable_l_1", templeL, midL, 3.2);
  const templeCableL_2 = cableBetween("temple_cable_l_2", midL, neckTopL, 3.2);
  const templeCableL_3 = cableBetween("temple_cable_l_3", neckTopL, neckEntryL, 3.2);
  
  const templeCableR_1 = cableBetween("temple_cable_r_1", templeR, midR, 3.2);
  const templeCableR_2 = cableBetween("temple_cable_r_2", midR, neckTopR, 3.2);
  const templeCableR_3 = cableBetween("temple_cable_r_3", neckTopR, neckEntryR, 3.2);

  const clampL = clampRing("clamp_side_l", midL, 3.2);
  const clampR = clampRing("clamp_side_r", midR, 3.2);

  // 2. Main Cranial Power/Data Cable (thick braided cable from rear head center)
  const cranialRear = [0, -82, 130];
  const cranialMid = [0, -72, 45];
  
  const cranialCable_1 = cableBetween("cranial_cable_1", cranialRear, cranialMid, 5.5);
  const cranialCable_2 = cableBetween("cranial_cable_2", cranialMid, neckEntryCranial, 5.5);

  const cranialClamp = clampRing("cranial_clamp", cranialMid, 5.5);

  // 3. Mandible Actuator Power Loop
  const mandibleRear = [0, -18, 5];
  const mandibleCable = cableBetween("mandible_cable", mandibleRear, neckEntryMandible, 3.8);

  // 4. Rear service harness density: separated power/data/fiber/cooling runs.
  const rearHarnessL = cablePolyline("rear_service_bundle_l", [
    [34, -90, 128],
    [44, -88, 88],
    [34, -72, 48],
    [22, -44, 12],
    [14, -20, 0],
  ], 3.8);
  const rearHarnessR = cablePolyline("rear_service_bundle_r", [
    [-34, -90, 128],
    [-44, -88, 88],
    [-34, -72, 48],
    [-22, -44, 12],
    [-14, -20, 0],
  ], 3.8);
  const rearFiberL = cablePolyline("rear_fiber_loop_l", [
    [52, -94, 116],
    [58, -96, 74],
    [82, -78, 34],
    [78, -50, 0],
  ], 2.4, COLORS.black);
  const rearFiberR = cablePolyline("rear_fiber_loop_r", [
    [-52, -94, 116],
    [-58, -96, 74],
    [-82, -78, 34],
    [-78, -50, 0],
  ], 2.4, COLORS.black);

  const serviceClamps = [
    ribSleeve("rear_clamp_upper_l", [38, -80, 88], 16),
    ribSleeve("rear_clamp_upper_r", [-38, -80, 88], 16),
    ribSleeve("rear_clamp_lower_l", [22, -56, 36], 14),
    ribSleeve("rear_clamp_lower_r", [-22, -56, 36], 14),
    ribSleeve("neck_manifold_clamp_l", [48, -22, -8], 12, 4),
    ribSleeve("neck_manifold_clamp_r", [-48, -22, -8], 12, 4),
  ];

  return group(
    templeCableL_1,
    templeCableL_2,
    templeCableL_3,
    templeCableR_1,
    templeCableR_2,
    templeCableR_3,
    cranialCable_1,
    cranialCable_2,
    mandibleCable,
    ...rearHarnessL,
    ...rearHarnessR,
    ...rearFiberL,
    ...rearFiberR,
    clampL,
    clampR,
    cranialClamp,
    ...serviceClamps
  ).translate(0, 0, HEAD_BASE_Z);
}

const cableHarnesses = makeCableHarnesses();
return cableHarnesses;

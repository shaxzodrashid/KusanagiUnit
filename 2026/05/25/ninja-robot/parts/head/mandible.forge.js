// Active Mandible Assembly - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/mandible.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_black_oxide) {
  return shape.color(color).material(material);
}

function makeMandible() {
  const pivotY = -20;
  const pivotZ = 10;

  // Hinge bracket connectors on the left and right sides (shifted inward and radius reduced to clear mounts and cross beam)
  const hingeEarL = metal(
    cylinder(6, 8, undefined, 24).pointAlong([-1, 0, 0]).translate(48, pivotY, pivotZ),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );
  
  const hingeEarR = metal(
    cylinder(6, 8, undefined, 24).pointAlong([1, 0, 0]).translate(-48, pivotY, pivotZ),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  // Structural side arms running from the hinge pivots to the chin
  const sideArmL = metal(
    box(8, 65, 12).rotateX(22).translate(44, 16, -4),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );
  
  const sideArmR = metal(
    box(8, 65, 12).rotateX(22).translate(-44, 16, -4),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  // Lower jaw chin guard plate with integrated heat-sink fins (ID 006)
  // Unioned to prevent print check self-collisions
  const finsUnion = [];
  const heatSinkFins = [];
  const finCount = 10;
  for (let i = 0; i < finCount; i++) {
    const x = -30 + i * 6.6;
    const fin = metal(
      box(2.6, 10, 18).translate(x, 71, -4),
      COLORS.steel,
      MATERIALS.M_black_oxide
    );
    finsUnion.push(
      fin
    );
    heatSinkFins.push(
      item(`heat_sink_fin_${i}`, fin)
    );
  }

  const lowerBridge = metal(
    box(66, 10, 14).rotateX(-10).translate(0, 54, -8),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );
  const leftCheekPlate = metal(
    box(16, 10, 30).rotateX(-12).rotateY(-12).translate(51, 58, -12),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );
  const rightCheekPlate = metal(
    box(16, 10, 30).rotateX(-12).rotateY(12).translate(-51, 58, -12),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );
  const chinNose = metal(
    box(36, 8, 14).rotateX(-16).translate(0, 70, -20),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );

  // Active speaker acoustic grille inside the jaw cavity
  const speakerGrille = metal(
    cylinder(4, 28, undefined, 24).pointAlong([0, 1, 0]).translate(0, 43, -6),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  return group(
    item("hinge_ear_l", hingeEarL),
    item("hinge_ear_r", hingeEarR),
    item("side_arm_l", sideArmL),
    item("side_arm_r", sideArmR),
    item("lower_bridge", lowerBridge),
    item("cheek_plate_l", leftCheekPlate),
    item("cheek_plate_r", rightCheekPlate),
    item("chin_nose", chinNose),
    ...heatSinkFins,
    item("speaker_grille", speakerGrille)
  ).withConnectors({
    pitch_axis: connector("jaw-pitch", { origin: [0, pivotY, pivotZ], axis: [-1, 0, 0], kind: "revolute" }),
  }).translate(0, 0, HEAD_BASE_Z);
}

const mandible = makeMandible();
return mandible;

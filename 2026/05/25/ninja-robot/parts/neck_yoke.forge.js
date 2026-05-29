// Neck Yoke module for the professional mechanical/anatomical endoskeleton
// Path: 2026/05/25/ninja-robot/parts/neck_yoke.forge.js

const { COLORS, MATERIALS } = require("../lib/constants.js");

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_neck_bearing) {
  return shape.color(color).material(material);
}

function makeNeckYoke() {
  const pitchAxisLength = 50;
  const rollAxisLength = 35;
  const heightOffset = 15;

  // Central structural yoke block
  const centralBlock = metal(
    box(24, 24, heightOffset).translate(0, 0, heightOffset / 2),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Pitch axle cylinder along X-axis
  const pitchAxle = metal(
    cylinder(pitchAxisLength, 6, undefined, 24).pointAlong([1, 0, 0]),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  // Roll axle cylinder along Y-axis
  const rollAxle = metal(
    cylinder(rollAxisLength, 6, undefined, 24).pointAlong([0, 1, 0]).translate(0, 0, heightOffset),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  // Side support ears/ribs for structural integrity
  const earL = metal(
    box(6, 16, heightOffset).translate(pitchAxisLength / 2 - 3, 0, heightOffset / 2),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );
  const earR = metal(
    box(6, 16, heightOffset).translate(-pitchAxisLength / 2 + 3, 0, heightOffset / 2),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  const yoke = group(
    item("central_block", centralBlock),
    item("pitch_axle", pitchAxle),
    item("roll_axle", rollAxle),
    item("support_ear_l", earL),
    item("support_ear_r", earR)
  ).withConnectors({
    pitch_axis: connector("neck-pitch", { origin: [0, 0, 0], axis: [-1, 0, 0], kind: "revolute" }),
    roll_axis: connector("neck-roll", { origin: [0, 0, heightOffset], axis: [0, 1, 0], kind: "revolute" }),
  });

  return yoke;
}

const neckYoke = makeNeckYoke();
return neckYoke;

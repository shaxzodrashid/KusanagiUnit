// Neck Turntable module for the professional mechanical/anatomical endoskeleton
// Path: 2026/05/25/ninja-robot/parts/neck.forge.js

const { COLORS, MATERIALS, DIMS } = require("../lib/constants.js");

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_neck_bearing) {
  return shape.color(color).material(material);
}

function makeNeck() {
  const outerRadius = 85 / 2; // 42.5 mm
  const innerRadius = 70 / 2; // 35 mm
  const height = 15;

  // Base turntable ring
  const baseRing = metal(
    difference(
      cylinder(height, outerRadius, undefined, 48),
      [
        cylinder(height + 2, innerRadius, undefined, 48).translate(0, 0, -1)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_neck_bearing
  );

  // Outer race/bearing details (vibrant and premium)
  const bearingRing = metal(
    torus(outerRadius - 2, 2.5, 36).translate(0, 0, height / 2),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  // Flange bolt patterns (industrial and functional)
  const bolts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const r = (outerRadius + innerRadius) / 2;
    bolts.push(
      item(
        `flange_bolt_${i}`,
        metal(
          cylinder(4, 2.5, undefined, 12).translate(Math.cos(angle) * r, Math.sin(angle) * r, height - 2),
          COLORS.fastenerDark,
          MATERIALS.M_fastener_dark
        )
      )
    );
  }

  // Combine components into a structural turntable
  const turntable = group(
    item("base_ring", baseRing),
    item("bearing_ring", bearingRing),
    ...bolts
  ).withConnectors({
    yaw_axis: connector("neck-yaw", { origin: [0, 0, 0], axis: [0, 0, 1], kind: "revolute" }),
    pitch_axis: connector("neck-pitch", { origin: [0, 0, height], axis: [1, 0, 0], kind: "revolute" }),
  });

  return turntable;
}

const neck = makeNeck();
return neck;

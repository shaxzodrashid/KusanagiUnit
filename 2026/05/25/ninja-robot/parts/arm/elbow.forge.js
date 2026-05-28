// Elbow module for the professional mechanical/anatomical endoskeleton arm

const { COLORS, MATERIALS, DIMS, JOINTS } = require("../../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;
const upperLen = DIMS.upperArm.length;
const forearmLen = DIMS.forearm.length;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_dark_brushed_metal) {
  return shape.color(color).material(material);
}

function distance(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function rodBetween(name, start, end, radius, color = COLORS.chrome, material = MATERIALS.M_dark_brushed_metal, segments = 18) {
  const vector = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
  return item(
    name,
    metal(cylinder(distance(start, end), radius, undefined, segments).pointAlong(vector).translate(...start), color, material)
  );
}

function hingeEar(name, y, z, radius, thickness, x = 0) {
  return item(
    name,
    metal(
      cylinder(thickness, radius, undefined, 28).pointAlong([0, 1, 0]).translate(x, y, z),
      COLORS.chrome,
      MATERIALS.M_neck_bearing
    )
  );
}

function yAxisPin(name, x, y, z, length, radius, color = COLORS.fastenerDark) {
  return item(
    name,
    metal(
      cylinder(length, radius, undefined, 20).pointAlong([0, 1, 0]).translate(x, y - length / 2, z),
      color,
      MATERIALS.M_fastener_dark
    )
  );
}

function makeForearm() {
  const elbowTongue = metal(cylinder(30, 22, undefined, 28).pointAlong([0, 1, 0]).translate(0, -15, 0), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const proximalBridge = metal(box(48, 26, 38).translate(0, 0, -32), COLORS.chrome);
  const pronationRing = metal(torus(27, 2.2, 30).rotateX(90).translate(0, 0, -58), COLORS.brass);

  const radiusPathTop = sideSign * 18;
  const radiusPathBottom = sideSign * -13;
  const ulnaPathTop = sideSign * -16;
  const ulnaPathBottom = sideSign * 12;
  const bones = [
    rodBetween("radius_rotating_bone", [radiusPathTop, 7, -64], [radiusPathBottom, 10, -forearmLen + 64], 9.2, COLORS.chrome, MATERIALS.M_neck_bearing, 28),
    rodBetween("ulna_stability_bone", [ulnaPathTop, -6, -58], [ulnaPathBottom, -7, -forearmLen + 52], 11.2, COLORS.chrome, MATERIALS.M_neck_bearing, 28),
    rodBetween("interosseous_front_lattice_a", [-20, 15, -112], [20, 15, -forearmLen + 96], 2.2, COLORS.darkBrushedMetal, MATERIALS.M_dark_brushed_metal, 12),
    rodBetween("interosseous_front_lattice_b", [20, 15, -112], [-20, 15, -forearmLen + 96], 2.2, COLORS.darkBrushedMetal, MATERIALS.M_dark_brushed_metal, 12),
    rodBetween("posterior_tendon_guard", [0, -19, -82], [0, -17, -forearmLen + 80], 3.4, COLORS.cableRubber, MATERIALS.M_cable_rubber, 12),
  ];

  const bands = [
    item("proximal_forearm_band", metal(box(52, 28, 16).translate(0, 0, -96), COLORS.darkMetal, MATERIALS.M_black_oxide)),
    item("mid_forearm_band", metal(box(46, 24, 14).translate(0, 0, -forearmLen / 2), COLORS.darkMetal, MATERIALS.M_black_oxide)),
    item("distal_forearm_band", metal(box(40, 22, 16).translate(0, 0, -forearmLen + 74), COLORS.darkMetal, MATERIALS.M_black_oxide)),
  ];

  const forearmActuators = [
    rodBetween("wrist_extensor_micro_actuator", [24, 20, -100], [16, 18, -forearmLen + 72], 4.0, COLORS.gold, MATERIALS.M_dark_brushed_metal, 16),
    rodBetween("wrist_flexor_micro_actuator", [-24, -20, -100], [-16, -18, -forearmLen + 72], 4.0, COLORS.gold, MATERIALS.M_dark_brushed_metal, 16),
    rodBetween("nerve_bundle_main", [0, 4, -76], [0, 5, -forearmLen + 48], 1.8, COLORS.cableRubber, MATERIALS.M_cable_rubber, 12),
  ];

  const wristFork = [
    hingeEar("wrist_pitch_ear_front", 17, -forearmLen + 40, 17, 7),
    hingeEar("wrist_pitch_ear_back", -24, -forearmLen + 40, 17, 7),
    yAxisPin("wrist_pitch_pin", 0, -3, -forearmLen + 40, 48, 4.2),
  ];

  return group(
    item("elbow_tongue", elbowTongue),
    item("proximal_bridge", proximalBridge),
    item("pronation_service_ring", pronationRing),
    ...bones,
    ...bands,
    ...forearmActuators,
    ...wristFork
  ).withConnectors({
    elbow_axis: connector("elbow-pitch", { origin: [0, 0, 0], axis: [0, -1, 0], kind: "revolute" }),
    wrist_pitch_axis: connector("wrist-pitch", { origin: [0, 0, -forearmLen + 40], axis: [0, 1, 0], kind: "revolute" }),
  });
}

const controls = {
  joints: [
    {
      name: "elbowPitch",
      parent: "Upper Arm",
      child: "Forearm",
      parentConnector: "Upper Arm.elbow_axis",
      childConnector: "Forearm.elbow_axis",
      min: JOINTS.elbow.pitchMin,
      max: JOINTS.elbow.pitchMax,
      defaultValue: 0,
    },
  ],
};

return {
  forearm: makeForearm(),
  controls,
  metadata: {
    forearm: { material: "radius/ulna paired rails, wrist actuators, cable harnesses", process: "pronation-aware mechanical forearm" },
  },
};

// Shoulder module for the professional mechanical/anatomical endoskeleton arm

const { COLORS, MATERIALS, DIMS, JOINTS } = require("../../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;
const upperLen = DIMS.upperArm.length;

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

function makeShoulderHub() {
  const torsoStem = metal(
    cylinder(32, 20, undefined, 32).pointAlong([sideSign, 0, 0]).translate(sideSign * 8, 0, -2),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  const scapulaPlate = metal(box(12, 66, 72).translate(sideSign * 2, 0, -16), COLORS.darkBrushedMetal);
  const shoulderSocket = metal(cylinder(24, 34, undefined, 36).translate(0, 0, -24), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const mainBearing = metal(cylinder(30, 19, undefined, 32).translate(0, 0, -27), COLORS.chrome, MATERIALS.M_neck_bearing);
  const serviceRing = metal(torus(32, 2.6, 36).rotateX(90).translate(0, 0, -10), COLORS.gold);

  const deltoidArmor = [
    item("deltoid_outer_cap", metal(sphere(30).scale(1.1, 0.86, 0.48).translate(sideSign * 19, 0, -42), COLORS.darkMetal, MATERIALS.M_black_oxide)),
    item("deltoid_front_strake", metal(box(12, 8, 62).rotateX(-18).translate(sideSign * 20, 32, -46), COLORS.steel)),
    item("deltoid_rear_strake", metal(box(12, 8, 62).rotateX(18).translate(sideSign * 20, -32, -46), COLORS.steel)),
  ];

  const screws = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    screws.push(
      item(
        `socket_fastener_${i}`,
        metal(
          cylinder(6, i % 2 === 0 ? 2.4 : 1.9, undefined, 12)
            .pointAlong([sideSign, 0, 0])
            .translate(sideSign * 8, Math.cos(angle) * 29, -12 + Math.sin(angle) * 29),
          COLORS.fastenerDark,
          MATERIALS.M_fastener_dark
        )
      )
    );
  }

  return group(
    item("torso_stem", torsoStem),
    item("scapula_mount_plate", scapulaPlate),
    item("shoulder_socket", shoulderSocket),
    item("main_bearing", mainBearing),
    item("service_ring", serviceRing),
    ...deltoidArmor,
    ...screws
  ).withConnectors({
    yaw_axis: connector("shoulder-yaw", { origin: [0, 0, 0], axis: [0, 0, sideSign], kind: "revolute" }),
  });
}

function makeShoulderYawJoint() {
  const yawShaft = metal(cylinder(28, 13, undefined, 32).translate(0, 0, -24), COLORS.chrome, MATERIALS.M_neck_bearing);
  const preloadCollar = metal(cylinder(8, 24, undefined, 32).translate(0, 0, -30), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const lowerCollar = metal(cylinder(8, 19, undefined, 32).translate(0, 0, -52), COLORS.darkBrushedMetal);

  const rollCradle = [
    item("roll_cradle_left_web", metal(box(8, 34, 40).translate(-20, 0, -50), COLORS.steel)),
    item("roll_cradle_right_web", metal(box(8, 34, 40).translate(20, 0, -50), COLORS.steel)),
    item("roll_cradle_front_tie", metal(box(42, 7, 12).translate(0, 20, -52), COLORS.darkMetal, MATERIALS.M_black_oxide)),
    item("roll_cradle_rear_tie", metal(box(42, 7, 12).translate(0, -20, -52), COLORS.darkMetal, MATERIALS.M_black_oxide)),
    item("roll_outer_bearing_l", metal(cylinder(8, 15, undefined, 28).pointAlong([1, 0, 0]).translate(-24, 0, -52), COLORS.chrome, MATERIALS.M_neck_bearing)),
    item("roll_outer_bearing_r", metal(cylinder(8, 15, undefined, 28).pointAlong([1, 0, 0]).translate(16, 0, -52), COLORS.chrome, MATERIALS.M_neck_bearing)),
  ];

  return group(item("yaw_shaft", yawShaft), item("preload_collar", preloadCollar), item("lower_collar", lowerCollar), ...rollCradle)
    .withConnectors({
      yaw_axis: connector("shoulder-yaw", { origin: [0, 0, 0], axis: [0, 0, -sideSign], kind: "revolute" }),
      pitch_axis: connector("shoulder-pitch", { origin: [0, 0, -52], axis: [1, 0, 0], kind: "revolute" }),
    });
}

function makeShoulderRollJoint() {
  const rollAxle = metal(cylinder(52, 5.2, undefined, 24).pointAlong([1, 0, 0]).translate(-26, 0, 0), COLORS.fastenerDark, MATERIALS.M_fastener_dark);
  const rollDrum = metal(cylinder(26, 12, undefined, 28).pointAlong([1, 0, 0]).translate(-13, 0, 0), COLORS.chrome, MATERIALS.M_neck_bearing);
  const pitchBlock = metal(box(24, 30, 24).translate(0, 0, -16), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const pitchAxis = metal(cylinder(48, 4.8, undefined, 24).pointAlong([0, 1, 0]).translate(0, -24, -26), COLORS.fastenerDark, MATERIALS.M_fastener_dark);

  return group(
    item("roll_axle", rollAxle),
    item("roll_drum", rollDrum),
    item("pitch_block", pitchBlock),
    item("pitch_axis", pitchAxis),
    hingeEar("pitch_ear_front", 19, -26, 16, 7),
    hingeEar("pitch_ear_back", -26, -26, 16, 7),
    item("roll_index_ring", metal(torus(14, 1.8, 24).rotateX(90).translate(0, 0, -4), COLORS.brass))
  ).withConnectors({
    pitch_axis: connector("shoulder-pitch", { origin: [0, 0, 0], axis: [-1, 0, 0], kind: "revolute" }),
    roll_axis: connector("shoulder-roll", { origin: [0, 0, -26], axis: [0, -sideSign, 0], kind: "revolute" }),
  });
}

function makeActuatorSet(prefix, y, upperZ, lowerZ, color) {
  return [
    rodBetween(`${prefix}_upper_clevis`, [-13, y, upperZ], [13, y, upperZ], 5.4, COLORS.fastenerDark, MATERIALS.M_fastener_dark, 16),
    item(`${prefix}_servo_body`, metal(cylinder(112, 10.5, undefined, 24).translate(0, y, upperZ - 124), color)),
    item(`${prefix}_rod`, metal(cylinder(118, 4.8, undefined, 20).translate(0, y, lowerZ), COLORS.chrome, MATERIALS.M_neck_bearing)),
    rodBetween(`${prefix}_lower_clevis`, [-13, y, lowerZ - 8], [13, y, lowerZ - 8], 4.4, COLORS.fastenerDark, MATERIALS.M_fastener_dark, 16),
  ];
}

function makeUpperArm() {
  const shoulderTongue = metal(cylinder(30, 21, undefined, 28).pointAlong([0, 1, 0]).translate(0, -15, -26), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const proximalClamp = metal(box(50, 28, 44).translate(0, 0, -64), COLORS.chrome);
  const deltoidAnchor = metal(cylinder(14, 18, undefined, 24).pointAlong([1, 0, 0]).translate(-7, 0, -78), COLORS.darkMetal, MATERIALS.M_black_oxide);

  const humerus = [
    rodBetween("humerus_medial_tube", [-14, 0, -80], [-10, 0, -upperLen + 58], 10.5, COLORS.chrome, MATERIALS.M_neck_bearing, 28),
    rodBetween("humerus_lateral_tube", [14, 0, -80], [10, 0, -upperLen + 58], 10.5, COLORS.chrome, MATERIALS.M_neck_bearing, 28),
    rodBetween("humerus_anterior_spine", [0, 14, -92], [0, 10, -upperLen + 68], 5.2, COLORS.darkBrushedMetal, MATERIALS.M_dark_brushed_metal, 18),
    rodBetween("humerus_posterior_spine", [0, -14, -92], [0, -10, -upperLen + 68], 5.2, COLORS.darkBrushedMetal, MATERIALS.M_dark_brushed_metal, 18),
  ];

  const ribZ = [-120, -174, -228, -282];
  const ribs = [];
  for (let i = 0; i < ribZ.length; i++) {
    ribs.push(item(`humerus_oval_rib_${i}`, metal(torus(22 - i * 1.2, 2.0, 28).scale(1, 0.68, 1).rotateX(90).translate(0, 0, ribZ[i]), COLORS.steel)));
  }

  const actuators = [
    ...makeActuatorSet("biceps_linear_actuator", 31, -76, -upperLen + 92, COLORS.gold),
    ...makeActuatorSet("triceps_linear_actuator", -31, -86, -upperLen + 82, COLORS.darkMetal),
    rodBetween("deltoid_lift_link_front", [20, 26, -78], [13, 28, -upperLen + 118], 3.8, COLORS.brass, MATERIALS.M_dark_brushed_metal, 14),
    rodBetween("deltoid_lift_link_rear", [-20, -26, -78], [-13, -28, -upperLen + 118], 3.8, COLORS.brass, MATERIALS.M_dark_brushed_metal, 14),
  ];

  const cableRuns = [
    rodBetween("median_signal_harness", [-20, -6, -100], [-18, -8, -upperLen + 80], 1.8, COLORS.cableRubber, MATERIALS.M_cable_rubber, 12),
    rodBetween("radial_hydraulic_line", [20, 8, -112], [18, 10, -upperLen + 82], 2.0, COLORS.brass, MATERIALS.M_dark_brushed_metal, 12),
    rodBetween("ulnar_return_line", [0, -20, -118], [0, -18, -upperLen + 86], 1.7, COLORS.cableRubber, MATERIALS.M_cable_rubber, 12),
  ];

  const elbow = [
    item("distal_humerus_block", metal(box(50, 28, 48).translate(0, 0, -upperLen + 32), COLORS.chrome)),
    item("elbow_condyle_medial", metal(sphere(18).scale(0.95, 0.9, 0.65).translate(-18, 0, -upperLen), COLORS.chrome, MATERIALS.M_neck_bearing)),
    item("elbow_condyle_lateral", metal(sphere(18).scale(0.95, 0.9, 0.65).translate(18, 0, -upperLen), COLORS.chrome, MATERIALS.M_neck_bearing)),
    hingeEar("elbow_ear_front", 24, -upperLen, 27, 8),
    hingeEar("elbow_ear_back", -32, -upperLen, 27, 8),
    yAxisPin("elbow_hinge_pin", 0, 0, -upperLen, 64, 4.8),
  ];

  return group(
    item("shoulder_tongue", shoulderTongue),
    item("proximal_humerus_clamp", proximalClamp),
    item("deltoid_anchor", deltoidAnchor),
    ...humerus,
    ...ribs,
    ...actuators,
    ...cableRuns,
    ...elbow
  ).withConnectors({
    shoulder_roll_axis: connector("shoulder-roll", { origin: [0, 0, 0], axis: [0, sideSign, 0], kind: "revolute" }),
    elbow_axis: connector("elbow-pitch", { origin: [0, 0, -upperLen], axis: [0, sideSign, 0], kind: "revolute" }),
  });
}

const controls = {
  joints: [
    {
      name: "shoulderYaw",
      parent: "Shoulder Hub",
      child: "Shoulder Yaw Joint",
      parentConnector: "Shoulder Hub.yaw_axis",
      childConnector: "Shoulder Yaw Joint.yaw_axis",
      min: JOINTS.shoulder.yawMin,
      max: JOINTS.shoulder.yawMax,
      defaultValue: 0,
    },
    {
      name: "shoulderPitch",
      parent: "Shoulder Yaw Joint",
      child: "Shoulder Roll Joint",
      parentConnector: "Shoulder Yaw Joint.pitch_axis",
      childConnector: "Shoulder Roll Joint.pitch_axis",
      min: JOINTS.shoulder.pitchMin,
      max: JOINTS.shoulder.pitchMax,
      defaultValue: 0,
    },
    {
      name: "shoulderRoll",
      parent: "Shoulder Roll Joint",
      child: "Upper Arm",
      parentConnector: "Shoulder Roll Joint.roll_axis",
      childConnector: "Upper Arm.shoulder_roll_axis",
      min: JOINTS.shoulder.rollMin,
      max: JOINTS.shoulder.rollMax,
      defaultValue: 0,
    },
  ],
};

return {
  hub: makeShoulderHub(),
  yawJoint: makeShoulderYawJoint(),
  rollJoint: makeShoulderRollJoint(),
  upperArm: makeUpperArm(),
  controls,
  metadata: {
    hub: { material: "chrome-plated carbon steel, bearings, black-oxide alloy links", process: "professional shoulder module" },
    upperArm: { material: "dual humerus rails, hydraulic actuators, routed tendons", process: "anatomically informed robotic linkage" },
  },
};

// Wrist module for the professional mechanical/anatomical endoskeleton arm

const { COLORS, MATERIALS, DIMS, JOINTS } = require("../../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;
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

function xAxisPin(name, x, y, z, length, radius, color = COLORS.fastenerDark) {
  return item(
    name,
    metal(
      cylinder(length, radius, undefined, 20).pointAlong([1, 0, 0]).translate(x - length / 2, y, z),
      color,
      MATERIALS.M_fastener_dark
    )
  );
}

function makeWristHub() {
  const pitchTongue = metal(cylinder(28, 12, undefined, 28).pointAlong([0, 1, 0]).translate(0, -14, 0), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const carpalCuff = metal(cylinder(26, 23, undefined, 30).translate(0, 0, -27), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const bearingSleeve = metal(cylinder(32, 12.5, undefined, 28).translate(0, 0, -31), COLORS.chrome, MATERIALS.M_neck_bearing);
  const yawTurntable = metal(torus(24, 2.2, 30).rotateX(90).translate(0, 0, -16), COLORS.brass);
  const cablePass = metal(cylinder(38, 4.0, undefined, 16).translate(0, 0, -44), COLORS.cableRubber, MATERIALS.M_cable_rubber);

  return group(
    item("pitch_tongue", pitchTongue),
    item("carpal_cuff", carpalCuff),
    item("bearing_sleeve", bearingSleeve),
    item("yaw_turntable", yawTurntable),
    item("central_cable_pass", cablePass)
  ).withConnectors({
    wrist_yaw_axis: connector("wrist-yaw", { origin: [0, 0, 0], axis: [0, -sideSign, 0], kind: "revolute" }),
    wrist_roll_axis: connector("wrist-roll", { origin: [0, 0, -44], axis: [0, 0, sideSign], kind: "revolute" }),
  });
}

function fingerSegment(name, x, y, z, length, radius, curl, color = COLORS.chrome) {
  return item(
    name,
    metal(
      cylinder(length, radius, radius * 0.72, 16)
        .rotateX(curl)
        .translate(x, y, z),
      color
    )
  );
}

function makeFinger(index, x, baseY, metacarpalZ, lengths, radii, curlOffset = 0) {
  const spread = (index - 1.5) * 2.5;
  const y = baseY + Math.abs(index - 1.5) * 1.5;
  const z1 = metacarpalZ - lengths[0] * 0.45;
  const z2 = z1 - lengths[1] * 0.74;
  const z3 = z2 - lengths[2] * 0.74;

  return [
    xAxisPin(`finger_${index}_mcp_pin`, x - 5, y, metacarpalZ, 10, 2.4),
    item(`finger_${index}_mcp_joint`, metal(sphere(radii[0] + 1.4).scale(1, 0.85, 0.9).translate(x, y, metacarpalZ), COLORS.gold)),
    fingerSegment(`finger_${index}_proximal_phalanx`, x + spread * 0.2, y + 4, z1, lengths[0], radii[0], -8 - curlOffset),
    item(`finger_${index}_pip_joint`, metal(sphere(radii[1] + 1.2).translate(x + spread * 0.45, y + 8, z1 - lengths[0] * 0.48), COLORS.steel)),
    xAxisPin(`finger_${index}_pip_pin`, x - 4 + spread * 0.45, y + 8, z1 - lengths[0] * 0.48, 8, 1.8),
    fingerSegment(`finger_${index}_intermediate_phalanx`, x + spread * 0.55, y + 10, z2, lengths[1], radii[1], -16 - curlOffset),
    item(`finger_${index}_dip_joint`, metal(sphere(radii[2] + 1.0).translate(x + spread * 0.72, y + 13, z2 - lengths[1] * 0.48), COLORS.steel)),
    fingerSegment(`finger_${index}_distal_phalanx`, x + spread * 0.9, y + 15, z3, lengths[2], radii[2], -24 - curlOffset, COLORS.steel),
    rodBetween(`finger_${index}_flexor_tendon`, [x, baseY - 4, metacarpalZ - 6], [x + spread * 0.9, y + 18, z3 - 8], 0.9, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
  ];
}

function makeHand() {
  const wristStem = metal(cylinder(32, 11.5, undefined, 24).translate(0, 0, -16), COLORS.chrome, MATERIALS.M_neck_bearing);
  const palmCarpals = metal(box(72, 24, 34).translate(0, 0, -56), COLORS.darkMetal, MATERIALS.M_black_oxide);
  const palmArch = metal(box(82, 18, 54).translate(0, 5, -90), COLORS.darkBrushedMetal);
  const dorsalPlate = metal(box(76, 7, 88).rotateX(-8).translate(0, -11, -88), COLORS.darkMetal, MATERIALS.M_black_oxide);

  const metacarpals = [];
  const fingerX = [-34, -11, 12, 34];
  const fingerLengths = [
    [[38, 28, 22], [4.8, 3.7, 2.9]],
    [[48, 34, 25], [5.3, 4.0, 3.1]],
    [[45, 32, 24], [5.1, 3.9, 3.0]],
    [[34, 25, 20], [4.5, 3.4, 2.7]],
  ];

  for (let i = 0; i < 4; i++) {
    metacarpals.push(
      rodBetween(`metacarpal_${i}`, [fingerX[i] * 0.72, 4, -72], [fingerX[i] + (i - 1.5) * 1.6, 8, -126], 3.8, COLORS.chrome, MATERIALS.M_neck_bearing, 16),
      ...makeFinger(i, fingerX[i], 10, -128, fingerLengths[i][0], fingerLengths[i][1], i === 0 || i === 3 ? 3 : 0)
    );
  }

  const thumbBaseX = sideSign * 48;
  const thumb = [
    item("thumb_saddle_socket", metal(sphere(8.4).scale(1.1, 0.9, 0.8).translate(thumbBaseX, 1, -92), COLORS.gold)),
    rodBetween("thumb_metacarpal", [thumbBaseX, 2, -94], [sideSign * 62, 10, -130], 4.8, COLORS.chrome, MATERIALS.M_neck_bearing, 16),
    item("thumb_mcp_joint", metal(sphere(6.0).translate(sideSign * 63, 11, -134), COLORS.steel)),
    rodBetween("thumb_proximal_phalanx", [sideSign * 63, 11, -134], [sideSign * 74, 21, -164], 4.0, COLORS.chrome, MATERIALS.M_dark_brushed_metal, 16),
    item("thumb_ip_joint", metal(sphere(4.8).translate(sideSign * 75, 22, -166), COLORS.steel)),
    rodBetween("thumb_distal_phalanx", [sideSign * 75, 22, -166], [sideSign * 82, 30, -190], 3.0, COLORS.steel, MATERIALS.M_dark_brushed_metal, 16),
    rodBetween("thumb_opposition_tendon", [sideSign * 34, -8, -82], [sideSign * 82, 30, -186], 1.0, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
  ];

  const tendons = [
    rodBetween("dorsal_tendon_index", [-34, -6, -78], [-34, 17, -186], 0.9, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
    rodBetween("dorsal_tendon_middle", [-11, -6, -78], [-11, 18, -205], 0.9, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
    rodBetween("dorsal_tendon_ring", [12, -6, -78], [12, 18, -200], 0.9, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
    rodBetween("dorsal_tendon_little", [34, -6, -78], [34, 17, -178], 0.9, COLORS.cableRubber, MATERIALS.M_cable_rubber, 8),
  ];

  return group(
    item("wrist_stem", wristStem),
    item("palm_carpal_block", palmCarpals),
    item("palm_arch", palmArch),
    item("dorsal_service_plate", dorsalPlate),
    ...metacarpals,
    ...thumb,
    ...tendons
  ).withConnectors({
    wrist_roll_axis: connector("wrist-roll", { origin: [0, 0, 0], axis: [0, 0, -sideSign], kind: "revolute" }),
  });
}

const controls = {
  joints: [
    {
      name: "wristYaw",
      parent: "Forearm",
      child: "Wrist Hub",
      parentConnector: "Forearm.wrist_yaw_axis",
      childConnector: "Wrist Hub.wrist_yaw_axis",
      min: JOINTS.wrist.yawMin,
      max: JOINTS.wrist.yawMax,
      defaultValue: 0,
    },
    {
      name: "wristRoll",
      parent: "Wrist Hub",
      child: "Hand",
      parentConnector: "Wrist Hub.wrist_roll_axis",
      childConnector: "Hand.wrist_roll_axis",
      min: JOINTS.wrist.rollMin,
      max: JOINTS.wrist.rollMax,
      defaultValue: 0,
    },
  ],
};

return {
  hub: makeWristHub(),
  hand: makeHand(),
  controls,
  metadata: {
    hand: { material: "segmented phalanges, metacarpal arch, tendon routing", process: "anthropomorphic mechanical hand" },
  },
};

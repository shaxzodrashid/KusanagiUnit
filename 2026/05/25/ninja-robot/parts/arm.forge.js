// Mechanical Endoskeleton Arm
// Path: 2026/05/25/ninja-robot/parts/arm.forge.js

const { COLORS, MATERIALS, DIMS, JOINTS } = require("../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;
const upperLen = DIMS.upperArm.length;
const forearmLen = DIMS.forearm.length;

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [260, -380, 120], target: [0, 0, -220], fov: 42 },
  environment: { preset: "studio", intensity: 0.25 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.18 },
    { type: "directional", position: [130, -170, 180], color: "#ffffff", intensity: 1.5, castShadow: true },
  ],
});

function hingeEar(name, y, z, radius, thickness) {
  return {
    name,
    shape: cylinder(thickness, radius, undefined, 24)
      .pointAlong([0, 1, 0])
      .translate(0, y, z)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal),
  };
}

function makeShoulderHub() {
  const stem = cylinder(24, 18, undefined, 24)
    .pointAlong([sideSign, 0, 0])
    .translate(sideSign * 15, 0, 0)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const mountPlate = box(10, 48, 48)
    .translate(sideSign * 4, 0, 0)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const outerCuff = cylinder(20, 30, undefined, 32)
    .translate(0, 0, -10)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const bearingSleeve = cylinder(26, 16, undefined, 24)
    .translate(0, 0, -12)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const goldRing = torus(28, 2.5, 32)
    .rotateX(90)
    .translate(0, 0, 0)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);

  const screws = [];
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 * i) / 4;
    const sy = Math.cos(angle) * 18;
    const sz = Math.sin(angle) * 18;
    screws.push({
      name: `mount_screw_${i}`,
      shape: cylinder(6, 2)
        .pointAlong([sideSign, 0, 0])
        .translate(sideSign * 7, sy, sz)
        .color(COLORS.fastenerDark)
        .material(MATERIALS.M_fastener_dark)
    });
  }

  return group(
    { name: "torso_stem", shape: stem },
    { name: "mount_plate", shape: mountPlate },
    { name: "outer_cuff", shape: outerCuff },
    { name: "bearing_sleeve", shape: bearingSleeve },
    { name: "gold_ring", shape: goldRing },
    ...screws
  );
}

function makeShoulderYawJoint() {
  const yawShaft = cylinder(24, 12, undefined, 24)
    .translate(0, 0, -10)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const collar = cylinder(6, 22, undefined, 32)
    .translate(0, 0, -12)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const bracketL = box(8, 26, 18)
    .translate(-16, 0, -22)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  const bracketR = box(8, 26, 18)
    .translate(16, 0, -22)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  const earL = cylinder(8, 13, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-16, 0, -22)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const earR = cylinder(8, 13, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(8, 0, -22)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "yaw_shaft", shape: yawShaft },
    { name: "yaw_collar", shape: collar },
    { name: "roll_bracket_l", shape: bracketL },
    { name: "roll_bracket_r", shape: bracketR },
    { name: "roll_ear_l", shape: earL },
    { name: "roll_ear_r", shape: earR }
  );
}

function makeShoulderRollJoint() {
  const centerCyl = cylinder(22, 10, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-11, 0, 0)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const rollPin = cylinder(40, 4.5, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-20, 0, 0)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);

  const connectBlock = box(20, 24, 18)
    .translate(0, 0, -10)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const pitchEarFront = cylinder(6, 15, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, 15, -20)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const pitchEarBack = cylinder(6, 15, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, -21, -20)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const decorativeBrassCollar = torus(12, 1.8, 24)
    .rotateX(90)
    .translate(0, 0, -4)
    .color(COLORS.brass)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "roll_center_cyl", shape: centerCyl },
    { name: "roll_pin", shape: rollPin },
    { name: "connect_block", shape: connectBlock },
    { name: "pitch_ear_front", shape: pitchEarFront },
    { name: "pitch_ear_back", shape: pitchEarBack },
    { name: "roll_brass_collar", shape: decorativeBrassCollar }
  );
}

function makeUpperArm() {
  const shoulderTongue = cylinder(26, 20, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, -3, 0)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const shoulderBridge = box(42, 22, 42)
    .translate(0, 0, -40)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  // Central bone (humerus) with structural reinforcement ridges
  const bone = cylinder(upperLen - 110, 16, undefined, 24)
    .translate(0, 0, -upperLen + 55)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const ridges = [];
  const ridgeZ = [-100, -160, -220, -280];
  for (let z of ridgeZ) {
    ridges.push(
      torus(17.5, 2.2, 24)
        .rotateX(90)
        .translate(0, 0, z)
        .color(COLORS.steel)
        .material(MATERIALS.M_dark_brushed_metal)
    );
  }

  // Actuator cylinder parameters
  const armPistonCylinderLen = upperLen * 0.45;
  const armPistonRodLen = upperLen * 0.45;

  const bicepsCylinder = cylinder(armPistonCylinderLen, 12, undefined, 24)
    .translate(0, 22, -armPistonCylinderLen - 40)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);
  const bicepsRod = cylinder(armPistonRodLen, 6.5, undefined, 24)
    .translate(0, 22, -upperLen + 40)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);
  const bicepsClevisUpper = cylinder(10, 9, undefined, 16)
    .pointAlong([1, 0, 0])
    .translate(-5, 22, -40)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const tricepsCylinder = cylinder(armPistonCylinderLen, 12, undefined, 24)
    .translate(0, -22, -armPistonCylinderLen - 40)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);
  const tricepsRod = cylinder(armPistonRodLen, 6.5, undefined, 24)
    .translate(0, -22, -upperLen + 40)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);
  const tricepsClevisUpper = cylinder(10, 9, undefined, 16)
    .pointAlong([1, 0, 0])
    .translate(-5, -22, -40)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  // Hydraulic/wiring lines wrapping the bone
  const cableA = cylinder(upperLen - 120, 2.2, undefined, 12)
    .translate(14, 10, -upperLen + 60)
    .color(COLORS.cableRubber)
    .material(MATERIALS.M_cable_rubber);
  const cableB = cylinder(upperLen - 120, 1.8, undefined, 12)
    .translate(-14, -10, -upperLen + 60)
    .color(COLORS.brass)
    .material(MATERIALS.M_dark_brushed_metal);

  const elbowBridge = box(42, 22, 42)
    .translate(0, 0, -upperLen + 30)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const elbowEarA = hingeEar("elbow_ear_front", 22, -upperLen, 26, 8);
  const elbowEarB = hingeEar("elbow_ear_back", -22, -upperLen, 26, 8);

  return group(
    { name: "shoulder_tongue", shape: shoulderTongue },
    { name: "shoulder_bridge", shape: shoulderBridge },
    { name: "humerus_bone", shape: bone },
    ...ridges.map((r, i) => ({ name: `humerus_ridge_${i}`, shape: r })),
    { name: "biceps_cylinder", shape: bicepsCylinder },
    { name: "biceps_rod", shape: bicepsRod },
    { name: "biceps_clevis_upper", shape: bicepsClevisUpper },
    { name: "triceps_cylinder", shape: tricepsCylinder },
    { name: "triceps_rod", shape: tricepsRod },
    { name: "triceps_clevis_upper", shape: tricepsClevisUpper },
    { name: "cable_a", shape: cableA },
    { name: "cable_b", shape: cableB },
    { name: "elbow_bridge", shape: elbowBridge },
    elbowEarA,
    elbowEarB
  );
}

function makeForearm() {
  const elbowTongue = cylinder(26, 22, undefined, 24)
    .pointAlong([0, 1, 0])
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const elbowBridge = box(42, 22, 36)
    .translate(0, 0, -30)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const radiusBone = cylinder(forearmLen - 100, 11, undefined, 24)
    .translate(15, 0, -forearmLen + 50)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const ulnaBone = cylinder(forearmLen - 100, 11, undefined, 24)
    .translate(-15, 0, -forearmLen + 50)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const midBand = box(46, 24, 16)
    .translate(0, 0, -forearmLen / 2)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const forearmCable = cylinder(forearmLen - 120, 2.4, undefined, 12)
    .translate(0, 0, -forearmLen + 60)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);

  const wristPitchEarFront = cylinder(6, 16, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, 15, -forearmLen + 40)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const wristPitchEarBack = cylinder(6, 16, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, -21, -forearmLen + 40)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "elbow_tongue", shape: elbowTongue },
    { name: "elbow_bridge", shape: elbowBridge },
    { name: "radius_bone", shape: radiusBone },
    { name: "ulna_bone", shape: ulnaBone },
    { name: "mid_band", shape: midBand },
    { name: "forearm_cable", shape: forearmCable },
    { name: "wrist_pitch_ear_front", shape: wristPitchEarFront },
    { name: "wrist_pitch_ear_back", shape: wristPitchEarBack }
  );
}

function makeWristHub() {
  const pitchTongue = cylinder(26, 12, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, -3, 0)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const wristCuff = cylinder(24, 22, undefined, 24)
    .translate(0, 0, -25)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const bearingSleeve = cylinder(30, 12.2, undefined, 24)
    .translate(0, 0, -28)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const brassCollar = torus(23, 1.8, 24)
    .rotateX(90)
    .translate(0, 0, -13)
    .color(COLORS.brass)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "pitch_tongue", shape: pitchTongue },
    { name: "wrist_cuff", shape: wristCuff },
    { name: "bearing_sleeve", shape: bearingSleeve },
    { name: "brass_collar", shape: brassCollar }
  );
}

function makeHand() {
  const wristStem = cylinder(30, 11, undefined, 24)
    .translate(0, 0, -15)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);
  
  const palmBase = box(56, 18, 48)
    .translate(0, 0, -54)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);
  
  const palmProngs = [];
  for (let i = 0; i < 4; i++) {
    const x = -21 + i * 14;
    const prong = cylinder(25, 4.5, undefined, 12)
      .translate(x, 6, -82.5)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal);
    const knuckle = sphere(5.5)
      .translate(x, 6, -95)
      .color(COLORS.gold)
      .material(MATERIALS.M_dark_brushed_metal);
    palmProngs.push({ name: `palm_prong_${i}`, shape: prong });
    palmProngs.push({ name: `palm_knuckle_${i}`, shape: knuckle });
  }

  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const x = -21 + i * 14;
    
    const pin1 = cylinder(10, 2.5, undefined, 12)
      .pointAlong([1, 0, 0])
      .translate(x - 5, 6, -95)
      .color(COLORS.fastenerDark)
      .material(MATERIALS.M_fastener_dark);

    const proximal = cylinder(24, 4.5, undefined, 16)
      .translate(x, 10, -112)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal);

    const joint2 = sphere(4.8)
      .translate(x, 12, -125)
      .color(COLORS.steel)
      .material(MATERIALS.M_dark_brushed_metal);
    const pin2 = cylinder(8, 2.0, undefined, 12)
      .pointAlong([1, 0, 0])
      .translate(x - 4, 12, -125)
      .color(COLORS.fastenerDark)
      .material(MATERIALS.M_fastener_dark);

    const intermediate = cylinder(18, 3.5, undefined, 16)
      .translate(x, 14, -139)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal);

    const joint3 = sphere(3.8)
      .translate(x, 15, -150)
      .color(COLORS.steel)
      .material(MATERIALS.M_dark_brushed_metal);

    const distal = cylinder(16, 2.8, 1.2, 16)
      .rotateX(-18)
      .translate(x, 18, -160)
      .color(COLORS.steel)
      .material(MATERIALS.M_dark_brushed_metal);

    fingers.push(
      { name: `finger_${i}_pin1`, shape: pin1 },
      { name: `finger_${i}_proximal`, shape: proximal },
      { name: `finger_${i}_joint2`, shape: joint2 },
      { name: `finger_${i}_pin2`, shape: pin2 },
      { name: `finger_${i}_intermediate`, shape: intermediate },
      { name: `finger_${i}_joint3`, shape: joint3 },
      { name: `finger_${i}_distal`, shape: distal }
    );
  }

  const thumbBase = box(12, 12, 28)
    .rotateZ(sideSign * 30)
    .translate(sideSign * 38, 0, -90)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const thumbKnuckle1 = sphere(5.2)
    .translate(sideSign * 39.5, 3, -104)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);

  const thumbProximal = cylinder(28, 5, undefined, 16)
    .rotateX(-20)
    .rotateZ(sideSign * 34)
    .translate(sideSign * 41, 6, -118)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const thumbKnuckle2 = sphere(4.2)
    .translate(sideSign * 45.5, 10.5, -130)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  const thumbDistal = cylinder(22, 3.5, 1.5, 16)
    .rotateX(-35)
    .rotateZ(sideSign * 34)
    .translate(sideSign * 50, 15, -139)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  const tendon1 = cylinder(75, 1.2, undefined, 12)
    .translate(-15, -2, -122)
    .color(COLORS.cableRubber)
    .material(MATERIALS.M_cable_rubber);
  const tendon2 = cylinder(75, 1.2, undefined, 12)
    .translate(15, -2, -122)
    .color(COLORS.cableRubber)
    .material(MATERIALS.M_cable_rubber);

  return group(
    { name: "wrist_stem", shape: wristStem },
    { name: "palm_base", shape: palmBase },
    ...palmProngs,
    ...fingers,
    { name: "thumb_base", shape: thumbBase },
    { name: "thumb_knuckle1", shape: thumbKnuckle1 },
    { name: "thumb_proximal", shape: thumbProximal },
    { name: "thumb_knuckle2", shape: thumbKnuckle2 },
    { name: "thumb_distal", shape: thumbDistal },
    { name: "hand_tendon1", shape: tendon1 },
    { name: "hand_tendon2", shape: tendon2 }
  );
}

const arm = assembly(`Ninja Robot ${side} Arm`)
  .addPart("Shoulder Hub", makeShoulderHub(), {
    metadata: { material: "chrome-plated carbon steel and aluminum", process: "mechanical skeleton" },
  })
  .addPart("Shoulder Yaw Joint", makeShoulderYawJoint())
  .addPart("Shoulder Roll Joint", makeShoulderRollJoint())
  .addPart("Upper Arm", makeUpperArm())
  .addPart("Forearm", makeForearm())
  .addPart("Wrist Hub", makeWristHub())
  .addPart("Hand", makeHand())
  .addRevolute("shoulderYaw", "Shoulder Hub", "Shoulder Yaw Joint", {
    axis: [0, 0, 1],
    frame: Transform.identity(),
    min: -90,
    max: 90,
    default: 0,
  })
  .addRevolute("shoulderRoll", "Shoulder Yaw Joint", "Shoulder Roll Joint", {
    axis: [1, 0, 0],
    frame: Transform.identity().translate(0, 0, -22),
    min: JOINTS.shoulder.rollMin,
    max: JOINTS.shoulder.rollMax,
    default: 0,
  })
  .addRevolute("shoulderPitch", "Shoulder Roll Joint", "Upper Arm", {
    axis: [0, 1, 0],
    frame: Transform.identity().translate(0, 0, -20),
    min: JOINTS.shoulder.pitchMin,
    max: JOINTS.shoulder.pitchMax,
    default: 0,
  })
  .addRevolute("elbowPitch", "Upper Arm", "Forearm", {
    axis: [0, 1, 0],
    frame: Transform.identity().translate(0, 0, -upperLen),
    min: JOINTS.elbow.pitchMin,
    max: JOINTS.elbow.pitchMax,
    default: 0,
  })
  .addRevolute("wristPitch", "Forearm", "Wrist Hub", {
    axis: [0, 1, 0],
    frame: Transform.identity().translate(0, 0, -forearmLen + 40),
    min: -45,
    max: 45,
    default: 0,
  })
  .addRevolute("wristYaw", "Wrist Hub", "Hand", {
    axis: [0, 0, 1],
    frame: Transform.identity().translate(0, 0, -40),
    min: JOINTS.wrist.yawMin,
    max: JOINTS.wrist.yawMax,
    default: 0,
  });

return arm;

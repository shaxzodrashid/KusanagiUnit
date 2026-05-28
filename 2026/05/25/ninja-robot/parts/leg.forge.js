// Mechanical Endoskeleton Leg
// Path: 2026/05/25/ninja-robot/parts/leg.forge.js

const { COLORS, DIMS } = require("../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;
const thighLen = DIMS.thigh.length;
const shinLen = DIMS.shin.length;

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [260, -420, 80], target: [0, 0, -390], fov: 42 },
  environment: { preset: "studio", intensity: 0.25 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.18 },
    { type: "directional", position: [130, -180, 160], color: "#ffffff", intensity: 1.5, castShadow: true },
  ],
});

function hingeEar(name, x, z, radius, thickness) {
  return {
    name,
    shape: cylinder(thickness, radius, undefined, 24)
      .pointAlong([1, 0, 0])
      .translate(x, 0, z)
      .color(COLORS.chrome),
  };
}

function makeHipHub() {
  const ball = sphere(38).color(COLORS.chrome);
  const stem = cylinder(30, 22, undefined, 24)
    .pointAlong([sideSign, 0, 0])
    .translate(sideSign * 18, 0, 0)
    .color(COLORS.darkMetal);
  
  const earA = hingeEar("hip_outer_ear", sideSign * 26, 0, 32, 8);
  const earB = hingeEar("hip_inner_ear", sideSign * -26, 0, 32, 8);

  return group(
    { name: "joint_ball", shape: ball },
    { name: "pelvis_stem", shape: stem },
    earA,
    earB
  );
}

function makeThigh() {
  const hipTongue = cylinder(30, 24, undefined, 24)
    .pointAlong([1, 0, 0])
    .color(COLORS.darkMetal);
  
  const hipBridge = box(40, 40, 50)
    .translate(0, 0, -60)
    .color(COLORS.chrome);

  // Central femur shaft
  const femur = cylinder(thighLen - 120, 22, undefined, 24)
    .translate(0, 0, -thighLen + 60)
    .color(COLORS.chrome);

  // Two parallel hydraulic actuators (pistons) on the sides (parametric)
  const pistonCylinderLen = thighLen * 0.45;
  const pistonRodLen = thighLen * 0.45;

  const pistonLCylinder = cylinder(pistonCylinderLen, 14)
    .translate(32, 0, -pistonCylinderLen - 40)
    .color(COLORS.darkMetal);
  const pistonLRod = cylinder(pistonRodLen, 8)
    .translate(32, 0, -thighLen + 50)
    .color(COLORS.chrome);

  const pistonRCylinder = cylinder(pistonCylinderLen, 14)
    .translate(-32, 0, -pistonCylinderLen - 40)
    .color(COLORS.darkMetal);
  const pistonRRod = cylinder(pistonRodLen, 8)
    .translate(-32, 0, -thighLen + 50)
    .color(COLORS.chrome);

  const kneeBridge = box(50, 40, 50)
    .translate(0, 0, -thighLen + 30)
    .color(COLORS.chrome);
  
  const kneeEarA = hingeEar("knee_outer_ear", 28, -thighLen, 32, 8);
  const kneeEarB = hingeEar("knee_inner_ear", -28, -thighLen, 32, 8);

  return group(
    { name: "hip_tongue", shape: hipTongue },
    { name: "hip_bridge", shape: hipBridge },
    { name: "femur_shaft", shape: femur },
    { name: "piston_l_cylinder", shape: pistonLCylinder },
    { name: "piston_l_rod", shape: pistonLRod },
    { name: "piston_r_cylinder", shape: pistonRCylinder },
    { name: "piston_r_rod", shape: pistonRRod },
    { name: "knee_bridge", shape: kneeBridge },
    kneeEarA,
    kneeEarB
  );
}

function makeShin() {
  const kneeTongue = cylinder(30, 24, undefined, 24)
    .pointAlong([1, 0, 0])
    .color(COLORS.darkMetal);

  const kneeBridge = box(40, 36, 40)
    .translate(0, 0, -30)
    .color(COLORS.chrome);

  // Central shin bone (tibia)
  const tibia = cylinder(shinLen - 120, 18, undefined, 24)
    .translate(0, 0, -shinLen + 60)
    .color(COLORS.chrome);

  // Thinner parallel bone (fibula)
  const fibula = cylinder(shinLen - 120, 8, undefined, 24)
    .translate(sideSign * 24, 6, -shinLen + 60)
    .color(COLORS.chrome);

  const ankleFork = group(
    hingeEar("ankle_outer_ear", 24, -shinLen, 26, 8),
    hingeEar("ankle_inner_ear", -24, -shinLen, 26, 8)
  );

  return group(
    { name: "knee_tongue", shape: kneeTongue },
    { name: "knee_bridge", shape: kneeBridge },
    { name: "tibia_shaft", shape: tibia },
    { name: "fibula_rod", shape: fibula },
    { name: "ankle_fork", group: ankleFork }
  );
}

function makeFoot() {
  const ankleTongue = cylinder(30, 20, undefined, 24)
    .pointAlong([1, 0, 0])
    .color(COLORS.darkMetal);
  
  // Heel block
  const heel = box(48, 40, 50)
    .translate(0, -30, -170)
    .color(COLORS.darkMetal);
  
  // Heel strut connecting ankle to heel block
  const heelStrut = cylinder(173, 12)
    .pointAlong([0, -30, -170])
    .color(COLORS.chrome);

  // Heel contact pad and plunger
  const heelPad = box(40, 30, 10)
    .translate(0, -30, -250)
    .color(COLORS.steel);

  const heelPlunger = cylinder(80, 8)
    .translate(0, -30, -240)
    .color(COLORS.chrome);
  
  // Skeletal mid-foot plate
  const midFoot = box(50, 150, 18)
    .rotateX(50)
    .translate(0, 60, -130)
    .color(COLORS.chrome);

  // Segmented toes
  const toes = [];
  for (let i = 0; i < 5; i++) {
    const x = -22 + i * 11;
    const proximal = cylinder(76, 5)
      .pointAlong([0, 40, -65])
      .translate(x, 105, -185)
      .color(COLORS.chrome);
    const tip = box(10, 25, 10)
      .translate(x, 150, -250)
      .color(COLORS.steel);
    toes.push({ name: `toe_${i}_proximal`, shape: proximal });
    toes.push({ name: `toe_${i}_tip`, shape: tip });
  }

  return group(
    { name: "ankle_tongue", shape: ankleTongue },
    { name: "heel_block", shape: heel },
    { name: "heel_strut", shape: heelStrut },
    { name: "heel_pad", shape: heelPad },
    { name: "heel_plunger", shape: heelPlunger },
    { name: "midfoot_plate", shape: midFoot },
    ...toes
  );
}

const leg = assembly(`Ninja Robot ${side} Leg`)
  .addPart("Hip Hub", makeHipHub(), {
    metadata: { material: "chrome-plated carbon steel and aluminum", process: "mechanical skeleton" },
  })
  .addPart("Thigh", makeThigh())
  .addPart("Shin", makeShin())
  .addPart("Foot", makeFoot())
  .addRevolute("hipPitch", "Hip Hub", "Thigh", {
    axis: [1, 0, 0],
    frame: Transform.identity(),
    min: -35,
    max: 110,
    default: 0,
  })
  .addRevolute("kneePitch", "Thigh", "Shin", {
    axis: [-1, 0, 0],
    frame: Transform.identity().translate(0, 0, -thighLen),
    min: 0,
    max: 130,
    default: 0,
  })
  .addRevolute("anklePitch", "Shin", "Foot", {
    axis: [1, 0, 0],
    frame: Transform.identity().translate(0, 0, -shinLen),
    min: -30,
    max: 30,
    default: 0,
  });

return leg;

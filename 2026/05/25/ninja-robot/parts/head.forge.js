// Robot Head Assembly
// Path: 2026/05/25/ninja-robot/parts/head.forge.js

const { COLORS, MATERIALS, DIMS, JOINTS } = require("../lib/constants.js");

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [230, -360, 150], target: [0, 20, 125], fov: 38 },
  environment: { preset: "studio", intensity: 0.3 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.18 },
    { type: "directional", position: [120, -170, 220], color: "#ffffff", intensity: 1.8, castShadow: true },
    { type: "directional", position: [-160, 140, 120], color: "#4eb3ff", intensity: 0.55 },
  ],
});

const headDims = DIMS.head;
const eyeSpacing = headDims.eyeCenterSpacing;
const eyeDia = headDims.eyeLensDiameter;

function faceDisc(x, z, radius, color) {
  return cylinder(3.2, radius, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(x, 70.1, z)
    .color(color)
    .material(MATERIALS.M_dark_brushed_metal);
}

function makeLensPod(name, x) {
  const podBody = cylinder(10, eyeDia / 2, undefined, 48) // radius 20 to fit inside inner bore 21
    .pointAlong([0, 1, 0])
    .translate(x, 54, 148) // shifted back to Y = 54
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  const emissiveRing = torus(eyeDia / 2 + 2, 2.4, 56)
    .rotateX(90)
    .translate(x, 80, 148) // shifted back to Y = 80
    .color(COLORS.eyes)
    .material(MATERIALS.M_eye_blue_emissive);

  const convexLens = sphere(eyeDia / 2)
    .scale([1.0, 0.34, 1.0])
    .translate(x, 85, 148) // shifted back to Y = 85
    .color(COLORS.eyeGlass)
    .material(MATERIALS.M_eye_glass);

  const innerSensor = cylinder(2.2, 5.5, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(x, 92, 148) // shifted back to Y = 92
    .color(COLORS.eyes)
    .material(MATERIALS.M_eye_blue_emissive);

  return group(
    { name: `${name}_pod_body`, shape: podBody },
    { name: `${name}_emissive_ring`, shape: emissiveRing },
    { name: `${name}_convex_lens`, shape: convexLens },
    { name: `${name}_depth_sensor`, shape: innerSensor }
  ).withConnectors({
    gimbal: connector("eye-pitch", { origin: [x, 54, 148], axis: [-1, 0, 0], kind: "revolute" })
  });
}

function makeEyeYoke(x) {
  return group(
    { name: "yoke_pivot", shape: sphere(1).color(COLORS.black) }
  ).withConnectors({
    yaw_joint: connector("eye-yaw", { origin: [x, 54, 148], axis: [0, 0, -1], kind: "revolute" }),
    pitch_joint: connector("eye-pitch", { origin: [x, 54, 148], axis: [1, 0, 0], kind: "revolute" })
  });
}

// Temple modules with micro-grille slots, proximity sensor, and maintenance port
function makeTempleModule(side, xSign) {
  const base = box(8, 24, 28) // width reduced to 8 to clear socket rim and brow rail
    .translate(xSign * 76, 62, 164) // Y = 62, Z = 164 to clear ears
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const micSlots = [];
  for (let sz = 158; sz <= 170; sz += 6) {
    micSlots.push(
      box(4, 4, 1.8)
        .translate(xSign * 78.1, 68, sz)
        .color(COLORS.black)
        .material(MATERIALS.M_black_oxide)
    );
  }
  
  const sensor = cylinder(4, 2.5, undefined, 16)
    .pointAlong([xSign * 1, 0, 0])
    .translate(xSign * 77.5, 62, 164)
    .color(COLORS.eyes)
    .material(MATERIALS.M_eye_blue_emissive);
     
  const port = box(4, 6, 4)
    .translate(xSign * 77.5, 56, 164)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);
     
  const moduleBody = difference(base, [port, sensor, ...micSlots]);
  
  return group(
    { name: `${side}_temple_body`, shape: moduleBody },
    { name: `${side}_temple_sensor`, shape: sensor },
    { name: `${side}_temple_port`, shape: port },
    ...micSlots.map((s, idx) => ({ name: `${side}_temple_mic_slot_${idx + 1}`, shape: s }))
  ).withConnectors({
    mount: connector({ origin: [xSign * 76, 62, 164], axis: [xSign * 1, 0, 0] })
  });
}

function makeCraniumShell() {
  const domeCore = sphere(82)
    .scale([0.98, 0.92, 0.78])
    .translate(0, -6, 196);

  const lowerTrim = box(240, 260, 320).translate(0, 0, 0); // Trim below Z = 160 to match cranial zone (160-260mm)
  const accessFlat = box(72, 16, 36).translate(0, -64, 214); // Rear cranial access flat

  // Divide into panels (Sagittal and Coronal seams)
  const sagittalSeam = box(1.8, 200, 100).translate(0, -6, 196);
  const coronalSeam = box(200, 1.8, 100).translate(0, -20, 196);

  const getEllipsoidZ = (x, y) => {
    const A = 82 * 0.98;
    const B = 82 * 0.92;
    const C = 82 * 0.78;
    const Yc = -6;
    const Zc = 196;
    const termX = x / A;
    const termY = (y - Yc) / B;
    const rad = 1 - termX * termX - termY * termY;
    if (rad < 0) return Zc;
    return Zc + C * Math.sqrt(rad);
  };

  const rivetSpecs = [];

  const getOrientation = (y) => {
    if (y >= 55 || y <= -70) {
      return "horizontal"; // Y-aligned for front/back
    } else {
      return "vertical"; // Z-aligned for top cranium
    }
  };

  // 1. Sagittal rivets: X = -7 and X = 7
  const sagittalY = [-65, -53, -41, -29, -11, 1, 13, 25, 37, 49, 61];
  for (let y of sagittalY) {
    for (let x of [-7, 7]) {
      const z = getEllipsoidZ(x, y);
      rivetSpecs.push({ x, y, z, orient: getOrientation(y) });
    }
  }

  // 2. Coronal rivets: Y = -27 and Y = -13
  const coronalX = [-65, -53, -41, -29, -17, 17, 29, 41, 53, 65];
  for (let x of coronalX) {
    for (let y of [-27, -13]) {
      const z = getEllipsoidZ(x, y);
      rivetSpecs.push({ x, y, z, orient: getOrientation(y) });
    }
  }

  // 3. Flat access cover screws (horizontal, fixed position) - Rear
  rivetSpecs.push(
    { x: -24, y: -66, z: 230, orient: "horizontal" },
    { x: 24, y: -66, z: 230, orient: "horizontal" }
  );

  // Generate shapes and cutters
  const rivetCutters = [];
  const screws = [];

  rivetSpecs.forEach((spec, idx) => {
    let rivetShape, cutterShape;
    let pocketShape;
    
    if (spec.orient === "horizontal") {
      rivetShape = cylinder(3.2, 2.5, undefined, 12)
        .pointAlong([0, 1, 0])
        .translate(spec.x, spec.y, spec.z);
      
      const yShift = spec.y > -6 ? -1.5 : 1.5;
      const zShift = spec.y > -6 ? 0 : -1.2;
      cutterShape = cylinder(8, 2.8, undefined, 12)
        .pointAlong([0, 1, 0])
        .translate(spec.x, spec.y + yShift, spec.z + zShift);
        
      pocketShape = cylinder(3, 3.8, undefined, 12)
        .pointAlong([0, 1, 0])
        .translate(spec.x, spec.y + (spec.y > -6 ? 1.5 : -1.5), spec.z);
    } else {
      rivetShape = cylinder(3.2, 2.5, undefined, 12)
        .translate(spec.x, spec.y, spec.z);
      
      cutterShape = cylinder(8, 2.8, undefined, 12)
        .translate(spec.x, spec.y, spec.z - 1.5);
        
      pocketShape = cylinder(3, 3.8, undefined, 12)
        .translate(spec.x, spec.y, spec.z + 1.5);
    }

    const finalCutter = union(cutterShape, pocketShape);
    rivetCutters.push(finalCutter);
    
    screws.push({
      name: `cranium_rivet_${idx + 1}`,
      shape: rivetShape.color(COLORS.fastenerDark).material(MATERIALS.M_fastener_dark)
    });
  });

  // Seam cutter for 0.8mm gap around access cover - Rear
  const coverSeam = difference(
    box(67.6, 5.6, 31.6).translate(0, -68, 215),
    box(66, 8, 30).translate(0, -68, 215)
  );

  const domePanelBase = difference(domeCore, [lowerTrim, accessFlat]);
  const shell = difference(domePanelBase, [sagittalSeam, coronalSeam, coverSeam, ...rivetCutters])
    .color(COLORS.darkBrushedMetal)
    .material(MATERIALS.M_dark_brushed_metal);

  const accessCoverBase = box(66, 4, 30).translate(0, -68, 215); // Rear
  const accessCover = difference(accessCoverBase, rivetCutters)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  // Ear mechanical hubs (stepped bearings) on both sides
  const makeEarHub = (side, xOffset) => {
    const dir = side === "left" ? [1, 0, 0] : [-1, 0, 0];
    const hubGroup = [];
    
    // Stepped cylinder 1
    const step1 = cylinder(10, 28, undefined, 48)
      .pointAlong(dir)
      .translate(xOffset, 22, 144)
      .color(COLORS.darkMetal)
      .material(MATERIALS.M_black_oxide);
      
    // Stepped cylinder 2
    const step2 = cylinder(6, 20, undefined, 36)
      .pointAlong(dir)
      .translate(xOffset + (side === "left" ? 10 : -10), 22, 144)
      .color(COLORS.chrome)
      .material(MATERIALS.M_neck_bearing);
      
    // Stepped cylinder 3
    const step3 = cylinder(4, 12, undefined, 24)
      .pointAlong(dir)
      .translate(xOffset + (side === "left" ? 16 : -16), 22, 144)
      .color(COLORS.darkMetal)
      .material(MATERIALS.M_black_oxide);
      
    // Center screw pin
    const pin = cylinder(3, 6, undefined, 12)
      .pointAlong(dir)
      .translate(xOffset + (side === "left" ? 20 : -20), 22, 144)
      .color(COLORS.fastenerDark)
      .material(MATERIALS.M_fastener_dark);

    // Fastener bolt circle on the outer bearing step
    const bolts = [];
    const boltX = xOffset + (side === "left" ? 10 : -10);
    const boltRadius = 22; // aligns nicely on the step1 face
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const by = 22 + Math.cos(angle) * boltRadius;
      const bz = 144 + Math.sin(angle) * boltRadius;
      bolts.push({
        name: `${side}_ear_bolt_${i + 1}`,
        shape: cylinder(2.2, 1.8, undefined, 12)
          .pointAlong(dir)
          .translate(boltX, by, bz)
          .color(COLORS.chrome)
          .material(MATERIALS.M_fastener_dark)
      });
    }
      
    hubGroup.push(
      { name: `${side}_ear_bearing_1`, shape: step1 },
      { name: `${side}_ear_bearing_2`, shape: step2 },
      { name: `${side}_ear_bearing_3`, shape: step3 },
      { name: `${side}_ear_pin`, shape: pin },
      ...bolts
    );
    return hubGroup;
  };

  const leftHub = makeEarHub("left", 76);
  const rightHub = makeEarHub("right", -76);

  return group(
    { name: "outer_cranium_shell", shape: shell },
    { name: "cranial_access_cover", shape: accessCover },
    ...screws,
    ...leftHub,
    ...rightHub
  ).withConnectors({
    mount: connector({ origin: [0, 0, 0], axis: [0, 0, 1] })
  });
}

const MOUTH_ARC = {
  frontY: 75,
  curve: 0.0128,
  socketBackOffset: 2.4,
  upperGumZ: 96,
  lowerGumZ: 77.5,
};

function mouthArcY(x, offset = 0) {
  return MOUTH_ARC.frontY - MOUTH_ARC.curve * x * x + offset;
}

function mouthArcAngle(x) {
  return Math.atan2(-2 * MOUTH_ARC.curve * x, 1) * 180 / Math.PI;
}

function roundedCrown(width, depth, height, radius) {
  return roundedRect(width, depth, Math.min(radius, width * 0.42, depth * 0.42)).extrude(height);
}

function placeOnMouthArc(shape, x, yOffset, z) {
  return shape
    .rotateZ(mouthArcAngle(x))
    .translate(x, mouthArcY(x, yOffset), z);
}

function toothCrown(spec, upper) {
  if (spec.label === "canine") {
    const baseRadius = Math.max(spec.tw, spec.td) * 0.5;
    const tipRadius = Math.max(baseRadius * 0.38, 0.9);
    const crown = upper
      ? cylinder(spec.th, tipRadius, baseRadius, 24)
      : cylinder(spec.th, baseRadius, tipRadius, 24);
    return crown.scale([spec.tw / (baseRadius * 2), spec.td / (baseRadius * 2), 1.0]);
  }

  const crown = roundedCrown(spec.tw, spec.td, spec.th, spec.r || 1.0);
  const labialFacet = roundedCrown(spec.tw * 0.74, 0.7, spec.th * 0.72, 0.35)
    .translate(0, spec.td * 0.5 - 0.18, spec.th * 0.14);

  if (spec.label === "molar" || spec.label === "premolar") {
    const fissure = box(spec.tw * 0.34, spec.td + 1.2, 1.0)
      .translate(0, 0, upper ? 0.45 : spec.th - 1.45);
    const transverseGroove = box(spec.tw + 1.0, 0.8, 1.0)
      .translate(0, 0, upper ? 0.45 : spec.th - 1.45);
    return difference(union(crown, labialFacet), [fissure, transverseGroove]);
  }

  const incisalBevel = box(spec.tw + 1, spec.td + 1, 1.5)
    .rotateX(upper ? -8 : 8)
    .translate(0, 0, upper ? 0.1 : spec.th - 1.4);
  return difference(union(crown, labialFacet), [incisalBevel]);
}

function makeDentalArch(upper) {
  const specs = [
    { x: 44, label: "molar_2", tw: 7.8, td: 7.2, th: upper ? 6.0 : 5.5, sw: 9.4, sd: 8.8, r: 1.3 },
    { x: 35, label: "molar_1", tw: 7.4, td: 6.8, th: upper ? 6.4 : 5.8, sw: 9.0, sd: 8.4, r: 1.2 },
    { x: 27, label: "premolar_2", tw: 5.8, td: 5.6, th: upper ? 6.8 : 6.2, sw: 7.2, sd: 7.0, r: 1.0 },
    { x: 19, label: "premolar_1", tw: 5.4, td: 5.0, th: upper ? 7.0 : 6.4, sw: 6.8, sd: 6.4, r: 0.9 },
    { x: 11, label: "canine", tw: 4.7, td: 4.5, th: upper ? 10.5 : 9.3, sw: 6.4, sd: 6.0 },
    { x: 4, label: "central", tw: 5.4, td: 3.6, th: upper ? 9.0 : 7.8, sw: 6.8, sd: 5.0, r: 0.8 },
    { x: -4, label: "central", tw: 5.4, td: 3.6, th: upper ? 9.0 : 7.8, sw: 6.8, sd: 5.0, r: 0.8 },
    { x: -11, label: "canine", tw: 4.7, td: 4.5, th: upper ? 10.5 : 9.3, sw: 6.4, sd: 6.0 },
    { x: -19, label: "premolar_1", tw: 5.4, td: 5.0, th: upper ? 7.0 : 6.4, sw: 6.8, sd: 6.4, r: 0.9 },
    { x: -27, label: "premolar_2", tw: 5.8, td: 5.6, th: upper ? 6.8 : 6.2, sw: 7.2, sd: 7.0, r: 1.0 },
    { x: -35, label: "molar_1", tw: 7.4, td: 6.8, th: upper ? 6.4 : 5.8, sw: 9.0, sd: 8.4, r: 1.2 },
    { x: -44, label: "molar_2", tw: 7.8, td: 7.2, th: upper ? 6.0 : 5.5, sw: 9.4, sd: 8.8, r: 1.3 },
  ];

  const children = [];
  const cutters = [];
  const prefix = upper ? "upper" : "lower";
  const socketZ = upper ? MOUTH_ARC.upperGumZ - 2.8 : MOUTH_ARC.lowerGumZ;

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const socketOuter = roundedCrown(spec.sw, spec.sd, 4.4, 1.1);
    const socketInner = roundedCrown(spec.tw + 0.8, spec.td + 0.8, 6.4, 0.7).translate(0, 0, -0.8);
    const socket = placeOnMouthArc(
      difference(socketOuter, [socketInner]),
      spec.x,
      -MOUTH_ARC.socketBackOffset,
      socketZ
    )
      .color(COLORS.teethSocket)
      .material(MATERIALS.M_black_oxide);

    const crownZ = upper ? MOUTH_ARC.upperGumZ - spec.th : MOUTH_ARC.lowerGumZ + 1.5;
    const tooth = placeOnMouthArc(toothCrown(spec, upper), spec.x, 0, crownZ)
      .color(COLORS.chrome)
      .material(MATERIALS.M_dark_brushed_metal);

    const pin = placeOnMouthArc(
      cylinder(upper ? 4.8 : 4.2, 0.9, undefined, 12),
      spec.x,
      -MOUTH_ARC.socketBackOffset,
      upper ? MOUTH_ARC.upperGumZ - 4.5 : MOUTH_ARC.lowerGumZ + 0.2
    )
      .color(COLORS.fastenerDark)
      .material(MATERIALS.M_fastener_dark);

    children.push(
      { name: `${prefix}_socket_${spec.label}_${i + 1}`, shape: socket },
      { name: `${prefix}_tooth_${spec.label}_${i + 1}`, shape: tooth },
      { name: `${prefix}_tooth_alignment_pin_${i + 1}`, shape: pin }
    );

    cutters.push(
      placeOnMouthArc(
        roundedCrown(spec.sw + 1.2, spec.sd + 1.2, upper ? 8 : 13, 1.1),
        spec.x,
        -MOUTH_ARC.socketBackOffset,
        upper ? MOUTH_ARC.upperGumZ - 5 : MOUTH_ARC.lowerGumZ - 1
      )
    );
  }

  return { children, cutters };
}

function makeGumRail(upper) {
  const segments = [];
  const z = upper ? MOUTH_ARC.upperGumZ - 3.6 : MOUTH_ARC.lowerGumZ + 0.2;
  const height = upper ? 5.8 : 5.2;
  for (let gx = -47; gx <= 47; gx += 3.8) {
    segments.push(placeOnMouthArc(roundedCrown(4.4, 3.4, height, 0.8), gx, -4.8, z));
  }
  return union(...segments)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);
}

function makeSegmentedLip(prefix, upper) {
  const parts = [];
  const z = upper ? 88.6 : 79.6;
  const height = upper ? 5.2 : 4.4;
  for (let x = -39; x <= 39; x += 13) {
    parts.push({
      name: `${prefix}_lip_plate_${x}`,
      shape: placeOnMouthArc(roundedCrown(12.4, 5.0, height, 1.2), x, 1.9, z)
        .color(x === 0 ? COLORS.chrome : COLORS.steel)
        .material(MATERIALS.M_dark_brushed_metal)
    });
  }
  return parts;
}

function makeFaceFrame() {
  const bridge = box(90, 35, 70)
    .translate(0, 30, 100)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  const browRailBlank = box(140, 18, 12) // width reduced to 140 to clear temple modules
    .translate(0, 80, 174);
  const grooves = [];
  for (let gx of [-60, -30, 0, 30, 60]) {
    grooves.push(
      box(2.4, 6, 16)
        .translate(gx, 94, 172)
    );
  }
  const browRail = difference(browRailBlank, grooves)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const leftCheek = box(10, 14, 24)
    .rotateY(-14)
    .translate(-77, 78, 112)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const rightCheek = box(10, 14, 24)
    .rotateY(14)
    .translate(77, 78, 112)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const leftSocketRim = difference(
    cylinder(12, 26, undefined, 48).pointAlong([0, 1, 0]).translate(-eyeSpacing / 2, 64, 148),
    [cylinder(16, 21, undefined, 48).pointAlong([0, 1, 0]).translate(-eyeSpacing / 2, 62, 148)]
  ).color(COLORS.chrome).material(MATERIALS.M_dark_brushed_metal);

  const rightSocketRim = difference(
    cylinder(12, 26, undefined, 48).pointAlong([0, 1, 0]).translate(eyeSpacing / 2, 64, 148),
    [cylinder(16, 21, undefined, 48).pointAlong([0, 1, 0]).translate(eyeSpacing / 2, 62, 148)]
  ).color(COLORS.chrome).material(MATERIALS.M_dark_brushed_metal);

  const leftZygomaticFront = box(22, 12, 12)
    .translate(-50, 72, 104)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const leftZygomaticSideBase = box(8, 45, 12)
    .rotateZ(18)
    .translate(-66, 46, 104);
  const leftHingeCutter = cylinder(12, 8.2, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-56, 22, 108);
  const leftSlot = box(12, 30, 4)
    .rotateZ(18)
    .translate(-66, 46, 108);
  const leftZygomaticSide = difference(leftZygomaticSideBase, [leftHingeCutter, leftSlot])
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const rightZygomaticFront = box(22, 12, 12)
    .translate(50, 72, 104)
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);
  
  const rightZygomaticSideBase = box(8, 45, 12)
    .rotateZ(-18)
    .translate(66, 46, 104);
  const rightHingeCutter = cylinder(12, 8.2, undefined, 24)
    .pointAlong([-1, 0, 0])
    .translate(56, 22, 108);
  const rightSlot = box(12, 30, 4)
    .rotateZ(-18)
    .translate(66, 46, 108);
  const rightZygomaticSide = difference(rightZygomaticSideBase, [rightHingeCutter, rightSlot])
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const upperDental = makeDentalArch(true);
  const upperGumRail = makeGumRail(true);
  const upperLipPlates = makeSegmentedLip("upper", true);
  const upperLipSeal = difference(
    roundedCrown(82, 5.8, 5.2, 2.0).translate(0, 77.2, 88.8),
    [roundedCrown(57, 3.2, 6.2, 1.3).translate(0, 78.0, 88.3)]
  )
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const leftMouthCorner = cylinder(5.0, 5.2, 3.2, 20)
    .pointAlong([0, 1, 0])
    .rotateZ(-16)
    .translate(-51, 70, 85)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);
  const rightMouthCorner = cylinder(5.0, 5.2, 3.2, 20)
    .pointAlong([0, 1, 0])
    .rotateZ(16)
    .translate(51, 70, 85)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  const oralCavity = roundedCrown(66, 13, 8.0, 2.8)
    .translate(0, 54, 83.4)
    .color(COLORS.black)
    .material(MATERIALS.M_black_oxide);

  return group(
    { name: "face_bridge", shape: bridge },
    { name: "brow_service_rail", shape: browRail },
    { name: "left_cheek_rib", shape: leftCheek },
    { name: "right_cheek_rib", shape: rightCheek },
    { name: "left_socket_rim", shape: leftSocketRim },
    { name: "right_socket_rim", shape: rightSocketRim },
    { name: "left_zygomatic_front", shape: leftZygomaticFront },
    { name: "left_zygomatic_side", shape: leftZygomaticSide },
    { name: "right_zygomatic_front", shape: rightZygomaticFront },
    { name: "right_zygomatic_side", shape: rightZygomaticSide },
    { name: "upper_gum_rail", shape: upperGumRail },
    { name: "upper_lip_seal", shape: upperLipSeal },
    ...upperLipPlates,
    { name: "left_oral_commissure_socket", shape: leftMouthCorner },
    { name: "right_oral_commissure_socket", shape: rightMouthCorner },
    { name: "oral_cavity_recess", shape: oralCavity },
    ...upperDental.children
  );
}

function makeNoseVent() {
  const noseBlockBlank = box(34, 18, 44)
    .translate(0, 72, 116);
  const noseBevelL = box(20, 30, 60)
    .rotateY(25)
    .translate(-28, 72, 116);
  const noseBevelR = box(20, 30, 60)
    .rotateY(-25)
    .translate(28, 72, 116);
  const noseBlock = difference(noseBlockBlank, [noseBevelL, noseBevelR]).color(COLORS.steel);

  const noseSketch = path()
    .moveTo(0, 15)
    .lineTo(13, -12)
    .lineTo(5, -20)
    .lineTo(0, -15)
    .lineTo(-5, -20)
    .lineTo(-13, -12)
    .close();

  const noseCutter = noseSketch
    .extrude(30)
    .rotateX(90)
    .translate(0, 84, 116);

  const septum = box(2.2, 16, 36)
    .translate(0, 70, 116)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  const noseCavityBase = difference(noseBlock, [noseCutter, septum]);

  // Horizontal acoustic/thermal vent grille bars inside nose cavity
  const grilleShapes = [];
  for (let gz = 102; gz <= 130; gz += 7) {
    const gb = box(24, 4, 1.8)
      .translate(0, 80.5, gz)
      .color(COLORS.blackOxide)
      .material(MATERIALS.M_black_oxide);
    grilleShapes.push(gb);
  }

  const noseCavity = union(noseCavityBase, ...grilleShapes)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "central_nose_vent_cavity", shape: noseCavity },
    { name: "septum", shape: septum }
  ).withConnectors({
    mount: connector({ origin: [0, 72, 116], axis: [0, 1, 0] })
  });
}

function makeMandible() {
  // --- Sculpted chin housing with mentalis bump and lateral bevels ---
  const chinBase = box(78, 20, 26)
    .translate(0, 68, 69);
  const chinBevelL = box(20, 24, 30)
    .rotateY(22)
    .translate(-48, 68, 69);
  const chinBevelR = box(20, 24, 30)
    .rotateY(-22)
    .translate(48, 68, 69);
  const chinRecess = box(38, 4, 14)
    .translate(0, 77, 69);
  // Mentalis bump: subtle forward protrusion at chin center
  const mentalisBump = sphere(12)
    .scale([1.0, 0.45, 0.6])
    .translate(0, 80, 64)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  // --- Speaker grille with individual slats ---
  const speakerSlats = [];
  for (let sx = -12; sx <= 12; sx += 4) {
    speakerSlats.push(
      box(1.6, 2, 9)
        .translate(sx, 77, 69)
        .color(COLORS.blackOxide)
        .material(MATERIALS.M_black_oxide)
    );
  }
  // Speaker frame surround
  const speakerFrameOuter = box(30, 2.5, 11)
    .translate(0, 77, 69);
  const speakerFrameInner = box(27, 3, 9)
    .translate(0, 77, 69);
  const speakerFrame = difference(speakerFrameOuter, [speakerFrameInner])
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  // --- Lower lip armor plate ---
  const lowerLipBlank = box(66, 5, 5)
    .translate(0, 75, 79.7);
  const lowerLipSlot = box(50, 3, 7)
    .translate(0, 76, 79.2);
  const lowerLip = difference(lowerLipBlank, [lowerLipSlot])
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const lowerLipCornerL = box(14, 5, 6)
    .rotateZ(-12)
    .translate(-40, 70, 79.2)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);
  const lowerLipCornerR = box(14, 5, 6)
    .rotateZ(12)
    .translate(40, 70, 79.2)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  // --- Jaw rails with cable channel and inspection window ---
  const leftJawRailBlank = box(10, 56, 30)
    .rotateX(20)
    .translate(-56, 32, 68);
  const leftJawChannel = cylinder(40, 3.6, undefined, 16)
    .rotateX(20)
    .translate(-56, 32, 68);
  const leftJawWindow = box(4, 32, 16)
    .translate(-4, 0, 7)
    .rotateX(20)
    .translate(-56, 32, 68);
  const leftJawRail = difference(leftJawRailBlank, [leftJawChannel, leftJawWindow])
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  const rightJawRailBlank = box(10, 56, 30)
    .rotateX(20)
    .translate(56, 32, 68);
  const rightJawChannel = cylinder(40, 3.6, undefined, 16)
    .rotateX(20)
    .translate(56, 32, 68);
  const rightJawWindow = box(4, 32, 16)
    .translate(4, 0, 7)
    .rotateX(20)
    .translate(56, 32, 68);
  const rightJawRail = difference(rightJawRailBlank, [rightJawChannel, rightJawWindow])
    .color(COLORS.chrome)
    .material(MATERIALS.M_dark_brushed_metal);

  // --- Hinge links ---
  const leftHingeLink = cylinder(10, 8, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-56, 22, 108)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const rightHingeLink = cylinder(10, 8, undefined, 24)
    .pointAlong([-1, 0, 0])
    .translate(56, 22, 108)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const lowerDental = makeDentalArch(false);
  const lowerCutters = lowerDental.cutters;
  const lowerGumRail = makeGumRail(false);
  const lowerLipPlates = makeSegmentedLip("lower", false);

  const occlusionGuide = roundedCrown(60, 2.2, 2.2, 1.1)
    .translate(0, 77.6, 84.9)
    .color(COLORS.blackOxide)
    .material(MATERIALS.M_black_oxide);

  const leftCanineStop = cylinder(7, 2.8, 2.2, 16)
    .pointAlong([0, 1, 0])
    .translate(-16, 76, 86)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);
  const rightCanineStop = cylinder(7, 2.8, 2.2, 16)
    .pointAlong([0, 1, 0])
    .translate(16, 76, 86)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);

  // --- Heat-sink ribs on back of chin (structural + thermal) ---
  const jawRibs = [];
  const ribXCoords = [-30, -22, -14, -6, 6, 14, 22, 30];
  for (let rx of ribXCoords) {
    jawRibs.push({
      name: `lower_jaw_heatsink_rib_${rx}`,
      shape: box(2.2, 6, 14)
        .translate(rx, 51, 68)
        .color(COLORS.darkMetal)
        .material(MATERIALS.M_black_oxide)
    });
  }

  // --- Chin bolts: two visible hex fasteners on chin face ---
  const chinBoltL = cylinder(2.4, 2.8, undefined, 6)
    .pointAlong([0, 1, 0])
    .translate(-22, 78, 64)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);
  const chinBoltR = cylinder(2.4, 2.8, undefined, 6)
    .pointAlong([0, 1, 0])
    .translate(22, 78, 64)
    .color(COLORS.fastenerDark)
    .material(MATERIALS.M_fastener_dark);

  // --- Assemble chin ---
  let chin = difference(chinBase, [chinBevelL, chinBevelR, chinRecess, ...lowerCutters])
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  // --- Jaw actuator rods (bodies are on structural frame) ---
  const leftActuatorRod = cylinder(16, 1.5, undefined, 12)
    .translate(0, 0, 14)
    .rotateX(20)
    .translate(-56, 32, 68)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  const rightActuatorRod = cylinder(16, 1.5, undefined, 12)
    .translate(0, 0, 14)
    .rotateX(20)
    .translate(56, 32, 68)
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  // --- Roll hinge hub ---
  const rollHubOuter = cylinder(36, 16, undefined, 36)
    .pointAlong([0, 1, 0])
    .translate(0, -58, 0)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  const rollBore = cylinder(50, 12.2, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(0, -70, 0);

  const rollHub = difference(rollHubOuter, [rollBore]);

  return group(
    { name: "roll_joint_hub", shape: rollHub },
    { name: "chin_housing", shape: chin },
    { name: "chin_mentalis", shape: mentalisBump },
    { name: "chin_bolt_left", shape: chinBoltL },
    { name: "chin_bolt_right", shape: chinBoltR },
    { name: "speaker_frame", shape: speakerFrame },
    ...speakerSlats.map((s, idx) => ({ name: `speaker_slat_${idx + 1}`, shape: s })),
    { name: "lower_lip_plate", shape: lowerLip },
    { name: "lower_lip_corner_left", shape: lowerLipCornerL },
    { name: "lower_lip_corner_right", shape: lowerLipCornerR },
    ...lowerLipPlates,
    { name: "occlusion_clearance_guide", shape: occlusionGuide },
    { name: "left_canine_stop_pin", shape: leftCanineStop },
    { name: "right_canine_stop_pin", shape: rightCanineStop },
    { name: "lower_gum_rail", shape: lowerGumRail },
    ...jawRibs,
    { name: "left_mandible_rail", shape: leftJawRail },
    { name: "right_mandible_rail", shape: rightJawRail },
    { name: "left_hinge_link", shape: leftHingeLink },
    { name: "right_hinge_link", shape: rightHingeLink },
    { name: "left_mandible_actuator_rod", shape: leftActuatorRod },
    { name: "right_mandible_actuator_rod", shape: rightActuatorRod },
    ...lowerDental.children
  ).withConnectors({
    hinge: connector("jaw-pitch", { origin: [0, 22, 108], axis: [1, 0, 0], kind: "revolute" })
  });
}

function makeTubeBetween(p1, p2, radius, color) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dz = p2[2] - p1[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return cylinder(len, radius, undefined, 12)
    .pointAlong([dx, dy, dz])
    .translate(p1[0], p1[1], p1[2])
    .color(color);
}

function makeInternalCore() {
  const spineBase = cylinder(100, 30, undefined, 32)
    .translate(0, -22, 24)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  // Clearance pocket for the roll joint and pitch tongue in the internal spine
  const rollJointCutter = cylinder(80, 19, undefined, 24)
    .pointAlong([0, 1, 0])
    .translate(0, -58, 0);

  const pitchTongueCutter = cylinder(90, 24, undefined, 24)
    .pointAlong([1, 0, 0])
    .translate(-45, 0, 0);

  const spine = difference(spineBase, [rollJointCutter, pitchTongueCutter]);

  const ribs = [];
  const ribZ = [40, 60, 80, 100];
  for (let z of ribZ) {
    ribs.push({
      name: `spine_rib_${z}`,
      shape: torus(32.2, 2.2, 32)
        .translate(0, -22, z)
        .color(COLORS.chrome)
        .material(MATERIALS.M_dark_brushed_metal)
    });
  }

  const sideCables = [
    { name: "left_cable_1", shape: makeTubeBetween([-40, 8, 120], [-38, -40, 35], 2.2, COLORS.gold).material(MATERIALS.M_cable_rubber) },
    { name: "left_cable_2", shape: makeTubeBetween([-48, -10, 110], [-32, -42, 45], 1.8, COLORS.brass).material(MATERIALS.M_cable_rubber) },
    { name: "right_cable_1", shape: makeTubeBetween([40, 8, 120], [38, -40, 35], 2.2, COLORS.gold).material(MATERIALS.M_cable_rubber) },
    { name: "right_cable_2", shape: makeTubeBetween([48, -10, 110], [32, -42, 45], 1.8, COLORS.brass).material(MATERIALS.M_cable_rubber) }
  ];

  return group(
    { name: "braincase_spine", shape: spine },
    ...ribs,
    ...sideCables
  );
}

function makeSkullCorpus() {
  const skullOuter = sphere(78)
    .scale([0.96, 0.90, 0.76])
    .translate(0, -6, 196);
  const skullInner = sphere(74)
    .scale([0.96, 0.90, 0.76])
    .translate(0, -6, 196);

  const eyeCutoutL = cylinder(60, 28, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(-eyeSpacing / 2, 60, 148);
  const eyeCutoutR = cylinder(60, 28, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(eyeSpacing / 2, 60, 148);

  const neckCutout = cylinder(100, 36, undefined, 32)
    .translate(0, -22, 24);
    
  // Front face cutout so the face frame fits inside
  const faceCutout = box(140, 60, 100)
    .translate(0, 60, 120);

  const skullShell = difference(skullOuter, [skullInner, eyeCutoutL, eyeCutoutR, neckCutout, faceCutout])
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "skull_corpus_shell", shape: skullShell }
  );
}

function makeHeadFrame() {
  const face = makeFaceFrame();
  const skullCorpus = makeSkullCorpus();
  const innerCore = makeInternalCore();

  const leftActuatorBody = difference(
    cylinder(16, 3.0, undefined, 16),
    [cylinder(18, 1.8, undefined, 12).translate(0, 0, 2)]
  )
    .rotateX(20)
    .translate(-56, 32, 68)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);

  const rightActuatorBody = difference(
    cylinder(16, 3.0, undefined, 16),
    [cylinder(18, 1.8, undefined, 12).translate(0, 0, 2)]
  )
    .rotateX(20)
    .translate(56, 32, 68)
    .color(COLORS.gold)
    .material(MATERIALS.M_dark_brushed_metal);

  return group(
    { name: "face_frame", group: face },
    { name: "skull_corpus", group: skullCorpus },
    { name: "internal_core", group: innerCore },
    { name: "left_mandible_actuator_body", shape: leftActuatorBody },
    { name: "right_mandible_actuator_body", shape: rightActuatorBody }
  ).withConnectors({
    roll_axis: connector("neck-roll", { origin: [0, -22, 0], axis: [0, -1, 0], kind: "revolute" }),
    cranial_shell_mount: connector({ origin: [0, 0, 0], axis: [0, 0, 1] }),
    left_temple_mount: connector({ origin: [76, 62, 164], axis: [1, 0, 0] }),
    right_temple_mount: connector({ origin: [-76, 62, 164], axis: [-1, 0, 0] }),
    nose_vent_mount: connector({ origin: [0, 72, 116], axis: [0, 1, 0] }),
    mandible_hinge: connector("jaw-pitch", { origin: [0, 22, 108], axis: [-1, 0, 0], kind: "revolute" }),
    left_eye_mount: connector("left-eye-yaw", { origin: [-eyeSpacing / 2, 54, 148], axis: [0, 0, 1], kind: "revolute" }),
    right_eye_mount: connector("right-eye-yaw", { origin: [eyeSpacing / 2, 54, 148], axis: [0, 0, 1], kind: "revolute" }),
  });
}

function makeHead() {
  const headAssembly = assembly("Ninja Robot Head")
    .addPart("HeadFrame", makeHeadFrame())
    .addPart("CranialShell", makeCraniumShell())
    .addPart("LeftTemple", makeTempleModule("left", 1))
    .addPart("RightTemple", makeTempleModule("right", -1))
    .addPart("NoseVent", makeNoseVent())
    .addPart("Mandible", makeMandible())
    .addPart("LeftEyeYoke", makeEyeYoke(-eyeSpacing / 2))
    .addPart("LeftEye", makeLensPod("left_optical", -eyeSpacing / 2))
    .addPart("RightEyeYoke", makeEyeYoke(eyeSpacing / 2))
    .addPart("RightEye", makeLensPod("right_optical", eyeSpacing / 2))

    // Connect CranialShell
    .connect("HeadFrame.cranial_shell_mount", "CranialShell.mount", { as: "cranialShellMount" })
    // Connect Temples
    .connect("HeadFrame.left_temple_mount", "LeftTemple.mount", { as: "leftTempleMount" })
    .connect("HeadFrame.right_temple_mount", "RightTemple.mount", { as: "rightTempleMount" })
    // Connect NoseVent
    .connect("HeadFrame.nose_vent_mount", "NoseVent.mount", { as: "noseVentMount" })
    // Connect Mandible
    .connect("HeadFrame.mandible_hinge", "Mandible.hinge", {
      as: "jawPitch",
      min: JOINTS.mandible.pitchMin,
      max: JOINTS.mandible.pitchMax,
      default: 0,
    })
    // Connect Left Eye Yaw
    .connect("HeadFrame.left_eye_mount", "LeftEyeYoke.yaw_joint", {
      as: "leftEyeYaw",
      min: JOINTS.eyes.yawMin,
      max: JOINTS.eyes.yawMax,
      default: 0,
    })
    // Connect Left Eye Pitch
    .connect("LeftEyeYoke.pitch_joint", "LeftEye.gimbal", {
      as: "leftEyePitch",
      min: JOINTS.eyes.pitchMin,
      max: JOINTS.eyes.pitchMax,
      default: 0,
    })
    // Connect Right Eye Yaw
    .connect("HeadFrame.right_eye_mount", "RightEyeYoke.yaw_joint", {
      as: "rightEyeYaw",
      min: JOINTS.eyes.yawMin,
      max: JOINTS.eyes.yawMax,
      default: 0,
    })
    // Connect Right Eye Pitch
    .connect("RightEyeYoke.pitch_joint", "RightEye.gimbal", {
      as: "rightEyePitch",
      min: JOINTS.eyes.pitchMin,
      max: JOINTS.eyes.pitchMax,
      default: 0,
    });

  return headAssembly;
}

return makeHead();

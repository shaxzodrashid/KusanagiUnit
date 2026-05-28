// Mechanical Endoskeleton Torso
// Path: 2026/05/25/ninja-robot/parts/torso.forge.js

const { COLORS } = require("../lib/constants.js");

scene({
  background: { top: '#0b0c10', bottom: '#1f2833' },
  camera: { position: [400, -500, 300], target: [0, 0, 150], fov: 40 },
  lights: [
    { type: 'ambient', color: '#c8cdd4', intensity: 0.2 },
    { type: 'directional', position: [150, -150, 200], color: '#ffffff', intensity: 1.5, castShadow: true },
  ],
});

function makeTorso() {
  // --- SPINAL COLUMN (Vertebrae stack) ---
  const vertebrae = [];
  const vertebraeCount = 20;
  for (let i = 0; i < vertebraeCount; i++) {
    const z = 70 + i * 23.5;
    const body = cylinder(28, 12, undefined, 24)
      .translate(0, 0, z)
      .color(COLORS.chrome);
    const process = box(14, 18, 14)
      .translate(0, -14, z + 3)
      .color(COLORS.darkMetal);
    vertebrae.push({ name: `vert_body_${i}`, shape: body });
    vertebrae.push({ name: `vert_proc_${i}`, shape: process });
  }

  // --- RIB CAGE ---
  const sternum = box(30, 15, 230)
    .translate(0, 90, 400)
    .color(COLORS.steel);

  // Curved ribs using horizontal scaled toruses
  const ribs = [];
  const totalRibs = 12;
  for (let i = 0; i < totalRibs; i++) {
    const z_rib = 265 + i * 24.5;
    const t = i / (totalRibs - 1); // 0 to 1

    // Determine front position and back position based on anatomical type
    const y_back = -20; // attaches to back-side of vertebrae
    let y_front = 90;   // connects to sternum
    
    if (i === 0) {
      y_front = 35;     // T12 floating
    } else if (i === 1) {
      y_front = 45;     // T11 floating
    } else if (i === 2) {
      y_front = 55;     // T10 false
    } else if (i === 3) {
      y_front = 65;     // T9 false
    } else if (i === 4) {
      y_front = 75;     // T8 false
    } else if (i === 11) {
      y_front = 80;     // T1 top rib (shorter)
    }

    const r = (y_front - y_back) / 2;
    const y_center = (y_front + y_back) / 2;

    // Define lateral width of the rib cage: barrel shaped, widest in middle
    const r_x = 80 + 90 * Math.sin(t * Math.PI) + 25 * Math.pow(t, 2);
    const xScale = r_x / r;

    // Rib thickness: thicker at top, thinner at bottom
    const ribThick = 5.0 + 2.0 * t;

    // Slant angle: ribs slope downwards from back to front
    const slantAngle = 6.0 + 4.0 * (1 - t);

    // Build the torus tipped downwards, pivoting around the back spine connector
    let ribRing = torus(r, ribThick, 36)
      .scale([xScale, 1.0, 1.0])
      .translate(0, r, 0)               // align back of torus to Y=0
      .rotateX(-slantAngle)             // slant downwards at front, rotating around Y=0
      .translate(0, y_back, z_rib);     // position at spine back and correct height

    // Slice gaps:
    // 1. Back gap for spine vertebrae body clearance (widened to 35 to clear processes)
    const spineGap = box(35, 60, 50).translate(0, -25, z_rib);

    // 2. Front gap depending on rib connection type
    let frontGap;
    if (i <= 1) {
      // Floating ribs: large front gap
      frontGap = box(250, 100, 50).translate(0, y_front + 30, z_rib);
    } else if (i <= 4) {
      // False ribs: medium front gap
      frontGap = box(70, 80, 50).translate(0, y_front + 20, z_rib);
    } else {
      // True ribs: small gap to fit around sternum sides (widened to 32 to perfectly touch sides)
      frontGap = box(32, 60, 50).translate(0, y_front + 8, z_rib);
    }

    ribRing = difference(ribRing, [spineGap, frontGap]).color(COLORS.steel);
    ribs.push({ name: `rib_${i}`, shape: ribRing });
  }

  // --- CLAVICLE / UPPER CHEST ---
  const clavicle = cylinder(380, 15)
    .rotateY(90)
    .translate(-190, 25, 550)
    .color(COLORS.chrome);
  
  const chestPlate = box(160, 45, 25)
    .translate(0, 45, 550)
    .color(COLORS.steel);

  // Shoulder sockets
  const shoulderSocketL = cylinder(40, 24)
    .rotateY(90)
    .translate(210, 15, 550)
    .color(COLORS.darkMetal);
  
  const shoulderSocketR = cylinder(40, 24)
    .rotateY(-90)
    .translate(-210, 15, 550)
    .color(COLORS.darkMetal);

  // --- HYDRAULIC CHEST PISTONS ---
  const pistonLCylinder = cylinder(180, 9)
    .translate(90, 30, 150)
    .color(COLORS.darkMetal);
  const pistonLRod = cylinder(120, 6)
    .translate(90, 30, 270)
    .color(COLORS.chrome);

  const pistonRCylinder = cylinder(180, 9)
    .translate(-90, 30, 150)
    .color(COLORS.darkMetal);
  const pistonRRod = cylinder(120, 6)
    .translate(-90, 30, 270)
    .color(COLORS.chrome);

  // --- PELVIS (Skeletal pelvic girdle) ---
  const pelvisBar = box(280, 45, 30)
    .translate(0, 0, 45)
    .color(COLORS.steel);
  
  const pelvisCenter = cylinder(45, 28, 12, 3)
    .rotateX(90)
    .translate(0, 0, 42)
    .color(COLORS.darkMetal);

  const hipSocketL = sphere(30)
    .translate(140, 0, 45)
    .color(COLORS.darkMetal);
  
  const hipSocketR = sphere(30)
    .translate(-140, 0, 45)
    .color(COLORS.darkMetal);

  const pelvis = union(pelvisBar, pelvisCenter, hipSocketL, hipSocketR);

  // Neck socket at the top of spine
  const neckSocket = cylinder(10, 85 / 2, undefined, 48)
    .translate(0, 0, 550)
    .color(COLORS.darkMetal);

  // Compile all torso parts
  const torsoGroup = group(
    ...vertebrae,
    ...ribs,
    { name: "sternum", shape: sternum },
    { name: "clavicle", shape: clavicle },
    { name: "chest_plate", shape: chestPlate },
    { name: "shoulder_socket_l", shape: shoulderSocketL },
    { name: "shoulder_socket_r", shape: shoulderSocketR },
    { name: "piston_l_cylinder", shape: pistonLCylinder },
    { name: "piston_l_rod", shape: pistonLRod },
    { name: "piston_r_cylinder", shape: pistonRCylinder },
    { name: "piston_r_rod", shape: pistonRRod },
    { name: "pelvis", shape: pelvis },
    { name: "neck_socket", shape: neckSocket }
  );

  // Return with connectors
  return torsoGroup.withConnectors({
    neck: connector("neck-yaw", { origin: [0, 0, 555], axis: [0, 0, 1], kind: "revolute" }),
    left_shoulder: connector({ origin: [225, 15, 555], axis: [1, 0, 0] }),
    right_shoulder: connector({ origin: [-225, 15, 555], axis: [-1, 0, 0] }),
    left_hip: connector({ origin: [140, 0, 45], axis: [0, 0, -1] }),
    right_hip: connector({ origin: [-140, 0, 45], axis: [0, 0, -1] }),
    sword_mount: connector({ origin: [0, -100, 400], axis: [0, -1, 0] }),
  });
}

const torsoPart = makeTorso();
return torsoPart;

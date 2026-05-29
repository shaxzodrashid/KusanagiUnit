// Structural Face Frame - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/face_frame.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_black_oxide) {
  return shape.color(color).material(material);
}

function makeFaceFrame() {
  // 1. Neck interface base mount (Z = -30 to Z = -15 in local coordinates)
  const neckCollar = metal(
    difference(
      cylinder(12, 85 / 2, undefined, 36),
      [
        cylinder(14, 70 / 2, undefined, 36).translate(0, 0, -1)
      ]
    ).translate(0, 0, -30),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Main vertical spine of the skull frame (spans Z = 10 to 180)
  const verticalSpine = metal(
    box(24, 28, 170).translate(0, -10, 10),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  // Left and Right support bars connecting neck collar to jaw cross beam
  const supportL = metal(
    box(6, 12, 40).translate(10, -38, -18),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );
  const supportR = metal(
    box(6, 12, 40).translate(-10, -38, -18),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  // 2. Eye Sockets / Brow Structure
  // Left eye socket collar (centered at X = 45, Y = 30, Z = 90)
  // Inner throat is oversized to preserve the documented ±18° eye yaw range.
  const leftEyeSocket = metal(
    difference(
      cylinder(20, 33.2, undefined, 32).pointAlong([0, 1, 0]).translate(45, 30, 90),
      [
        cylinder(22, 30.8, undefined, 32).pointAlong([0, 1, 0]).translate(45, 29, 90)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Right eye socket collar (centered at X = -45, Y = 30, Z = 90)
  const rightEyeSocket = metal(
    difference(
      cylinder(20, 33.2, undefined, 32).pointAlong([0, 1, 0]).translate(-45, 30, 90),
      [
        cylinder(22, 30.8, undefined, 32).pointAlong([0, 1, 0]).translate(-45, 29, 90)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Brow bridge is made from discrete ribs instead of a single heavily-cut plate.
  const browBar = metal(
    union(
      box(44, 12, 12).translate(45, 60, 100),
      box(44, 12, 12).translate(-45, 60, 100),
      box(20, 26, 12).translate(0, 45, 110)
    ),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  // 3. Temporal Side Plates & Temple Module Bosses (X = ±75, Y = -20, Z = 90)
  const templeBossL = metal(
    cylinder(4, 18, undefined, 24).pointAlong([1, 0, 0]).translate(62, -50, 90),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );
  const templeBossR = metal(
    cylinder(4, 18, undefined, 24).pointAlong([-1, 0, 0]).translate(-62, -50, 90),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );
 
  // Side brace bars linking temples to vertical spine (differenced with spine to prevent overlap)
  const sideBraceL = difference(
    metal(
      box(60, 8, 12).translate(38, -42, 90),
      COLORS.steel,
      MATERIALS.M_dark_brushed_metal
    ),
    [verticalSpine, templeBossL]
  );
  const sideBraceR = difference(
    metal(
      box(60, 8, 12).translate(-38, -42, 90),
      COLORS.steel,
      MATERIALS.M_dark_brushed_metal
    ),
    [verticalSpine, templeBossR]
  );

  // 4. Mandible/Lower Jaw Mount Hinge Brackets (X = ±55, Y = -20, Z = 10)
  const jawMountL = metal(
    box(10, 24, 30).translate(55, -20, 10),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );
  const jawMountR = metal(
    box(10, 24, 30).translate(-55, -20, 10),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );
  
  // Cross beam connecting jaw hinges to vertical spine (moved to Y = -28 and elevated to Z = 20-32 to clear side arms)
  const jawCrossBeam = difference(
    metal(
      box(112, 14, 16).translate(0, -28, 20),
      COLORS.steel,
      MATERIALS.M_dark_brushed_metal
    ),
    [verticalSpine, jawMountL, jawMountR, supportL, supportR]
  );

  // 5. Cranial Upper Rib Cage (rear skeletal silhouette, Z = 130 to Z = 220)
  // Ribs are built as flat horizontal rings lying in the XY plane to completely eliminate Z-overlap.
  // Subtracts vertical spine to maintain interlocking structure.
  const cranialRibTop = difference(
    metal(
      difference(
        cylinder(8, 52, undefined, 36),
        [
          cylinder(10, 46, undefined, 36).translate(0, 0, -1)
        ]
      ).translate(0, -20, 180),
      COLORS.steel,
      MATERIALS.M_dark_brushed_metal
    ),
    [verticalSpine]
  );
  
  const cranialRibMed = difference(
    metal(
      difference(
        cylinder(8, 68, undefined, 36),
        [
          cylinder(10, 62, undefined, 36).translate(0, 0, -1)
        ]
      ).translate(0, -20, 130),
      COLORS.steel,
      MATERIALS.M_dark_brushed_metal
    ),
    [verticalSpine]
  );

  return group(
    item("neck_collar", neckCollar),
    item("vertical_spine", verticalSpine),
    item("support_l", supportL),
    item("support_r", supportR),
    item("left_eye_socket", leftEyeSocket),
    item("right_eye_socket", rightEyeSocket),
    item("brow_bar", browBar),
    item("temple_boss_l", templeBossL),
    item("temple_boss_r", templeBossR),
    item("side_brace_l", sideBraceL),
    item("side_brace_r", sideBraceR),
    item("jaw_mount_l", jawMountL),
    item("jaw_mount_r", jawMountR),
    item("jaw_cross_beam", jawCrossBeam),
    item("cranial_rib_top", cranialRibTop),
    item("cranial_rib_med", cranialRibMed)
  ).withConnectors({
    roll_axis: connector("neck-roll", { origin: [0, 0, 0], axis: [0, -1, 0], kind: "revolute" }),
    left_eye_yaw: connector({ origin: [45, 30, 90], axis: [0, 0, 1] }),
    right_eye_yaw: connector({ origin: [-45, 30, 90], axis: [0, 0, 1] }),
    jaw_pitch: connector({ origin: [0, -20, 10], axis: [1, 0, 0] }),
  }).translate(0, 0, HEAD_BASE_Z);
}

const faceFrame = makeFaceFrame();
return faceFrame;

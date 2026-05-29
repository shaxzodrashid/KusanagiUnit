// Optical Pod (Eye) module - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/eye.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

const side = Param.choice("Side", "left", ["left", "right"]);
const sideSign = side === "left" ? 1 : -1;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_black_oxide) {
  return shape.color(color).material(material);
}

function centeredBox(w, d, h) {
  return box(w, d, h).translate(0, 0, -h / 2);
}

function railSegment(name, x, z) {
  return item(
    name,
    metal(
      centeredBox(4, 16, 2.4).translate(x, -35, z),
      COLORS.chrome,
      MATERIALS.M_neck_bearing
    )
  );
}

function shockMount(name, x, y, z) {
  return item(
    name,
    metal(
      cylinder(4, 2.4, undefined, 16).pointAlong([0, 1, 0]).translate(x, y, z),
      COLORS.fastenerDark,
      MATERIALS.M_fastener_dark
    )
  );
}

function irisVane(name, x, z, angleDeg) {
  return item(
    name,
    metal(
      centeredBox(10, 2.2, 3.0).rotateY(angleDeg).translate(x, 18.5, z),
      COLORS.black,
      MATERIALS.M_black_oxide
    )
  );
}

function makeEyeYawHub() {
  // Yaw gimbal ring centered around the optical center
  // Rotated along Y-axis (pointAlong([0, 1, 0])) and shifted slightly in Y to surround the barrel cleanly
  const yawRing = metal(
    difference(
      cylinder(8, 27.5, undefined, 24).pointAlong([0, 1, 0]).translate(0, -6, 0),
      [
        cylinder(10, 24.5, undefined, 24).pointAlong([0, 1, 0]).translate(0, -7, 0)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  return group(item("yaw_ring", yawRing)).withConnectors({
    yaw_axis: connector("eye-yaw", { origin: [0, 0, 0], axis: [0, 0, 1], kind: "revolute" }),
    pitch_axis: connector("eye-pitch", { origin: [0, 0, 0], axis: [1, 0, 0], kind: "revolute" }),
  }).translate(0, 0, HEAD_BASE_Z);
}

function makeEyePod() {
  const outerRadius = 20; // Ø40 mm lens diameter
  const podLength = 36;

  // Main camera barrel housing running along Y-axis (Y is forward)
  // Translated by -38 so it spans Y from -38 to -2 (coincident and flush with retainer ring at Y = -2)
  // Hollowed out internally by 2.0mm to prevent collision with the inner lens
  const barrel = metal(
    difference(
      cylinder(podLength, outerRadius, undefined, 32).pointAlong([0, 1, 0]).translate(0, -podLength - 2, 0),
      [
        cylinder(podLength + 2, outerRadius - 2.0, undefined, 32).pointAlong([0, 1, 0]).translate(0, -podLength - 3, 0)
      ]
    ),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );

  // Front camera aperture ring
  // Inner radius increased to 18.0mm to prevent 3D collision with the convex cover lens (radius 17.5mm)
  const retainerRing = metal(
    difference(
      cylinder(4, outerRadius, undefined, 32).pointAlong([0, 1, 0]).translate(0, -2, 0),
      [
        cylinder(6, 18.0, undefined, 32).pointAlong([0, 1, 0]).translate(0, -3, 0)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Emissive blue optical sensor ring inside the lens retainer
  const ledRing = metal(
    torus(outerRadius - 4, 1.2, 24).rotateX(90).translate(0, -1.5, 0),
    COLORS.eyes,
    MATERIALS.M_eye_blue_emissive
  );

  // Convex glass cover lens at the front (dome shape, Y >= 0)
  const lens = difference(
    sphere(outerRadius - 2.5),
    [
      box(45, 45, 45).translate(0, -22.5, -22.5)
    ]
  )
    .scale(1.0, 0.35, 1.0)
    .color(COLORS.eyeGlass)
    .material(MATERIALS.M_eye_glass);

  // Rear sensor cooling block
  const heatSink = metal(
    box(24, 12, 24).translate(0, -podLength - 8, 0),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  const focusDrive = metal(
    centeredBox(10, 12, 4).translate(0, -35, 28),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  const lowerLinearGuide = metal(
    centeredBox(24, 12, 3).translate(0, -35, -24.5),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  const leftTrunnion = metal(
    cylinder(5, 3.2, undefined, 18).pointAlong([1, 0, 0]).translate(-25.5, -30, 0),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  const rightTrunnion = metal(
    cylinder(5, 3.2, undefined, 18).pointAlong([1, 0, 0]).translate(20.5, -30, 0),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  const rearCablePort = metal(
    difference(
      cylinder(5, 6, undefined, 20).pointAlong([0, 1, 0]).translate(0, -62, -14),
      [
        cylinder(7, 3.4, undefined, 20).pointAlong([0, 1, 0]).translate(0, -63, -14)
      ]
    ),
    COLORS.blackOxide,
    MATERIALS.M_black_oxide
  );

  const rearLatch = metal(
    centeredBox(16, 3, 7).translate(0, -57.5, 25.5),
    COLORS.fastenerDark,
    MATERIALS.M_fastener_dark
  );

  const sideSensor = side === "left"
    ? metal(
      cylinder(2.8, 2.6, undefined, 16).pointAlong([0, 1, 0]).translate(-12, 12.6, -13.5),
      COLORS.eyes,
      MATERIALS.M_eye_blue_emissive
    )
    : metal(
      difference(
        cylinder(2.8, 3.4, undefined, 18).pointAlong([0, 1, 0]).translate(12, 12.8, -13.5),
        [
          cylinder(3.2, 1.6, undefined, 14).pointAlong([0, 1, 0]).translate(12, 12.6, -13.5)
        ]
      ),
      COLORS.darkMetal,
      MATERIALS.M_black_oxide
    );

  const calibrationPort = side === "left"
    ? metal(
      difference(
        cylinder(2.5, 3.3, undefined, 18).pointAlong([0, 1, 0]).translate(12, 12.7, 13.5),
        [
          cylinder(3.0, 1.5, undefined, 14).pointAlong([0, 1, 0]).translate(12, 12.5, 13.5)
        ]
      ),
      COLORS.darkMetal,
      MATERIALS.M_black_oxide
    )
    : metal(
      cylinder(2.8, 2.5, undefined, 16).pointAlong([0, 1, 0]).translate(-12, 12.6, 13.5),
      COLORS.eyes,
      MATERIALS.M_eye_blue_emissive
    );

  return group(
    item("eye_barrel", barrel),
    item("lens_retainer", retainerRing),
    item("emissive_ring", ledRing),
    item("optical_lens", lens),
    item("rear_heatsink", heatSink),
    railSegment("autofocus_rail_left", -9, 27),
    railSegment("autofocus_rail_right", 9, 27),
    item("autofocus_drive_carriage", focusDrive),
    item("lower_linear_guide", lowerLinearGuide),
    item("pitch_trunnion_left", leftTrunnion),
    item("pitch_trunnion_right", rightTrunnion),
    shockMount("shock_mount_upper_left", -23.5, -20, 18.8),
    shockMount("shock_mount_upper_right", 23.5, -20, 18.8),
    shockMount("shock_mount_lower_left", -23.5, -20, -18.8),
    shockMount("shock_mount_lower_right", 23.5, -20, -18.8),
    irisVane("iris_vane_top", 0, 14.4, 0),
    irisVane("iris_vane_upper_left", -11.5, 7.6, -24),
    irisVane("iris_vane_upper_right", 11.5, 7.6, 24),
    item("auxiliary_sensor_port", sideSensor),
    item("calibration_sensor_port", calibrationPort),
    item("rear_cable_socket", rearCablePort),
    item("rear_service_latch", rearLatch)
  ).withConnectors({
    pitch_axis: connector("eye-pitch", { origin: [0, 0, 0], axis: [-1, 0, 0], kind: "revolute" }),
  }).translate(0, 0, HEAD_BASE_Z);
}

return {
  yawHub: makeEyeYawHub(),
  pod: makeEyePod()
};

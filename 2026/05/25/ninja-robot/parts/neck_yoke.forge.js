// Neck intermediate pitch/roll yoke for the robot head
// Path: 2026/05/25/ninja-robot/parts/neck_yoke.forge.js

const { COLORS, MATERIALS, DIMS } = require("../lib/constants.js");

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [100, -150, 70], target: [0, 0, 0], fov: 38 },
  environment: { preset: "studio", intensity: 0.3 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.2 },
    { type: "directional", position: [120, -150, 190], color: "#ffffff", intensity: 1.5, castShadow: true },
  ],
});

function makeNeckYoke() {
  // Pitch cylinder tongue that fits between the neck cheeks
  const pitchTongue = cylinder(76, 22, undefined, 48)
    .pointAlong([1, 0, 0])
    .translate(-38, 0, 0)
    .color(COLORS.darkMetal)
    .material(MATERIALS.M_black_oxide);

  // Pitch bore hole through which the pitch pin passes
  const pitchBore = cylinder(92, 7.2, undefined, 32)
    .pointAlong([1, 0, 0])
    .translate(-46, 0, 0);

  // Roll shaft extending forward/backward along the Y axis
  const rollShaft = cylinder(64, 12, undefined, 36)
    .pointAlong([0, 1, 0])
    .translate(0, -64, 0) // Shifted back to Y = -64 (spans Y = -64 to 0) to align with roll hub
    .color(COLORS.chrome)
    .material(MATERIALS.M_neck_bearing);

  // Central reinforcing block joining the pitch tongue and roll shaft
  const centerBlock = box(28, 28, 28)
    .translate(0, 10, -14)
    .color(COLORS.steel)
    .material(MATERIALS.M_dark_brushed_metal);

  // Decorative brass collar on the roll shaft
  const collar = torus(16, 2.5, 32)
    .rotateX(90)
    .translate(0, -61, 0) // Shifted to Y = -61 to sit behind the hub (between -63.5 and -58.5)
    .color(COLORS.brass)
    .material(MATERIALS.M_dark_brushed_metal);

  // Assemble the body using booleans to ensure connectivity and resolve overlapping volumes
  const yokeBase = union(pitchTongue, centerBlock);
  const yokeWithShaft = union(yokeBase, rollShaft);
  const finalYoke = difference(yokeWithShaft, pitchBore);

  return group(
    { name: "yoke_structural_body", shape: finalYoke },
    { name: "yoke_decorative_collar", shape: collar }
  ).withConnectors({
    pitch_axis: connector("neck-pitch", { origin: [0, 0, 0], axis: [-1, 0, 0], kind: "revolute" }),
    roll_axis: connector("neck-roll", { origin: [0, -22, 0], axis: [0, 1, 0], kind: "revolute" }),
  });
}

return makeNeckYoke();

// Ninja Robot - back-mounted sheathed katana module
// Path: 2026/05/25/ninja-robot/parts/sword.forge.js

const { COLORS, DIMS } = require("../lib/constants.js");

scene({
  background: { top: "#1a1a2e", bottom: "#0a0a14" },
  camera: { position: [420, 520, 340], target: [0, 0, 40], fov: 38 },
  environment: { preset: "studio", intensity: 0.25 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.18 },
    { type: "directional", position: [140, 200, 260], color: "#ffffff", intensity: 1.6, castShadow: true },
  ],
});

function makeSheathedKatana() {
  const sheathLen = DIMS.sword.bladeLength + 180;
  const handleLen = DIMS.sword.handleLength;
  const sheathStart = -180;
  const handleStart = sheathStart - handleLen + 18;

  const sheath = cylinder(sheathLen, 24, 20, 32)
    .translate(0, 0, sheathStart)
    .color(COLORS.fabric);
  const spineLine = box(8, 7, sheathLen - 70)
    .translate(0, -21, sheathStart + sheathLen / 2 + 16)
    .color("#2f3439");
  const throat = cylinder(34, 29, undefined, 32)
    .translate(0, 0, sheathStart - 10)
    .color(COLORS.gold);
  const endCap = cylinder(30, 22, undefined, 32)
    .translate(0, 0, sheathStart + sheathLen)
    .color(COLORS.gold);

  const handle = cylinder(handleLen, 17, undefined, 24)
    .translate(0, 0, handleStart)
    .color(COLORS.fabric);
  const guard = cylinder(10, DIMS.sword.guardRadius, undefined, 6)
    .rotateZ(30)
    .translate(0, 0, sheathStart - 22)
    .color(COLORS.gold);
  const pommel = cylinder(18, 19, undefined, 24)
    .translate(0, 0, handleStart - 18)
    .color(COLORS.gold);

  const wrapA = box(44, 8, 22).rotateZ(28).translate(0, 0, handleStart + 48).color(COLORS.accent);
  const wrapB = box(44, 8, 22).rotateZ(-28).translate(0, 0, handleStart + 96).color(COLORS.accent);
  const wrapC = box(44, 8, 22).rotateZ(28).translate(0, 0, handleStart + 144).color(COLORS.accent);

  const backClampA = box(92, 28, 22)
    .translate(0, 22, sheathStart + 210)
    .color(COLORS.accent);
  const backClampB = box(92, 28, 22)
    .translate(0, 22, sheathStart + 510)
    .color(COLORS.accent);
  const standoffA = box(44, 42, 14)
    .translate(0, 48, sheathStart + 210)
    .color(COLORS.skeleton);
  const standoffB = box(44, 42, 14)
    .translate(0, 48, sheathStart + 510)
    .color(COLORS.skeleton);

  return group(
    { name: "sheath_body", shape: sheath },
    { name: "sheath_spine", shape: spineLine },
    { name: "throat", shape: throat },
    { name: "end_cap", shape: endCap },
    { name: "handle", shape: handle },
    { name: "guard", shape: guard },
    { name: "pommel", shape: pommel },
    { name: "wrap_a", shape: wrapA },
    { name: "wrap_b", shape: wrapB },
    { name: "wrap_c", shape: wrapC },
    { name: "back_clamp_a", shape: backClampA },
    { name: "back_clamp_b", shape: backClampB },
    { name: "standoff_a", shape: standoffA },
    { name: "standoff_b", shape: standoffB }
  ).rotateY(36);
}

const katana = makeSheathedKatana().withConnectors({
  back_mount: connector({ origin: [0, 0, 0], axis: [0, 1, 0] }),
});

return katana;

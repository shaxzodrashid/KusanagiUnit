// Professional mechanical/anatomical endoskeleton arm
// Public arm assembly entry point. Implementation is split into shoulder, elbow, and wrist modules.

const { DIMS } = require("../lib/constants.js");

const side = Param.choice("Side", "left", ["left", "right"]);

const shoulder = require("./arm/shoulder.forge.js", { Side: side });
const elbow = require("./arm/elbow.forge.js", { Side: side });
const wrist = require("./arm/wrist.forge.js", { Side: side });

scene({
  background: { top: "#0b0c10", bottom: "#1f2833" },
  camera: { position: [300, -430, 60], target: [0, 0, -245], fov: 40 },
  environment: { preset: "studio", intensity: 0.28 },
  lights: [
    { type: "ambient", color: "#c8cdd4", intensity: 0.18 },
    { type: "directional", position: [130, -170, 180], color: "#ffffff", intensity: 1.6, castShadow: true },
    { type: "directional", position: [-180, 160, 120], color: "#9ee7ff", intensity: 0.45 },
  ],
});

function addControllerSet(model, controls) {
  let controlled = model;
  for (const control of controls) {
    controlled = controlled.connect(control.parentConnector, control.childConnector, {
      as: control.name,
      min: control.min,
      max: control.max,
      default: control.defaultValue,
    });
  }
  return controlled;
}

const arm = addControllerSet(
  assembly(`Ninja Robot ${side} Arm`)
    .addPart("Shoulder Hub", shoulder.hub, {
      metadata: shoulder.metadata.hub,
    })
    .addPart("Shoulder Yaw Joint", shoulder.yawJoint)
    .addPart("Shoulder Roll Joint", shoulder.rollJoint)
    .addPart("Upper Arm", shoulder.upperArm, {
      metadata: shoulder.metadata.upperArm,
    })
    .addPart("Forearm", elbow.forearm, {
      metadata: elbow.metadata.forearm,
    })
    .addPart("Wrist Hub", wrist.hub)
    .addPart("Hand", wrist.hand, {
      metadata: wrist.metadata.hand,
    }),
  [
    ...shoulder.controls.joints,
    ...elbow.controls.joints,
    ...wrist.controls.joints,
  ]
);

verify.inRange("upper arm length remains professional humanoid scale", DIMS.upperArm.length, 320, 460);
verify.inRange("forearm length remains professional humanoid scale", DIMS.forearm.length, 280, 420);

return arm;

// Professional Head Assembly module for the humanoid robot
// Path: 2026/05/25/ninja-robot/parts/head.forge.js

const { COLORS, JOINTS, DIMS } = require("../lib/constants.js");

const faceFrame = require("./head/face_frame.forge.js");
const cranialShell = require("./head/cranial_shell.forge.js");
const leftEye = require("./head/eye.forge.js", { Side: "left" });
const rightEye = require("./head/eye.forge.js", { Side: "right" });
const noseVent = require("./head/nose_vent.forge.js");
const mandible = require("./head/mandible.forge.js");
const leftTemple = require("./head/temple_module.forge.js", { Side: "left" });
const rightTemple = require("./head/temple_module.forge.js", { Side: "right" });
const cables = require("./head/cables.forge.js");

// View settings for standalone visualization (my-part.forge.js)
scene({
  background: { top: "#08090c", bottom: "#020204" },
  camera: { position: [0, 480, 90], target: [0, 0, 90], up: [0, 0, 1], fov: 36 },
  environment: { preset: "studio", intensity: 0.35 },
  lights: [
    { type: "ambient", color: "#dfe6e9", intensity: 0.2 },
    { type: "directional", position: [250, 300, 200], color: "#ffffff", intensity: 2.8, castShadow: true },
    { type: "directional", position: [-250, 300, 100], color: "#ffffff", intensity: 1.0 },
    { type: "directional", position: [0, -300, 150], color: "#00e5ff", intensity: 0.8 }, // glowing rim light
  ],
  postProcessing: {
    bloom: { intensity: 0.15, threshold: 0.85, radius: 0.35 },
    vignette: { darkness: 0.4, offset: 0.4 },
  }
});

function makeHeadAssembly() {
  const headModel = assembly("Ninja Robot Head")
    .addPart("HeadFrame", faceFrame, {
      metadata: { material: "CNC-machined aluminum skeleton", process: "structural skeleton" }
    })
    .addPart("CranialShell", cranialShell, {
      metadata: { material: "dark anodized aluminum segmented shell", process: "protective casing" }
    })
    .addPart("LeftEyeYawHub", leftEye.yawHub)
    .addPart("LeftEyePod", leftEye.pod, {
      metadata: { material: "machined aluminum, sapphire lens, blue LED ring", process: "active optical pod" }
    })
    .addPart("RightEyeYawHub", rightEye.yawHub)
    .addPart("RightEyePod", rightEye.pod, {
      metadata: { material: "machined aluminum, sapphire lens, blue LED ring", process: "depth optical pod" }
    })
    .addPart("CentralNoseVent", noseVent, {
      metadata: { material: "black oxide interior vent", process: "acoustic intake and exhaust" }
    })
    .addPart("Mandible", mandible, {
      metadata: { material: "stainless steel heat sink ribs and plates", process: "articulating lower jaw" }
    })
    .addPart("LeftTempleModule", leftTemple, {
      metadata: { material: "concentric sensor ring", process: "proximity and audio port" }
    })
    .addPart("RightTempleModule", rightTemple, {
      metadata: { material: "concentric sensor ring", process: "proximity and audio port" }
    })
    .addPart("CableHarness", cables, {
      metadata: { material: "braided PTFE and rubber conduit", process: "signal and power routing" }
    });

  // Connect optical pod gimbals
  let riggedHead = headModel
    .connect("HeadFrame.left_eye_yaw", "LeftEyeYawHub.yaw_axis", {
      as: "leftEyeYaw",
      min: JOINTS.eyes.yawMin,
      max: JOINTS.eyes.yawMax,
      default: 0,
    })
    .connect("LeftEyeYawHub.pitch_axis", "LeftEyePod.pitch_axis", {
      as: "leftEyePitch",
      min: JOINTS.eyes.pitchMin,
      max: JOINTS.eyes.pitchMax,
      default: 0,
    })
    .connect("HeadFrame.right_eye_yaw", "RightEyeYawHub.yaw_axis", {
      as: "rightEyeYaw",
      min: JOINTS.eyes.yawMin,
      max: JOINTS.eyes.yawMax,
      default: 0,
    })
    .connect("RightEyeYawHub.pitch_axis", "RightEyePod.pitch_axis", {
      as: "rightEyePitch",
      min: JOINTS.eyes.pitchMin,
      max: JOINTS.eyes.pitchMax,
      default: 0,
    });

  // Connect active mandible (articulating jaw)
  riggedHead = riggedHead.connect("HeadFrame.jaw_pitch", "Mandible.pitch_axis", {
    as: "jawPitch",
    min: JOINTS.mandible.pitchMin,
    max: JOINTS.mandible.pitchMax,
    default: 0,
  });

  // Connect static parts rigidly to the head frame to form a single rigid component tree
  riggedHead = riggedHead
    .addFixed("fixed_shell", "HeadFrame", "CranialShell")
    .addFixed("fixed_nose", "HeadFrame", "CentralNoseVent")
    .addFixed("fixed_temple_l", "HeadFrame", "LeftTempleModule")
    .addFixed("fixed_temple_r", "HeadFrame", "RightTempleModule")
    .addFixed("fixed_cables", "HeadFrame", "CableHarness");

  // Set default view / joints state for studio rendering
  riggedHead.toJointsView({
    defaults: {
      leftEyeYaw: 0,
      leftEyePitch: 0,
      rightEyeYaw: 0,
      rightEyePitch: 0,
      jawPitch: 0
    }
  });

  return riggedHead;
}

const headAssembly = makeHeadAssembly();
const headRest = headAssembly.solve().toGroup();

// Mechanical validation checks
verify.inRange("head height is mechanically consistent", DIMS.head.height, 250, 270);
verify.inRange("head width is mechanically consistent", DIMS.head.width, 150, 170);
verify.inRange("head depth is mechanically consistent", DIMS.head.depth, 175, 185);
verify.inRange("eye spacing is mechanically consistent", DIMS.head.eyeCenterSpacing, 85, 95);
verify.inRange("eye lens diameter is mechanically consistent", DIMS.head.eyeLensDiameter, 39, 41);
verify.boundingBoxSize("assembled head envelope matches the mechanical control size", headRest, [184, 177, 258], 6);

return headAssembly;

// Articulated Mechanical Endoskeleton - main assembly
// Path: 2026/05/25/ninja-robot/main.forge.js

const { COLORS, JOINTS } = require("./lib/constants.js");

const torso = require("./parts/torso.forge.js");
const neck = require("./parts/neck.forge.js");
const neckYoke = require("./parts/neck_yoke.forge.js");
const head = require("./parts/head.forge.js");
const leftArm = require("./parts/arm.forge.js", { Side: "left" });
const rightArm = require("./parts/arm.forge.js", { Side: "right" });
const leftLeg = require("./parts/leg.forge.js", { Side: "left" });
const rightLeg = require("./parts/leg.forge.js", { Side: "right" });

scene({
  background: { top: "#08090c", bottom: "#020204" },
  camera: { position: [0, 2200, -70], target: [0, 0, -70], fov: 38 },
  environment: { preset: "studio", intensity: 0.35 },
  lights: [
    { type: "ambient", color: "#dfe6e9", intensity: 0.15 },
    { type: "directional", position: [500, 600, 400], color: "#ffffff", intensity: 3.5, castShadow: true },
    { type: "directional", position: [-500, 600, 200], color: "#ffffff", intensity: 1.2 },
    { type: "directional", position: [0, -600, 300], color: "#00e5ff", intensity: 0.7 }, // subtle cyan rim/backlight
  ],
  ground: { visible: true, color: "#050608", height: -800, receiveShadow: true },
  postProcessing: {
    bloom: { intensity: 0.12, threshold: 0.88, radius: 0.3 },
    vignette: { darkness: 0.45, offset: 0.36 },
    toneMappingExposure: 1.15,
  },
  views: {
    hero: {
      camera: { position: [0, 2200, -70], target: [0, 0, -70], up: [0, 0, 1], fov: 38 },
    },
    front: {
      camera: { position: [0, 2200, -70], target: [0, 0, -70], up: [0, 0, 1], fov: 38 },
    },
    back: {
      camera: { position: [0, -2200, -70], target: [0, 0, -70], up: [0, 0, 1], fov: 38 },
    },
    side: {
      camera: { position: [2200, 0, -70], target: [0, 0, -70], up: [0, 0, 1], fov: 38 },
    },
  },
});

let robot = assembly("Mechanical Endoskeleton")
  .addPart("Torso", torso, {
    metadata: { material: "chrome-plated mechanical chassis", process: "mechanical skeleton" },
  })
  .addPart("Neck Turntable", neck, {
    metadata: { material: "steel bearing stack, cable pass-through", process: "machined prototype assembly" },
  })
  .addPart("Neck Yoke", neckYoke, {
    metadata: { material: "steel pitch/roll yoke", process: "machined prototype assembly" },
  });

robot = head.mergeInto(robot, {
  prefix: "Head"
});

robot = robot
  .connect("Torso.neck", "Neck Turntable.yaw_axis", {
    as: "neckYaw",
    min: JOINTS.neck.yawMin,
    max: JOINTS.neck.yawMax,
    default: 0,
  })
  .connect("Neck Turntable.pitch_axis", "Neck Yoke.pitch_axis", {
    as: "neckPitch",
    min: JOINTS.neck.pitchMin,
    max: JOINTS.neck.pitchMax,
    default: 0,
  })
  .connect("Neck Yoke.roll_axis", "Head.HeadFrame.roll_axis", {
    as: "neckRoll",
    min: JOINTS.neck.rollMin,
    max: JOINTS.neck.rollMax,
    default: 0,
  });

robot = leftArm.mergeInto(robot, {
  prefix: "Left Arm",
  mountParent: "Torso",
  mountJoint: "leftArmMount",
  mountOptions: { frame: Transform.identity().translate(225, 15, 555) },
});

robot = rightArm.mergeInto(robot, {
  prefix: "Right Arm",
  mountParent: "Torso",
  mountJoint: "rightArmMount",
  mountOptions: { frame: Transform.identity().translate(-225, 15, 555) },
});

robot = leftLeg.mergeInto(robot, {
  prefix: "Left Leg",
  mountParent: "Torso",
  mountJoint: "leftLegMount",
  mountOptions: { frame: Transform.identity().translate(140, 0, 45) },
});

robot = rightLeg.mergeInto(robot, {
  prefix: "Right Leg",
  mountParent: "Torso",
  mountJoint: "rightLegMount",
  mountOptions: { frame: Transform.identity().translate(-140, 0, 45) },
});

robot.toJointsView({
  defaults: {
    neckYaw: 0,
    neckPitch: 0,
    neckRoll: 0,
    "Head.jawPitch": 0,
    "Head.leftEyeYaw": 0,
    "Head.leftEyePitch": 0,
    "Head.rightEyeYaw": 0,
    "Head.rightEyePitch": 0,
    "Left Arm.shoulderPitch": 0,
    "Left Arm.shoulderRoll": 5,
    "Left Arm.elbowPitch": 8,
    "Left Arm.wristYaw": 0,
    "Left Arm.wristRoll": 0,
    "Right Arm.shoulderPitch": 0,
    "Right Arm.shoulderRoll": 5,
    "Right Arm.elbowPitch": 8,
    "Right Arm.wristYaw": 0,
    "Right Arm.wristRoll": 0,
    "Left Leg.hipPitch": 0,
    "Left Leg.kneePitch": 0,
    "Left Leg.anklePitch": 0,
    "Right Leg.hipPitch": 0,
    "Right Leg.kneePitch": 0,
    "Right Leg.anklePitch": 0,
  },
  animations: [
    {
      name: "Idle Scan",
      duration: 3.0,
      loop: true,
      keyframes: [
        {
          values: {
            neckYaw: -15,
            neckPitch: -4,
            neckRoll: -5,
            "Left Arm.shoulderRoll": 10,
            "Right Arm.shoulderRoll": 10,
            "Head.leftEyeYaw": -8,
            "Head.leftEyePitch": -4,
            "Head.rightEyeYaw": -8,
            "Head.rightEyePitch": -4,
            "Head.jawPitch": 1,
          },
        },
        {
          values: {
            neckYaw: 15,
            neckPitch: 6,
            neckRoll: 5,
            "Left Arm.shoulderRoll": -5,
            "Right Arm.shoulderRoll": -5,
            "Head.leftEyeYaw": 8,
            "Head.leftEyePitch": 4,
            "Head.rightEyeYaw": 8,
            "Head.rightEyePitch": 4,
            "Head.jawPitch": 0,
          },
        },
        {
          values: {
            neckYaw: -15,
            neckPitch: -4,
            neckRoll: -5,
            "Left Arm.shoulderRoll": 10,
            "Right Arm.shoulderRoll": 10,
            "Head.leftEyeYaw": -8,
            "Head.leftEyePitch": -4,
            "Head.rightEyeYaw": -8,
            "Head.rightEyePitch": -4,
            "Head.jawPitch": 1,
          },
        },
      ],
    },
    {
      name: "Full 360 Neck Rotation",
      duration: 4.0,
      loop: true,
      continuous: true,
      keyframes: [
        { values: { neckYaw: 0, neckPitch: 0 } },
        { values: { neckYaw: 120, neckPitch: 0 } },
        { values: { neckYaw: 240, neckPitch: 0 } },
        { values: { neckYaw: 360, neckPitch: 0 } },
      ],
    },
    {
      name: "Chin Raise Lower",
      duration: 2.4,
      loop: true,
      keyframes: [
        { values: { neckPitch: JOINTS.neck.pitchMin } },
        { values: { neckPitch: JOINTS.neck.pitchMax } },
        { values: { neckPitch: 0 } },
      ],
    },
    {
      name: "Focus Lock",
      duration: 2.0,
      loop: true,
      keyframes: [
        {
          values: {
            neckYaw: 0,
            neckPitch: 2,
            neckRoll: 0,
            "Head.leftEyeYaw": 3,
            "Head.rightEyeYaw": -3,
            "Head.leftEyePitch": 0,
            "Head.rightEyePitch": 0,
            "Head.jawPitch": 0,
          },
        },
      ],
    },
    {
      name: "Jaw Speech Motion",
      duration: 1.6,
      loop: true,
      keyframes: [
        { values: { "Head.jawPitch": 0 } },
        { values: { "Head.jawPitch": 18 } },
        { values: { "Head.jawPitch": 4 } },
        { values: { "Head.jawPitch": 22 } },
        { values: { "Head.jawPitch": 2 } },
        { values: { "Head.jawPitch": 15 } },
        { values: { "Head.jawPitch": 0 } },
      ],
    },
  ],
});

return robot.solve();

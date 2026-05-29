// Temple Side Module - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/temple_module.forge.js

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

function makeTempleModule() {
  const xPos = sideSign * 76;
  const yPos = -38;
  const zPos = 90;

  // Micro-sensor indicators (gold accents, shifted slightly outward to clear innerRing)
  const proximitySensorShape = cylinder(3, 1.8, undefined, 12).pointAlong([sideSign, 0, 0]).translate(xPos + sideSign * 11, yPos + 13, zPos + 13);
  const proximitySensor = metal(
    proximitySensorShape,
    COLORS.gold
  );

  // Fasteners on outer ring (recessed into flange)
  const screwShapes = [];
  const screws = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const r = 21;
    const screwShape = cylinder(3, 1.2, undefined, 12)
      .pointAlong([sideSign, 0, 0])
      .translate(xPos - sideSign * 2.5, yPos + Math.cos(angle) * r, zPos + Math.sin(angle) * r);
    
    screwShapes.push(screwShape);
    screws.push(
      item(
        `fastener_${i}`,
        metal(
          screwShape,
          COLORS.fastenerDark,
          MATERIALS.M_fastener_dark
        )
      )
    );
  }

  // Concentric outer mounting ring flange (with holes differenced out for fasteners and sensor)
  const outerFlange = metal(
    difference(
      cylinder(8, 25, undefined, 24).pointAlong([sideSign, 0, 0]).translate(xPos - sideSign * 4, yPos, zPos),
      [
        cylinder(10, 13.5, undefined, 24).pointAlong([sideSign, 0, 0]).translate(xPos - sideSign * 5, yPos, zPos),
        proximitySensorShape,
        ...screwShapes
      ]
    ),
    COLORS.darkBrushedMetal,
    MATERIALS.M_dark_brushed_metal
  );

  // Concentric inner audio sensor ring (hollowed out to prevent collision with centerPort)
  const innerRing = metal(
    difference(
      cylinder(5, 15, undefined, 24).pointAlong([sideSign, 0, 0]).translate(xPos + sideSign * 6, yPos, zPos),
      [
        cylinder(7, 8.5, undefined, 24).pointAlong([sideSign, 0, 0]).translate(xPos + sideSign * 5, yPos, zPos)
      ]
    ),
    COLORS.darkMetal,
    MATERIALS.M_black_oxide
  );

  // Center auxiliary data port / speaker
  const centerPort = metal(
    cylinder(4, 8, undefined, 24).pointAlong([sideSign, 0, 0]).translate(xPos + sideSign * 12, yPos, zPos),
    COLORS.chrome,
    MATERIALS.M_neck_bearing
  );

  const serviceDoor = metal(
    box(1.6, 20, 9).translate(xPos + sideSign * 12, yPos - 24, zPos - 5),
    COLORS.blackOxide,
    MATERIALS.M_black_oxide
  );

  const statusLed = metal(
    cylinder(3, 2.0, undefined, 12).pointAlong([sideSign, 0, 0]).translate(xPos + sideSign * 12, yPos + 4, zPos - 17),
    COLORS.eyes,
    MATERIALS.M_eye_blue_emissive
  );

  return group(
    item("outer_flange", outerFlange),
    item("inner_ring", innerRing),
    item("center_port", centerPort),
    item("proximity_sensor", proximitySensor),
    item("service_door", serviceDoor),
    item("status_led", statusLed),
    ...screws
  ).translate(0, 0, HEAD_BASE_Z);
}

const templeModule = makeTempleModule();
return templeModule;

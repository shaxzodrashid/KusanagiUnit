// Central Nose Vent Assembly - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/nose_vent.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.chrome, material = MATERIALS.M_black_oxide) {
  return shape.color(color).material(material);
}

function makeNoseVent() {
  const noseCenter = [0, 58, 70];

  // Main nose housing block
  const outerBlock = metal(
    box(22, 20, 34).translate(...noseCenter),
    COLORS.steel,
    MATERIALS.M_dark_brushed_metal
  );

  // Recessed nostril cavities
  const leftNostril = box(4.6, 14, 24).translate(5.5, 61, 70);
  const rightNostril = box(4.6, 14, 24).translate(-5.5, 61, 70);

  const hollowHousing = difference(outerBlock, [leftNostril, rightNostril]);

  // Internal grilles / acoustic baffles inside the cavities
  const baffles = [];
  for (let zOffset = -8; zOffset <= 8; zOffset += 4) {
    baffles.push(
      item(
        `baffle_l_${zOffset}`,
        metal(
          box(4.6, 2.4, 2.0).translate(5.5, 62, 70 + zOffset),
          COLORS.darkMetal,
          MATERIALS.M_black_oxide
        )
      ),
      item(
        `baffle_r_${zOffset}`,
        metal(
          box(4.6, 2.4, 2.0).translate(-5.5, 62, 70 + zOffset),
          COLORS.darkMetal,
          MATERIALS.M_black_oxide
        )
      )
    );
  }

  // Micro-sensor / mic-array ports at the base of the nose bridge
  const micSensorL = metal(
    cylinder(4, 1.5, undefined, 12).pointAlong([0, 1, 0]).translate(8, 66, 56),
    COLORS.brass
  );
  
  const micSensorR = metal(
    cylinder(4, 1.5, undefined, 12).pointAlong([0, 1, 0]).translate(-8, 66, 56),
    COLORS.brass
  );

  return group(
    item("housing", hollowHousing),
    item("sensor_l", micSensorL),
    item("sensor_r", micSensorR),
    ...baffles
  ).translate(0, 0, HEAD_BASE_Z);
}

const noseVent = makeNoseVent();
return noseVent;

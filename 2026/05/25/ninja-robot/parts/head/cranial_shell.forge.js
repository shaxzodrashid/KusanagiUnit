// Cranial Access Shell - Kusanagi Unit
// Path: 2026/05/25/ninja-robot/parts/head/cranial_shell.forge.js

const { COLORS, MATERIALS } = require("../../lib/constants.js");
const HEAD_BASE_Z = 32;

function item(name, shape) {
  return { name, shape };
}

function metal(shape, color = COLORS.darkBrushedMetal, material = MATERIALS.M_dark_brushed_metal) {
  return shape.color(color).material(material);
}

function servicePlate(name, width, depth, height, position, rotation = [0, 0, 0], color = COLORS.darkBrushedMetal) {
  const plate = box(width, depth, height)
    .rotateX(rotation[0])
    .rotateY(rotation[1])
    .rotateZ(rotation[2])
    .translate(...position);

  return item(name, metal(plate, color, MATERIALS.M_dark_brushed_metal));
}

function panelScrew(name, position, axis = [0, 1, 0]) {
  return item(
    name,
    metal(
      cylinder(3, 1.4, undefined, 12).pointAlong(axis).translate(...position),
      COLORS.fastenerDark,
      MATERIALS.M_fastener_dark
    )
  );
}

function makeCranialShell() {
  const shellCenter = [0, -15, 150];
  const radius = 78;

  // Base skull dome shape
  const baseDome = sphere(radius).scale(1.0, 1.12, 0.9).translate(...shellCenter);

  // Hollow it out to represent a robust 4.5 mm removable metal shell.
  const hollowDome = difference(
    baseDome,
    [
      sphere(radius - 4.5).scale(1.0, 1.12, 0.9).translate(...shellCenter),
      // Cut off bottom below Z = 120
      box(200, 200, 120).translate(0, 0, 0)
    ]
  );

  // Define cut sheets for panel gaps
  const rearCut = box(220, 1.0, 220).translate(0, -60, 150);

  const shellPanels = [
    servicePlate("panel_brow_l", 42, 8, 24, [-37, 63, 138], [-8, 0, 0]),
    servicePlate("panel_brow_r", 42, 8, 24, [37, 63, 138], [-8, 0, 0]),
    servicePlate("panel_forehead_center", 24, 8, 34, [0, 64, 144], [-6, 0, 0], COLORS.blackOxide),
    servicePlate("panel_crown_front_l", 52, 42, 8, [-30, 34, 190], [-10, 4, 0]),
    servicePlate("panel_crown_front_r", 52, 42, 8, [30, 34, 190], [-10, -4, 0]),
    servicePlate("panel_crown_mid_l", 54, 48, 8, [-32, -10, 206], [0, 8, 0]),
    servicePlate("panel_crown_mid_r", 54, 48, 8, [32, -10, 206], [0, -8, 0]),
    servicePlate("panel_crown_rear_l", 44, 34, 8, [-28, -64, 194], [10, 8, 0]),
    servicePlate("panel_crown_rear_r", 44, 34, 8, [28, -64, 194], [10, -8, 0]),
    servicePlate("panel_crown_center_ridge", 18, 82, 8, [0, -18, 220], [0, 0, 0], COLORS.blackOxide),
    servicePlate("panel_temporal_l", 8, 50, 30, [-78, -18, 136], [0, -10, 0]),
    servicePlate("panel_temporal_r", 8, 50, 30, [78, -18, 136], [0, 10, 0]),
  ];

  const shellPanelFasteners = [
    panelScrew("brow_fastener_l_outer", [-54, 72, 154]),
    panelScrew("brow_fastener_l_inner", [-21, 72, 154]),
    panelScrew("brow_fastener_r_inner", [21, 72, 154]),
    panelScrew("brow_fastener_r_outer", [54, 72, 154]),
    panelScrew("crown_fastener_l", [-44, 38, 202], [0, 0, 1]),
    panelScrew("crown_fastener_r", [44, 38, 202], [0, 0, 1]),
    panelScrew("crown_rear_fastener_l", [-30, -88, 200], [0, -1, 0]),
    panelScrew("crown_rear_fastener_r", [30, -88, 200], [0, -1, 0]),
  ];

  // 4. Rear Service Cover (Zone: Z = 120 to Z = 220, Y < -40)
  // Uses a 300mm tall cut box to prevent the service cover from extending forward in the upper head region
  const rearServiceCover = metal(
    box(90, 7, 92).translate(0, -100, 124),
    COLORS.blackOxide,
    MATERIALS.M_black_oxide
  );

  // Fasteners (recessed M2 bolts around the rear service cover)
  const fasteners = [];
  const fastenerShapes = [];
  const screwPositions = [
    [-38, -96, 132], [38, -96, 132],
    [-38, -96, 166], [38, -96, 166],
    [-20, -96, 198], [20, -96, 198]
  ];

  for (let i = 0; i < screwPositions.length; i++) {
    const screwShape = cylinder(3, 1.5, undefined, 12).pointAlong([0, 1, 0]).translate(...screwPositions[i]);
    fastenerShapes.push(screwShape);
    fasteners.push(
      item(
        `shell_fastener_${i}`,
        metal(
          screwShape,
          COLORS.fastenerDark,
          MATERIALS.M_fastener_dark
        )
      )
    );
  }

  const rearServiceCoverWithRecesses = difference(
    rearServiceCover,
    fastenerShapes
  );

  const serviceDoorSeams = [
    item("rear_service_seam_top", box(82, 1.4, 1.4).translate(0, -95.8, 204).color(COLORS.panelGap)),
    item("rear_service_seam_bottom", box(82, 1.4, 1.4).translate(0, -95.8, 138).color(COLORS.panelGap)),
    item("rear_service_seam_left", box(1.4, 1.4, 74).translate(-42, -95.8, 130).color(COLORS.panelGap)),
    item("rear_service_seam_right", box(1.4, 1.4, 74).translate(42, -95.8, 130).color(COLORS.panelGap)),
  ];

  return group(
    ...shellPanels,
    item("rear_service_cover", rearServiceCoverWithRecesses),
    ...serviceDoorSeams,
    ...shellPanelFasteners,
    ...fasteners
  ).translate(0, 0, HEAD_BASE_Z);
}

const cranialShell = makeCranialShell();
return cranialShell;

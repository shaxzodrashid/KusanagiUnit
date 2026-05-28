// ForgeCAD part
// Docs: https://forgecad.io/docs

const width = param("Width", 50, { min: 10, max: 200, unit: "mm" });
const height = param("Height", 30, { min: 5, max: 100, unit: "mm" });
const depth = param("Depth", 20, { min: 5, max: 100, unit: "mm" });

const part = box(width, depth, height);

return part;

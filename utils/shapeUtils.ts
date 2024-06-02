import type {
  AppCanvasElement,
  MouseXPosition,
  MouseYPosition,
} from "../types";

export const isPointInEllipse = (
  elem: AppCanvasElement,
  x: MouseXPosition,
  y: MouseYPosition
) => {
  let radiusX = elem.width / 2; // Semieje en x
  let radiusY = elem.height / 2; // Semieje en y
  let centerX = elem.x + radiusX; // Coordenada x del centro de la elipse
  let centerY = elem.y + radiusY; // Coordenada y del centro de la elipse

  // Verificar si el punto (x, y) está dentro de la elipse
  let normalizedX = (x - centerX) / radiusX;
  let normalizedY = (y - centerY) / radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
};

// Ray-Casting algorithm
export const isPointInPolygon = (
  px: MouseXPosition,
  py: MouseYPosition,
  vertices: number[][]
) => {
  let isInside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0],
      yi = vertices[i][1];
    const xj = vertices[j][0],
      yj = vertices[j][1];

    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

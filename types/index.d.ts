export interface AppCanvasElement {
  id: number;
  name: string;
  x: number;
  y: number;
  points?: number[][];
  finishX: number;
  finishY: number;
  direction: "left-bottom" | "left-top" | "right-bottom" | "right-top" | null;
  editMode?: boolean;
  width: number;
  type: string;
  height: number;
  color: string;
}

export type DrawingShape =
  | "rectangle"
  | "ellipse"
  | "line"
  | "text"
  | "image"
  | "arrow";

export type MouseXPosition = number;
export type MouseYPosition = number;

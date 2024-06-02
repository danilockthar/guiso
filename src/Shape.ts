import type { AppCanvasElement } from "../types/index.d.ts";

class Shape {
  private element: AppCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(element: AppCanvasElement, ctx: CanvasRenderingContext2D) {
    this.element = element;
    this.ctx = ctx;
    this.ctx.strokeStyle = "black";
  }

  public draw() {
    this.ctx.imageSmoothingEnabled = true;

    if (this.element.type === "rectangle") {
      let pathInsideRect = new Path2D();

      pathInsideRect.moveTo(this.element.x, this.element.y);

      pathInsideRect.lineTo(
        this.element.x + this.element.width,
        this.element.y
      );

      pathInsideRect.lineTo(
        this.element.x + this.element.width,
        this.element.y + this.element.height
      );

      pathInsideRect.lineTo(
        this.element.x,
        this.element.y + this.element.height
      );

      pathInsideRect.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 1;
      this.ctx.stroke(pathInsideRect);
      this.ctx.fill(pathInsideRect);
    }
    if (this.element.type === "ellipse") {
      let pathInsideEllipse = new Path2D();

      const radiusX = Math.abs(this.element.width / 2);
      const radiusY = Math.abs(this.element.height / 2);
      pathInsideEllipse.ellipse(
        this.element.x + this.element.width / 2, // Centro x del elipse
        this.element.y + this.element.height / 2, // Centro y del elipse
        radiusX, // Radio horizontal
        radiusY, // Radio vertical
        0, // Rotación (en radianes)
        0, // Ángulo de inicio (en radianes)
        2 * Math.PI // Ángulo de fin (en radianes), un círculo completo
      );
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 1;
      this.ctx.stroke(pathInsideEllipse);
      this.ctx.fill(pathInsideEllipse);
    }
    if (this.element.type === "line") {
      let pathInsideRect = new Path2D();

      if (
        this.element.direction === "left-bottom" ||
        this.element.direction === "right-top"
      ) {
        pathInsideRect.moveTo(
          this.element.x,
          this.element.y + this.element.height
        );
        pathInsideRect.lineTo(
          this.element.x + this.element.width,
          this.element.y
        );
      } else {
        pathInsideRect.moveTo(this.element.x, this.element.y);

        pathInsideRect.lineTo(
          this.element.x + this.element.width,
          this.element.y + this.element.height
        );
      }

      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke(pathInsideRect);
    }
    if (this.element.type === "arrow") {
      let pathInsideRect = new Path2D();
      let startX, startY;
      let finalX, finalY;

      pathInsideRect.moveTo(this.element.x, this.element.y);

      pathInsideRect.lineTo(
        this.element.x + this.element.width,
        this.element.y + this.element.height
      );
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke(pathInsideRect);

      startX = this.element.x;
      startY = this.element.y;
      finalX = this.element.x + this.element.width;
      finalY = this.element.y + this.element.height;

      let deltaX = finalX - startX;
      let deltaY = finalY - startY;
      let angle = Math.atan2(deltaY, deltaX); // en radianes;

      // Arrowhead properties
      const arrowLength = 3;
      const arrowAngle = (30 * Math.PI) / 180; // Convert to radians
      // Calculate the angles for the arrowhead lines
      const angle1 = angle + arrowAngle;
      const angle2 = angle - arrowAngle;

      // Calculate the end points of the arrowhead lines
      const arrowX1 = finalX - arrowLength * Math.cos(angle1);
      const arrowY1 = finalY - arrowLength * Math.sin(angle1);
      const arrowX2 = finalX - arrowLength * Math.cos(angle2);
      const arrowY2 = finalY - arrowLength * Math.sin(angle2);

      // Draw arrowhead lines

      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(arrowX1, arrowY1);
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(arrowX2, arrowY2);
      pathInsideRect.lineTo(arrowX1, arrowY1);
      pathInsideRect.closePath();
      this.ctx.fillStyle = "black";
      this.ctx.fill(pathInsideRect);
      this.ctx.stroke(pathInsideRect);

      //Calculate the area of the entire arrow shape
      const rectFinalAngle = (90 * Math.PI) / 180;
      const rectAngle1 = angle + rectFinalAngle;
      const rectAngle2 = angle - rectFinalAngle;
      const rectX1 = finalX - 2 * Math.cos(rectAngle1);
      const rectY1 = finalY - 2 * Math.sin(rectAngle1);
      const rectX2 = finalX - 2 * Math.cos(rectAngle2);
      const rectY2 = finalY - 2 * Math.sin(rectAngle2);

      const startRectX1 = startX - 2 * Math.cos(rectAngle1);
      const startRectY1 = startY - 2 * Math.sin(rectAngle1);
      const startRectX2 = startX - 2 * Math.cos(rectAngle2);
      const startRectY2 = startY - 2 * Math.sin(rectAngle2);

      this.element.points = [
        [rectX1, rectY1],
        [rectX2, rectY2],
        [startRectX2, startRectY2],
        [startRectX1, startRectY1],
      ];

      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(rectX1, rectY1);
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(rectX2, rectY2);

      pathInsideRect.lineTo(startRectX2, startRectY2);

      pathInsideRect.lineTo(startRectX1, startRectY1);
      pathInsideRect.lineTo(rectX1, rectY1);

      pathInsideRect.closePath();
      // add blue rectangle to the arrow
      /* this.ctx.fillStyle = "blue";
      this.ctx.fill(pathInsideRect);
      this.ctx.stroke(pathInsideRect); */

      //add two circles to the arrow
      const circleRadius = 1.5;
      const circleX = this.element.x;
      const circleY = this.element.y;
      const circleX2 = this.element.x + this.element.width;
      const circleY2 = this.element.y + this.element.height;
      const circlePath = new Path2D();
      circlePath.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "white";

      const circlePathTwo = new Path2D();
      circlePathTwo.arc(circleX2, circleY2, circleRadius, 0, 2 * Math.PI);

      if (this.element.editMode) {
        this.ctx.fill(circlePath);
        this.ctx.strokeStyle = "red";
        this.ctx.stroke(circlePath);
        this.ctx.fill(circlePathTwo);
        this.ctx.strokeStyle = "red";
        this.ctx.stroke(circlePathTwo);
      }
    }
  }
}

export default Shape;

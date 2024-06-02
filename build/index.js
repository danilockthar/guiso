// utils/shapeUtils.ts
var isPointInEllipse = (elem, x, y) => {
  let radiusX = elem.width / 2;
  let radiusY = elem.height / 2;
  let centerX = elem.x + radiusX;
  let centerY = elem.y + radiusY;
  let normalizedX = (x - centerX) / radiusX;
  let normalizedY = (y - centerY) / radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
};
var isPointInPolygon = (px, py, vertices) => {
  let isInside = false;
  for (let i = 0, j = vertices.length - 1;i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    const intersect = yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi) + xi;
    if (intersect)
      isInside = !isInside;
  }
  return isInside;
};

// src/Shape.ts
class Shape {
  element;
  ctx;
  constructor(element, ctx) {
    this.element = element;
    this.ctx = ctx;
    this.ctx.strokeStyle = "black";
  }
  draw() {
    this.ctx.imageSmoothingEnabled = true;
    if (this.element.type === "rectangle") {
      let pathInsideRect = new Path2D;
      pathInsideRect.moveTo(this.element.x, this.element.y);
      pathInsideRect.lineTo(this.element.x + this.element.width, this.element.y);
      pathInsideRect.lineTo(this.element.x + this.element.width, this.element.y + this.element.height);
      pathInsideRect.lineTo(this.element.x, this.element.y + this.element.height);
      pathInsideRect.closePath();
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 1;
      this.ctx.stroke(pathInsideRect);
      this.ctx.fill(pathInsideRect);
    }
    if (this.element.type === "ellipse") {
      let pathInsideEllipse = new Path2D;
      const radiusX = Math.abs(this.element.width / 2);
      const radiusY = Math.abs(this.element.height / 2);
      pathInsideEllipse.ellipse(this.element.x + this.element.width / 2, this.element.y + this.element.height / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 1;
      this.ctx.stroke(pathInsideEllipse);
      this.ctx.fill(pathInsideEllipse);
    }
    if (this.element.type === "line") {
      let pathInsideRect = new Path2D;
      if (this.element.direction === "left-bottom" || this.element.direction === "right-top") {
        pathInsideRect.moveTo(this.element.x, this.element.y + this.element.height);
        pathInsideRect.lineTo(this.element.x + this.element.width, this.element.y);
      } else {
        pathInsideRect.moveTo(this.element.x, this.element.y);
        pathInsideRect.lineTo(this.element.x + this.element.width, this.element.y + this.element.height);
      }
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke(pathInsideRect);
    }
    if (this.element.type === "arrow") {
      let pathInsideRect = new Path2D;
      let startX, startY;
      let finalX, finalY;
      pathInsideRect.moveTo(this.element.x, this.element.y);
      pathInsideRect.lineTo(this.element.x + this.element.width, this.element.y + this.element.height);
      this.ctx.fillStyle = "white";
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke(pathInsideRect);
      startX = this.element.x;
      startY = this.element.y;
      finalX = this.element.x + this.element.width;
      finalY = this.element.y + this.element.height;
      let deltaX = finalX - startX;
      let deltaY = finalY - startY;
      let angle = Math.atan2(deltaY, deltaX);
      const arrowLength = 3;
      const arrowAngle = 30 * Math.PI / 180;
      const angle1 = angle + arrowAngle;
      const angle2 = angle - arrowAngle;
      const arrowX1 = finalX - arrowLength * Math.cos(angle1);
      const arrowY1 = finalY - arrowLength * Math.sin(angle1);
      const arrowX2 = finalX - arrowLength * Math.cos(angle2);
      const arrowY2 = finalY - arrowLength * Math.sin(angle2);
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(arrowX1, arrowY1);
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(arrowX2, arrowY2);
      pathInsideRect.lineTo(arrowX1, arrowY1);
      pathInsideRect.closePath();
      this.ctx.fillStyle = "black";
      this.ctx.fill(pathInsideRect);
      this.ctx.stroke(pathInsideRect);
      const rectFinalAngle = 90 * Math.PI / 180;
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
        [startRectX1, startRectY1]
      ];
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(rectX1, rectY1);
      pathInsideRect.moveTo(finalX, finalY);
      pathInsideRect.lineTo(rectX2, rectY2);
      pathInsideRect.lineTo(startRectX2, startRectY2);
      pathInsideRect.lineTo(startRectX1, startRectY1);
      pathInsideRect.lineTo(rectX1, rectY1);
      pathInsideRect.closePath();
      const circleRadius = 1.5;
      const circleX = this.element.x;
      const circleY = this.element.y;
      const circleX2 = this.element.x + this.element.width;
      const circleY2 = this.element.y + this.element.height;
      const circlePath = new Path2D;
      circlePath.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "white";
      const circlePathTwo = new Path2D;
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
var Shape_default = Shape;

// src/Canvas.ts
class Canvas {
  canvas;
  ctx;
  message = "cafe-planner 1.0.0";
  currentDrawingID = 0;
  objectToDraw = "";
  isDragging = false;
  netPanningX = 0;
  isDrawing = false;
  netPanningY = 0;
  cw;
  ch;
  cursor = "default";
  startX = 0;
  startY = 0;
  offsetX = 0;
  offsetY = 0;
  clickElementOffsetX = 0;
  clickElementOffsetY = 0;
  scale = 3;
  isElementSelected = false;
  elementSelectedID = 0;
  elements = [];
  enableSnapToGrid = false;
  isDragActivated = true;
  isGridActivated = false;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = null;
    this.cw = 0;
    this.ch = 0;
    this.canvas.style.backgroundColor = "#efefef";
    this.canvas.style.cursor = "default";
  }
  setCursorStyle(cursor) {
    this.canvas.style.cursor = cursor;
  }
  setMousePosition(x, y) {
    this.startX = x;
    this.startY = y;
  }
  setSnapToGrid(set) {
    this.enableSnapToGrid = set;
  }
  setShowGrid(set) {
    this.isGridActivated = set;
  }
  setDragging(set) {
    this.isDragActivated = set;
  }
  bindContainer(binder) {
    if (!binder)
      throw new Error("Binder element not found");
    binder.appendChild(this.canvas);
    this.canvas.width = binder.offsetWidth * window.devicePixelRatio;
    this.canvas.height = binder.offsetHeight * window.devicePixelRatio;
    this.canvas.style.width = binder.offsetWidth + "px";
    this.canvas.style.height = binder.offsetHeight + "px";
    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";
    }
    this.cw = this.canvas.width;
    this.ch = this.canvas.height;
    this.reOffset();
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseout", this.handleMouseOut);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseOut);
    this.canvas.addEventListener("wheel", this.handleZoom);
    this.ctx?.scale(this.scale, this.scale);
    this.ctx?.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.drawCanvas();
  }
  addElement(element) {
    if (Array.isArray(element)) {
      this.elements = [...this.elements, ...element];
    } else {
      this.elements.push(element);
    }
    this.drawCanvas();
  }
  drawObject(shape) {
    this.isDragActivated = false;
    this.isDrawing = true;
    this.objectToDraw = shape;
  }
  isElementHoveredOrClicked(elements, x, y) {
    return [...elements].reverse().find((element) => {
      let clickX = x / this.scale - this.netPanningX;
      let clickY = y / this.scale - this.netPanningY;
      if (element.type === "ellipse") {
        return isPointInEllipse(element, clickX, clickY);
      }
      if (element.type === "arrow") {
        if (!element.points)
          return;
        const vertice = element.points;
        return isPointInPolygon(clickX, clickY, vertice);
      }
      return x / this.scale >= element.x + this.netPanningX && x / this.scale <= element.x + this.netPanningX + element.width && y / this.scale >= element.y + this.netPanningY && y / this.scale <= element.y + this.netPanningY + element.height;
    });
  }
  updateCanvasElements(configUpdate) {
    const { x = 0, y = 0 } = configUpdate;
    this.elements = this.elements.map((element) => {
      if (this.isElementSelected && element.id === this.elementSelectedID) {
        return {
          ...element,
          x: this.enableSnapToGrid ? Math.round((x - this.clickElementOffsetX) / this.scale / 10) * 10 : (x - this.clickElementOffsetX) / this.scale,
          y: this.enableSnapToGrid ? Math.round((y - this.clickElementOffsetY) / this.scale / 10) * 10 : (y - this.clickElementOffsetY) / this.scale
        };
      } else {
        return { ...element };
      }
    });
  }
  reOffset() {
    let BB = this.canvas.getBoundingClientRect();
    this.offsetX = BB.left;
    this.offsetY = BB.top;
  }
  handleZoom = (e) => {
    e.preventDefault();
    const moveSpeed = 1;
    const deltaX = -e.deltaX * moveSpeed;
    const deltaY = -e.deltaY * moveSpeed;
    const ZOOM_SPEED = 0.0001;
    const clickX = e.clientX - this.offsetX;
    const clickY = e.clientY - this.offsetY;
    this.startX = clickX;
    this.startY = clickY;
    let dx = clickX - this.startX;
    let dy = clickY - this.startY;
    dx += deltaX;
    dy += deltaY;
    this.netPanningX += dx / this.scale;
    this.netPanningY += dy / this.scale;
    this.updateCanvasElements({
      x: dx,
      y: dy
    });
    this.drawCanvas();
    return;
    if (this.isDragging)
      return;
    this.scale += -e.deltaY * ZOOM_SPEED;
    this.scale = Math.max(this.scale, 0.8);
    this.scale = Math.min(this.scale, 5);
    this.ctx?.scale(this.scale, this.scale);
    this.ctx?.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.drawCanvas();
  };
  handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.startX = e.clientX - this.offsetX;
    this.startY = e.clientY - this.offsetY;
    if (this.isDrawing) {
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      this.elements = [
        ...this.elements,
        {
          id: randomId,
          name: `${this.objectToDraw}_` + randomId,
          x: this.startX / this.scale - this.netPanningX,
          y: this.startY / this.scale - this.netPanningY,
          finishX: 0,
          finishY: 0,
          direction: null,
          width: 0,
          type: `${this.objectToDraw}`,
          height: 0,
          color: "pink"
        }
      ];
      this.currentDrawingID = randomId;
      return;
    }
    if (!this.elements)
      return;
    const clickedElement = this.isElementHoveredOrClicked(this.elements, this.startX, this.startY);
    console.log(this.elements, "[ELEMENTS]");
    console.log(clickedElement, "[CLICKED ELEMENT]");
    if (clickedElement) {
      this.elements = this.elements.map((element) => {
        if (element.id !== clickedElement.id) {
          return { ...element, editMode: false };
        } else {
          return { ...element, editMode: true };
        }
      });
      this.drawCanvas();
      this.isElementSelected = true;
      this.elementSelectedID = clickedElement.id;
      this.clickElementOffsetX = this.startX - clickedElement.x * this.scale;
      this.clickElementOffsetY = this.startY - clickedElement.y * this.scale;
    } else {
      this.elements = this.elements.map((element) => {
        return { ...element, editMode: false };
      });
      this.isElementSelected = false;
      this.drawCanvas();
    }
  };
  handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const clickX = e.clientX - this.offsetX;
    const clickY = e.clientY - this.offsetY;
    if (this.isElementSelected && this.isDragActivated) {
      this.updateCanvasElements({
        x: clickX,
        y: clickY
      });
      this.startX = clickX;
      this.startY = clickY;
      this.drawCanvas();
    }
    if (this.isDrawing && this.currentDrawingID !== 0) {
      const dx2 = clickX - this.startX;
      const dy2 = clickY - this.startY;
      this.elements = this.elements.map((elem) => {
        if (elem.id === this.currentDrawingID) {
          return {
            ...elem,
            width: dx2 / this.scale,
            height: dy2 / this.scale,
            finishX: elem.x + dx2 / this.scale,
            finishY: elem.y + dy2 / this.scale
          };
        } else {
          return { ...elem };
        }
      });
      this.drawCanvas();
    }
    if (!this.isDragging || !this.isDragActivated)
      return;
    const dx = clickX - this.startX;
    const dy = clickY - this.startY;
    this.startX = clickX;
    this.startY = clickY;
    this.netPanningX += dx / this.scale;
    this.netPanningY += dy / this.scale;
    this.drawCanvas();
  };
  handleMouseOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const clickX = e.clientX - this.offsetX;
    const clickY = e.clientY - this.offsetY;
    const dx = clickX - this.startX;
    const dy = clickY - this.startY;
    if (this.isDrawing) {
      this.currentDrawingID = 0;
    }
    this.isDragging = false;
    this.isElementSelected = false;
  };
  drawCanvas = () => {
    if (!this.ctx)
      return;
    this.ctx.clearRect(0, 0, this.cw * 100, this.ch * 100);
    this.ctx.save();
    this.ctx.translate(this.netPanningX, this.netPanningY);
    this.drawBackgroundGrid();
    this.elements.forEach((element) => {
      if (!this.ctx)
        return;
      let shape = new Shape_default(element, this.ctx);
      shape.draw();
    });
    this.ctx.restore();
  };
  drawBackgroundGrid() {
    if (!this.isGridActivated || !this.ctx)
      return;
    this.ctx.beginPath();
    for (var x = -1e6;x <= this.cw * 100; x += 10) {
      this.ctx.moveTo(x + Math.round(this.netPanningX / 10) * 10, this.ch * -1e6);
      this.ctx.lineTo(x + Math.round(this.netPanningX / 10) * 10, this.ch * 1e6);
    }
    for (var y = -1e6;y <= this.ch * 100; y += 10) {
      this.ctx.moveTo(this.cw * -1e6, y + Math.round(this.netPanningY / 10) * 10);
      this.ctx.lineTo(this.cw * 1e6, y + Math.round(this.netPanningY / 10) * 10);
    }
    this.ctx.lineWidth = 0.3;
    this.ctx.strokeStyle = "#f6f6f6";
    this.ctx.stroke();
  }
}
var Canvas_default = Canvas;
export {
  Canvas_default as GUIso
};

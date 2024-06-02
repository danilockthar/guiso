import type {
  AppCanvasElement,
  MouseXPosition,
  MouseYPosition,
  DrawingShape,
} from "../types/index.d.ts";
import { isPointInEllipse, isPointInPolygon } from "../utils/shapeUtils.ts";
import Shape from "./Shape";

class Canvas {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D | null;
  public message: string = "cafe-planner 1.0.0";
  private currentDrawingID: number = 0;
  private objectToDraw: string = "";
  public isDragging = false;
  public netPanningX: number = 0;
  public isDrawing: boolean = false;
  public netPanningY: number = 0;
  public cw: number;
  public ch: number;
  public cursor: string = "default";
  public startX: number = 0;
  public startY: number = 0;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public clickElementOffsetX: number = 0;
  public clickElementOffsetY: number = 0;
  public scale = 3;
  public isElementSelected = false;
  public elementSelectedID: number = 0;
  public elements: AppCanvasElement[] = [];
  public enableSnapToGrid: boolean = false;
  public isDragActivated: boolean = true;
  public isGridActivated: boolean = false;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = null;
    this.cw = 0;
    this.ch = 0;
    this.canvas.style.backgroundColor = "#efefef";
    this.canvas.style.cursor = "default";
  }

  public setCursorStyle(cursor: string) {
    this.canvas.style.cursor = cursor;
  }

  public setMousePosition(x: MouseXPosition, y: MouseYPosition) {
    this.startX = x;
    this.startY = y;
  }

  public setSnapToGrid(set: boolean) {
    this.enableSnapToGrid = set;
  }

  public setShowGrid(set: boolean) {
    this.isGridActivated = set;
  }

  public setDragging(set: boolean) {
    this.isDragActivated = set;
  }

  public bindContainer(binder: HTMLDivElement) {
    // bindContainer will work by default.
    if (!binder) throw new Error("Binder element not found");

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

  public addElement(element: AppCanvasElement | AppCanvasElement[]) {
    if (Array.isArray(element)) {
      this.elements = [...this.elements, ...element];
    } else {
      this.elements.push(element);
    }
    this.drawCanvas();
  }

  public drawObject(shape: DrawingShape) {
    this.isDragActivated = false;
    this.isDrawing = true;
    this.objectToDraw = shape;
  }

  public isElementHoveredOrClicked(
    elements: AppCanvasElement[],
    x: MouseXPosition,
    y: MouseYPosition
  ): AppCanvasElement | undefined {
    return [...elements].reverse().find((element) => {
      let clickX = x / this.scale - this.netPanningX;
      let clickY = y / this.scale - this.netPanningY;
      if (element.type === "ellipse") {
        return isPointInEllipse(element, clickX, clickY);
      }
      if (element.type === "arrow") {
        if (!element.points) return;
        const vertice = element.points;

        return isPointInPolygon(clickX, clickY, vertice);
      }
      return (
        x / this.scale >= element.x + this.netPanningX &&
        x / this.scale <= element.x + this.netPanningX + element.width &&
        y / this.scale >= element.y + this.netPanningY &&
        y / this.scale <= element.y + this.netPanningY + element.height
      );
    });
  }

  public updateCanvasElements(configUpdate: Record<"x" | "y", number>) {
    const { x = 0, y = 0 } = configUpdate;
    this.elements = this.elements.map((element) => {
      if (this.isElementSelected && element.id === this.elementSelectedID) {
        return {
          ...element,
          x: this.enableSnapToGrid
            ? Math.round((x - this.clickElementOffsetX) / this.scale / 10) * 10
            : (x - this.clickElementOffsetX) / this.scale,
          y: this.enableSnapToGrid
            ? Math.round((y - this.clickElementOffsetY) / this.scale / 10) * 10
            : (y - this.clickElementOffsetY) / this.scale,
        };
      } else {
        return { ...element };
      }
    });
  }

  public reOffset() {
    let BB = this.canvas.getBoundingClientRect();
    this.offsetX = BB.left;
    this.offsetY = BB.top;
  }

  public handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    const moveSpeed = 1; // Ajusta la velocidad de movimiento según necesites

    // Calcular el desplazamiento del mapa en función del gesto de zoom
    const deltaX = -e.deltaX * moveSpeed;
    const deltaY = -e.deltaY * moveSpeed;
    const ZOOM_SPEED = 0.0001;

    const clickX = e.clientX - this.offsetX; // Current mouse position inside canvas
    const clickY = e.clientY - this.offsetY;

    this.startX = clickX; // Update start position for the next mouse move
    this.startY = clickY;
    let dx = clickX - this.startX; // Change in X
    let dy = clickY - this.startY; // Change in Y

    dx += deltaX;
    dy += deltaY;
    this.netPanningX += dx / this.scale; // Accumulate net panning done
    this.netPanningY += dy / this.scale;

    this.updateCanvasElements({
      x: dx,
      y: dy,
    });
    this.drawCanvas();
    return;
    if (this.isDragging) return;
    /* const ZOOM_SPEED = 0.001; */
    this.scale += -e.deltaY * ZOOM_SPEED;
    this.scale = Math.max(this.scale, 0.8);

    this.scale = Math.min(this.scale, 5);
    this.ctx?.scale(this.scale, this.scale);
    this.ctx?.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.drawCanvas();
  };

  public handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.startX = e.clientX - this.offsetX;
    this.startY = e.clientY - this.offsetY;

    // DRAW OBJECT LOGIC
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
          color: "pink",
        },
      ];
      this.currentDrawingID = randomId;
      return;
    }
    if (!this.elements) return;
    const clickedElement = this.isElementHoveredOrClicked(
      this.elements,
      this.startX,
      this.startY
    );

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
      // remuevo el drag para que no se mueva el canvas
      /* this.isDragging = true; */
      this.drawCanvas();
    }
  };

  //
  public handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clickX = e.clientX - this.offsetX; // Current mouse position inside canvas
    const clickY = e.clientY - this.offsetY;

    if (this.isElementSelected && this.isDragActivated) {
      this.updateCanvasElements({
        x: clickX,
        y: clickY,
      });

      this.startX = clickX; // Update start position for the next mouse move
      this.startY = clickY;
      this.drawCanvas();
    }

    if (this.isDrawing && this.currentDrawingID !== 0) {
      const dx = clickX - this.startX; // Change in X
      const dy = clickY - this.startY; // Change in Y
      /*     console.log(dx, dy);
          console.log(this.startX, this.startY);
          console.log(clickX, clickY); */
      this.elements = this.elements.map((elem) => {
        if (elem.id === this.currentDrawingID) {
          return {
            ...elem,
            width: dx / this.scale,
            height: dy / this.scale,
            finishX: elem.x + dx / this.scale,
            finishY: elem.y + dy / this.scale,
          };
        } else {
          return { ...elem };
        }
      });

      this.drawCanvas();
    }

    if (!this.isDragging || !this.isDragActivated) return;
    const dx = clickX - this.startX; // Change in X
    const dy = clickY - this.startY; // Change in Y

    this.startX = clickX; // Update start position for the next mouse move
    this.startY = clickY;

    this.netPanningX += dx / this.scale; // Accumulate net panning done
    this.netPanningY += dy / this.scale;

    /*   this.updateCanvasElements({
          x: dx,
          y: dy,
        }); */
    this.drawCanvas();
  };

  public handleMouseOut = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clickX = e.clientX - this.offsetX; // Current mouse position inside canvas
    const clickY = e.clientY - this.offsetY;
    const dx = clickX - this.startX; // Change in X
    const dy = clickY - this.startY; // Change in Y

    /**
     * si el dx es negativo, x pasa a ser clickX (click final/mouseout final)
     * si el dx es negativo, width pasa a ser el dx positivo
     * si el dy es negativo, wdith sigue siendo clickX, y height pasa a ser clickY + dy positivo
     *
     */
    if (this.isDrawing) {
      /*  const isDXPositive = Math.sign(dx) == 1;
          const isDYPositive = Math.sign(dy) == 1;
    
          this.elements = this.elements.map((elem) => {
            if (elem.id === this.currentDrawingID) {
              if (!isDXPositive && isDYPositive) {
                if (this.objectToDraw === "line" || this.objectToDraw === "arrow") {
                  elem.direction = "left-bottom";
                  console.log(dx, dy, "[DX, DY] 2");
                  elem.x = clickX / this.scale - this.netPanningX;
                  elem.width = Math.abs(dx / this.scale);
                } else {
                  elem.x = clickX / this.scale - this.netPanningX;
                  elem.width = Math.abs(dx / this.scale);
                }
              }
    
              if (isDXPositive && !isDYPositive) {
                elem.direction = "right-top";
                elem.y = clickY / this.scale - this.netPanningY;
                elem.height = Math.abs(dy / this.scale);
              }
    
              if (!isDYPositive && !isDXPositive) {
                elem.x = clickX / this.scale - this.netPanningX;
                elem.y = clickY / this.scale - this.netPanningY;
                elem.width = Math.abs(dx / this.scale);
                elem.height = Math.abs(dy / this.scale);
              }
              return { ...elem };
            } else {
              return { ...elem };
            }
          }); */
      this.currentDrawingID = 0;
    }
    this.isDragging = false;
    this.isElementSelected = false;
  };

  public drawCanvas = () => {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.cw * 100, this.ch * 100);
    this.ctx.save();
    /*    console.log(this.netPanningX, this.netPanningY, "[NET PANNING]"); */
    this.ctx.translate(this.netPanningX, this.netPanningY);

    this.drawBackgroundGrid();

    this.elements.forEach((element) => {
      if (!this.ctx) return;

      let shape = new Shape(element, this.ctx);
      shape.draw();
    });
    this.ctx.restore();
  };

  public drawBackgroundGrid() {
    if (!this.isGridActivated || !this.ctx) return;
    this.ctx.beginPath();
    for (var x = -1000000; x <= this.cw * 100; x += 10) {
      this.ctx.moveTo(
        x + Math.round(this.netPanningX / 10) * 10,
        this.ch * -1000000
      );
      this.ctx.lineTo(
        x + Math.round(this.netPanningX / 10) * 10,
        this.ch * 1000000
      );
    }
    for (var y = -1000000; y <= this.ch * 100; y += 10) {
      this.ctx.moveTo(
        this.cw * -1000000,
        y + Math.round(this.netPanningY / 10) * 10
      );
      this.ctx.lineTo(
        this.cw * 1000000,
        y + Math.round(this.netPanningY / 10) * 10
      );
    }
    this.ctx.lineWidth = 0.3;
    this.ctx.strokeStyle = "#f6f6f6";
    this.ctx.stroke();
  }
}

export default Canvas;

export type { AppCanvasElement };

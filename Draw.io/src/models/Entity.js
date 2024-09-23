class Entity {
  constructor(
    strokeStyle,
    strokeColor,
    strokeWidth,
    fillStyle,
    fillColor,
    opacity,
    id,
    hovered,
    selected
  ) {
    this.id = id || Date.now();
    this.strokeStyle = strokeStyle || "dashed";
    this.strokeColor = strokeColor || "red";
    this.strokeWidth = strokeWidth || 1;
    this.fillStyle = fillStyle || "none";
    this.fillColor = fillColor || "transparent";
    this.selected = false;
    this.hovered = false;
    this.erased = false;
    this.extents = {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    };
    this.opacity = opacity || 1;
    this.hovered = hovered || false;
    this.selected = selected || false;
  }
  // Abstract method to be implemented by subclasses to calculate the extent
  calculateExtent() {
    throw new Error("calculateExtent method must be implemented by subclass");
  }

  // Abstract method to be implemented by subclasses
  draw(context) {
    throw new Error("Draw method must be implemented by subclass");
  }
  transformBy(matrix) {
    throw new Error("transformBy() method must be implemented");
  }
  applyCanvasProperties(context) {
    context.strokeStyle = this.strokeColor;
    context.lineWidth = this.strokeWidth;
    context.fillStyle = this.fillColor;

    if (this.strokeStyle === "dashed") context.setLineDash([5, 5]);
    else context.setLineDash([]);
    context.globalAlpha = this.opacity;

    if (this.hovered) {
      context.setLineDash([5, 5]);
      context.globalAlpha = 0.8;
    }
  }

  serialize() {
    return {
      strokeStyle: this.strokeStyle,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      fillStyle: this.fillStyle,
      fillColor: this.fillColor,
      extents: this.extents,
      opacity: this.opacity,
      id:this.id,
      hovered:this.hovered,
      selected:this.selected
    };
  }

  drawExtent(context) {
    if (!this.selected) return;
    const width = this.extents.max.x - this.extents.min.x + 10;
    const height = this.extents.max.y - this.extents.min.y + 10;
    const point = Object.assign({}, this.extents.min);
    point.x -= 5;
    point.y -= 5;
    context.save();
    context.strokeStyle = "blue";

    context.lineWidth = 1;
    context.fillStyle = "transparent";

    context.setLineDash([5, 5]);
    context.globalAlpha = 1;
    context.beginPath();
    context.rect(point.x, point.y, width, height);
    context.stroke();

    context.restore();
  }

  isPointInside(mouseX, mouseY) {
    throw Error("isPointInside method not implmented");
  }
  isPointAbove(mouseX, mouseY, tolerance = 5) {
    throw Error("isPointAbove method not implmented");
  }
}

export default Entity;

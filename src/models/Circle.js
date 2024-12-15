import Entity from "./entity";
import Rectangle from "./Rectangle";
import ENTITYTYPE from "./EnittyType";
class Circle extends Entity {
  constructor(
    strokeStyle,
    strokeColor,
    strokeWidth,
    fillStyle,
    fillColor,
    center,
    radius,
    opacity,
    id,
    hovered,
    selected
  ) {
    super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor, opacity,id,hovered,selected);
    this.center = center;
    this.radius = radius;
    this.calculateExtent();
  }
  calculateExtent() {
    this.extents.min = {
      x: this.center.x - this.radius,
      y: this.center.y - this.radius,
    };
    this.extents.max = {
      x: this.center.x + this.radius,
      y: this.center.y + this.radius,
    };
  }
  // Draw circle
  draw(context) {
    context.save();
    this.applyCanvasProperties(context);

    context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);

    //if (this.fillStyle === 'fill') {
    context.fill();
    //}
    context.stroke();
    context.restore();

    this.drawExtent(context);
  }

  transformBy(matrix) {
    this.center = this.applyMatrix(this.center, matrix);
    this.radius *= matrix[0];
    this.calculateExtent();
  }

  serialize() {
    return {
      ...super.serialize(),
      radius: this.radius,
      center: { ...this.center },
      type: ENTITYTYPE.CIRCLE,
    };
  }

  static deserialize(data) {
    if (data.type === ENTITYTYPE.CIRCLE) {
      return new Circle(
        data.strokeStyle,
        data.strokeColor,
        data.strokeWidth,
        data.fillStyle,
        data.fillColor,
        data.center,
        data.radius,
        data.opacity,
        data.id,
        data.hovered,
        data.selected
      );
    }
    throw new Error("Unsupported type for deserialization");
  }

  isPointInside(mouseX, mouseY) {
    const dx = mouseX - this.center.x;
    const dy = mouseY - this.center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  isPointAbove(mouseX, mouseY, tolerance = 10) {
    const distToCenter = Math.sqrt(Math.pow(mouseX - this.center.x, 2) + Math.pow(mouseY - this.center.y, 2));
    return Math.abs(distToCenter - this.radius) <= tolerance;
  }
}

export default Circle;

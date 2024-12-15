import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Ellipse extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth, fillStyle, fillColor, center, radiusX, radiusY,opacity,id,hovered,selected) {
      super(strokeStyle,strokeColor, strokeWidth, fillStyle, fillColor,opacity,id,hovered,selected);
      this.center = center;
      this.radiusX = radiusX;
      this.radiusY = radiusY;
      this.calculateExtent();
    }
  
    calculateExtent() {
      this.extents.min = { x: this.center.x - this.radiusX, y: this.center.y - this.radiusY };
      this.extents.max = { x: this.center.x + this.radiusX, y: this.center.y + this.radiusY };
    }
  
    draw(context) {
      context.save();
      this.applyCanvasProperties(context);
      context.beginPath();
      context.ellipse(this.center.x, this.center.y, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
  
      if (this.fillStyle) {
        context.fill();
      }
      context.stroke();
      this.drawExtent(context);
      context.restore();
    }

    serialize() {
      return {
        ...super.serialize(),
        radiusX: this.radiusX,
        radiusY: this.radiusY,
        center : {...this.center},
        type: ENTITYTYPE.ELLIPSE
      };
    }
  
    static deserialize(data) {
      if (data.type === ENTITYTYPE.ELLIPSE) {
        return new Ellipse(
          data.strokeStyle,
          data.strokeColor,
          data.strokeWidth,
          data.fillStyle,
          data.fillColor,
          data.center,
          data.radiusX,
          data.radiusY,
          data.opacity,
          data.id,
          data.hovered,
          data.selected
        );
      }
      throw new Error('Unsupported type for deserialization');
    }

    isPointAbove(mouseX, mouseY, tolerance = 10) {
      const dx = (mouseX - this.center.x) / this.radiusX;
      const dy = (mouseY - this.center.y) / this.radiusY;
      const distToCenter = Math.sqrt(dx * dx + dy * dy);
      return Math.abs(distToCenter - 1) <= tolerance / Math.min(this.radiusX, this.radiusY);
    }
  }
  
  export default Ellipse;
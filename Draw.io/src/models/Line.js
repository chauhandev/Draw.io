import Matrix from "../utility/Matrix";
import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Line extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth,fillStyle,fillColor, start, end,opacity) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,opacity);
      this.start = start;
      this.end = end;
      this.calculateExtent();
    }
    calculateExtent() {
        this.extents.min = {
          x: Math.min(this.start.x, this.end.x),
          y: Math.min(this.start.y, this.end.y),
        };
        this.extents.max = {
          x: Math.max(this.start.x, this.end.x),
          y: Math.max(this.start.y, this.end.y),
        };
      }
  
    // Draw line
    draw(context) {
     context.save()
      this.applyCanvasProperties(context)  
      context.beginPath();
      context.moveTo(this.start.x, this.start.y);
      context.lineTo(this.end.x, this.end.y);
      context.stroke();
    }

    transformBy(matrix) {
      this.start = Matrix.applyMatrix(this.start, matrix);
      this.end = Matrix.applyMatrix(this.end, matrix);
      this.calculateExtent();
    }

    serialize() {
      return {
        ...super.serialize(),
        start: {...this.start},
        end: {...this.end},
        type:  ENTITYTYPE.LINE
      };
    }
  
    static deserialize(data) {
      if (data.type ===  ENTITYTYPE.LINE) {
        return new Line(
          data.strokeStyle,
          data.strokeColor,
          data.strokeWidth,
          data.fillStyle,
          data.fillColor,
          data.start,
          data.end,
          data.opacity,
        );
      }
      throw new Error('Unsupported type for deserialization');
    }
  
  }
  
  export default Line;

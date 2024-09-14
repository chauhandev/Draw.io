import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Rectangle extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth, fillStyle, fillColor, position, width, height ,opacity) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,opacity);
      this.position = position;
      this.width = width;
      this.height = height;
      this.calculateExtent();
    }
  
    calculateExtent() {
        this.extents.min = { x: this.position.x, y: this.position.y };
        this.extents.max = { x: this.position.x + this.width, y: this.position.y + this.height };
      }
 
    // Draw rectangle
    draw(context) {  
      context.save(); 
      this.applyCanvasProperties(context)
      context.beginPath();
      context.rect(this.position.x, this.position.y, this.width, this.height);
  
      if (this.fillStyle) {
        context.fill();
      }
      context.stroke();
      context.restore();
    }

    transformBy(matrix) {
      this.position = this.applyMatrix(this.position, matrix);
      this.width *= matrix[0]; // Assume uniform scaling for simplicity
      this.height *= matrix[3]; // Assume uniform scaling for simplicity
      this.calculateExtent();
    }

    serialize() {
      return {
        ...super.serialize(),
        width: this.width,
        height: this.height,
        position: {...this.position},
        type:  ENTITYTYPE.RECTANGLE
      };
    }
  
    static deserialize(data) {
      if (data.type ===  ENTITYTYPE.RECTANGLE) {
        return new Rectangle(
          data.strokeStyle,
          data.strokeColor,
          data.strokeWidth,
          data.fillStyle,
          data.fillColor,
          data.position,
          data.width,
          data.height,
          data.opacity,
        );
      }
      throw new Error('Unsupported type for deserialization');
    }
  }
  
  export default Rectangle;

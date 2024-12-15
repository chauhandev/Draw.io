import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Rectangle extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth, fillStyle, fillColor, position, width, height ,opacity,id,hovered,selected) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,opacity,id,hovered,selected);
      this.position = position;
      this.width = width;
      this.height = height;
      this.calculateExtent();
    }
  
    calculateExtent() {
        this.extents.min = { x: this.position.x, y: this.position.y };
        this.extents.max = { x: this.position.x + this.width, y: this.position.y + this.height };
        if(this.extents.max.x< this.extents.min.x){
          const temp = this.extents.min.x;
          this.extents.min.x = this.extents.max.x;
          this.extents.max.x = temp;
        }
        if(this.extents.max.y< this.extents.min.y){
          const temp = this.extents.min.y;
          this.extents.min.y = this.extents.max.y;
          this.extents.max.y = temp;
        }
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
      this.drawExtent(context);
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
          data.id,
          data.hovered,
          data.selected
        );
      }
      throw new Error('Unsupported type for deserialization');
    }

    isPointInside(mouseX, mouseY) {
      return mouseX >= this.position.x && mouseX <= this.position.x + this.width &&
             mouseY >= this.position.y && mouseY <= this.position.y + this.height;
    }

    isPointAbove(mouseX, mouseY, tolerance = 10) {
      const isAboveLeftEdge = Math.abs(mouseX - this.extents.min.x) <= tolerance && mouseY >= this.extents.min.y && mouseY <= this.extents.max.y;
      const isAboveRightEdge = Math.abs(mouseX - (this.extents.max.x)) <= tolerance && mouseY >= this.extents.min.y && mouseY <= this.extents.max.y;
      const isAboveTopEdge = Math.abs(mouseY - this.extents.min.y) <= tolerance && mouseX >= this.extents.min.x &&  mouseX <= this.extents.max.x;
      const isAboveBottomEdge = Math.abs(mouseY - (this.extents.max.y)) <= tolerance && mouseX >= this.extents.min.x && mouseX <= this.extents.max.x;
  
      return isAboveLeftEdge || isAboveRightEdge || isAboveTopEdge || isAboveBottomEdge;
    }
  
  }
  
  export default Rectangle;

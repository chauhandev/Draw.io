import Entity from "./entity";
import Rectangle from "./Rectangle";
import ENTITYTYPE from './EnittyType';
class Circle extends Entity {
    constructor(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor, center, radius, opacity) {
      super(strokeStyle,strokeColor, strokeWidth, fillStyle, fillColor ,opacity);
      this.center = center;
      this.radius = radius;
      this.calculateExtent();
    }
    calculateExtent() {
      this.extents.min = { x: this.center.x - this.radius, y: this.center.y - this.radius };
      this.extents.max = { x: this.center.x + this.radius, y: this.center.y + this.radius };
    }
    // Draw circle
    draw(context) {
      context.save()
      this.applyCanvasProperties(context)
       
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

     drawExtent(context){
          const width = this.extents.max.x -this.extents.min.x +10
          const height = this.extents.max.y -this.extents.min.y +10
          const point = Object.assign({},this.extents.min);
          point.x -= 10;
          point.y -= 100;
         const rectangle = new Rectangle("dashed","blue",this.strokeWidth,this.fillStyle,"transparent",point,width,height);
        //  rectangle.draw(context);

      }

      serialize() {
        return {
          ...super.serialize(),
          radius: this.radius,
          center: {...this.center},
          type: ENTITYTYPE.CIRCLE
        };
      }
    
      static deserialize(data) {
        if (data.type ===  ENTITYTYPE.CIRCLE) {
          return new Circle(
            data.strokeStyle,
            data.strokeColor,
            data.strokeWidth,
            data.fillStyle,
            data.fillColor,
            data.center,
            data.radius,
            data.opacity,
          );
        }
        throw new Error('Unsupported type for deserialization');
      }
  }

  export default Circle;
  
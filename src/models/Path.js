import Matrix from "../utility/Matrix";
import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Path extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth,fillStyle,fillColor, opacity,path,id,hovered, selected) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,opacity,id,hovered,selected);
      this.path = path || [];
      this.calculateExtent();
    }
    calculateExtent() {
        if(this.path.length<=0){
            this.extents.min = {
                x: 0,
                y: 0
              };
              this.extents.max = {
                x: 0,
                y: 0,
              };
              return;
        }
        let minPoint = {x:Math.max,y:Math.max};
        let maxPoint = {x:Math.min,y:Math.min};
        this.path.forEach(point => {
            minPoint.x = Math.min(minPoint.x,point.x);
			minPoint.y = Math.min(minPoint.y, point.y);
            maxPoint.x = Math.max(maxPoint.x, point.x);
            maxPoint.y = Math.max(maxPoint.y, point.y);
         
        });

        this.extents.min = {
            x: minPoint.x,
            y: minPoint.y
          };
          this.extents.max = {
            x: maxPoint.x,
            y: maxPoint.y,
          };
       
      }
  
    // Draw line
    draw(context) {
     if(this.path.length<=0)
            return;
        console.log(this.path)
      context.save()
      this.applyCanvasProperties(context)  
      context.beginPath();
      context.moveTo(this.path[0].x, this.path[0].y);
      this.path.forEach(point => context.lineTo(point.x, point.y));      
      context.stroke();
      this.drawExtent(context);
      context.restore();
    }

    transformBy(matrix) {
      this.start = Matrix.applyMatrix(this.start, matrix);
      this.end = Matrix.applyMatrix(this.end, matrix);
      this.calculateExtent();
    }

    serialize() {
      return {
        ...super.serialize(),
        path: [...this.path],
        type:  ENTITYTYPE.PATH
      };
    }
  
    static deserialize(data) {
      if (data.type ===  ENTITYTYPE.PATH) {
        return new Path(
          data.strokeStyle,
          data.strokeColor,
          data.strokeWidth,
          data.fillStyle,
          data.fillColor,
          data.opacity,
          data.path,
          data.id,
          data.hovered,
          data.selected
        );
      }
      throw new Error('Unsupported type for deserialization');
    }
    
    isPointAbove(mouseX, mouseY, tolerance = 5) {
      if (this.path.length < 2) {
        return false; // No segments to check
      }
  
      for (let i = 0; i < this.path.length - 1; i++) {
        const start = this.path[i];
        const end = this.path[i + 1];
  
        // Calculate the perpendicular distance from the point to the line segment
        const numerator = Math.abs(
          (end.y - start.y) * mouseX - (end.x - start.x) * mouseY + end.x * start.y - end.y * start.x
        );
        const denominator = Math.sqrt(
          Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2)
        );
        const distance = numerator / denominator;
  
        // If the mouse is within tolerance of this segment, return true
        if (distance <= tolerance) {
          // Check if the point is within the bounds of the segment
          const minX = Math.min(start.x, end.x);
          const maxX = Math.max(start.x, end.x);
          const minY = Math.min(start.y, end.y);
          const maxY = Math.max(start.y, end.y);
  
          if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
            return true;
          }
        }
      }
  
      return false; // No segment is within tolerance
    }

  }
  
  export default Path;

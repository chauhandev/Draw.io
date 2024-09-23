import Matrix from "../utility/Matrix";
import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Line extends Entity {
    constructor(strokeStyle,strokeColor, strokeWidth,fillStyle,fillColor, start, end,opacity,id,hovered, selected) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,opacity,id,hovered,selected);
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
          data.id,
          data.hovered,
          data.selected
        );
      }
      throw new Error('Unsupported type for deserialization');
    }
    
    isPointAbove(mouseX, mouseY, tolerance = 10) {
      // Helper function to calculate distance between two points (x1, y1) and (x2, y2)
      const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      };
    
      // Calculate the distance between the start and end points
      const lineDistance = calculateDistance(this.start.x, this.start.y, this.end.x, this.end.y);
    
      // Calculate the distance between the mouse point and the start point
      const distanceToStart = calculateDistance(mouseX, mouseY, this.start.x, this.start.y);
    
      // Calculate the distance between the mouse point and the end point
      const distanceToEnd = calculateDistance(mouseX, mouseY, this.end.x, this.end.y);
    
      // Check if the sum of the distances is approximately equal to the line distance within tolerance
      const totalDistance = distanceToStart + distanceToEnd;
      
      // Return true if the total distance is close to the line distance within the specified tolerance
      return Math.abs(totalDistance - lineDistance) <= tolerance;
    }
    
  }
  
  export default Line;


class Entity {
    constructor(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor ,opacity) {
      this.id = Date.now();
      this.strokeStyle = strokeStyle || 'dashed';
      this.strokeColor = strokeColor || 'red';
      this.strokeWidth = strokeWidth || 1;
      this.fillStyle = fillStyle || 'none';
      this.fillColor = fillColor || 'transparent';
      this.selected = false;
      this.hovered = false;
      this.erased = false;
      this.extents = { 
        min: { x: 0, y: 0 }, 
        max: { x: 0, y: 0 } 
      };
      this.opacity = opacity || 1;
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
      throw new Error('transformBy() method must be implemented');
    }
    applyCanvasProperties(context) {
        context.strokeStyle = this.strokeColor;
        context.lineWidth = this.strokeWidth;
        context.fillStyle = this.fillColor;

        if(this.strokeStyle==="dashed")
          context.setLineDash([5, 5]);
        else 
          context.setLineDash([]);
        context.globalAlpha = this.opacity;
      }

      serialize() {
        return {
          strokeStyle: this.strokeStyle,
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth,
          fillStyle: this.fillStyle,
          fillColor: this.fillColor,
          extents: this.extents,
          opacity:this.opacity
        };
      }

      drawExtent(context){
          const width = this.extents.max.x -this.extents.min.x +2
          const height = this.extents.max.y -this.extents.min.y +2
         const rectangle = new Rectangle(dashed,"blue",this.strokeWidth,this.fillStyle,"transparent",this.extents.min,width,height);
         rectangle.draw(context);

      }
     
  }
  
  export default Entity;
import Entity from "./entity";
import ENTITYTYPE from './EnittyType';

class Text extends Entity {
    constructor(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor, text, position, font = '16px Arial', align = 'left', baseline = 'alphabetic',id,hovered,selected) {
      super(strokeStyle, strokeColor, strokeWidth, fillStyle, fillColor,id,hovered,selected);
      this.text = text;
      this.position = position;
      this.font = font;  // e.g., "16px Arial"
      this.align = align; // 'left', 'right', 'center', etc.
      this.baseline = baseline; // 'top', 'bottom', 'middle', etc.
      this.calculateExtent(); 
    }
  
    // Calculate extent for text
    calculateExtent() {
      const context = document.createElement('canvas').getContext('2d');
      context.font = this.font;
      const textMetrics = context.measureText(this.text);
  
      const textWidth = textMetrics.width;
      const fontSize = parseInt(this.font); // Extract font size from "16px Arial"
  
      // Adjust extents based on alignment and baseline
      let xMin = this.position.x;
      let yMin = this.position.y - fontSize;
  
      if (this.align === 'center') {
        xMin -= textWidth / 2;
      } else if (this.align === 'right') {
        xMin -= textWidth;
      }
  
      if (this.baseline === 'top') {
        yMin += fontSize;
      } else if (this.baseline === 'middle') {
        yMin += fontSize / 2;
      }
  
      this.extents.min = { x: xMin, y: yMin };
      this.extents.max = { x: xMin + textWidth, y: yMin + fontSize };
    }
  
    // Draw the text
    draw(context) {
      context.save()
      this.applyCanvasProperties(context);
  
      context.font = this.font;
      context.textAlign = this.align;
      context.textBaseline = this.baseline;
  
      if (this.fillStyle === 'fill') {
        context.fillText(this.text, this.position.x, this.position.y);
      }
  
      context.strokeText(this.text, this.position.x, this.position.y);
      this.drawExtent(context);
      context.restore();
    }

    transformBy(matrix) {
      this.position = this.applyMatrix(this.position, matrix);
      this.calculateExtent();
    }
    serialize() {
      return {
        ...super.serialize(),
        text: this.text,
        font: this.font,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline,
        position:{...this.position},
        type:  ENTITYTYPE.TEXT
      };
    }
  
    static deserialize(data) {
      if (data.type === ENTITYTYPE.TEXT) {
        return new Text(
          data.strokeStyle,
          data.strokeColor,
          data.strokeWidth,
          data.fillStyle,
          data.fillColor,
          data.text,
          data.position,
          data.font,
          data.textAlign,
          data.textBaseline,
          data.opacity,
          data.id,
          data.hovered,
          data.selected
        );
      }
      throw new Error('Unsupported type for deserialization');
    }
  }

  export default Text;
  
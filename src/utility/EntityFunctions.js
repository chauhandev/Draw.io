import Circle from "../models/Circle";
import Ellipse from "../models/Ellipse";
import ENTITYTYPE from "../models/EnittyType";
import Line from "../models/Line";
import Path from "../models/Path";
import Rectangle from "../models/Rectangle";

function createObject(command, event) {
  console.log(
    strokeColorRef.current,
    strokeStyleRef.current,
    strokeWidthRef.current,
    fillColorRef.current,
    fillStyleRef.current,
    opacityRef.current
  );
  console.log("mouse move");

  // Clear the canvas for redrawing
  ctx.clearRect(0, 0, dimensions.width, dimensions.height);

  // Calculate width and height for the rectangle or ellipse-like shapes
  const width = event.clientX - intitialPoint.x;
  const height = event.clientY - intitialPoint.y;

  // Initialize the entity object
  let entity = null;

  // Based on the command, create the appropriate object
  switch (command) {
    case 'Rectangle':
      entity = new Rectangle(
        strokeStyleRef.current,
        strokeColorRef.current,
        strokeWidthRef.current,
        fillStyleRef.current,
        fillColorRef.current,
        { x: intitialPoint.x, y: intitialPoint.y },
        width,
        height
      );
      break;

    case 'Circle':
      // Radius is assumed to be the smaller of the width and height
      const radius = Math.min(width, height) / 2;
      entity = new Circle(
        strokeStyleRef.current,
        strokeColorRef.current,
        strokeWidthRef.current,
        fillStyleRef.current,
        fillColorRef.current,
        { x: intitialPoint.x, y: intitialPoint.y },
        radius
      );
      break;

    case 'Line':
      entity = new Line(
        strokeStyleRef.current,
        strokeColorRef.current,
        strokeWidthRef.current,
        fillStyleRef.current,
        fillColorRef.current,
        { x: intitialPoint.x, y: intitialPoint.y },
        { x: event.clientX, y: event.clientY } // Endpoint for the line
      );
      break;

    case 'Ellipse':
      entity = new Ellipse(
        strokeStyleRef.current,
        strokeColorRef.current,
        strokeWidthRef.current,
        fillStyleRef.current,
        fillColorRef.current,
        { x: intitialPoint.x, y: intitialPoint.y },
        width,
        height
      );
      break;

    case 'Text':
      const textContent = 'Sample Text'; // Replace with dynamic text content
      const font = '20px Arial'; // Replace with dynamic font if needed
      const textAlign = 'center'; // Replace with dynamic text alignment
      const textBaseline = 'alphabetic'; // Replace with dynamic text baseline
      entity = new Text(
        'solid', 
        strokeColorRef.current, 
        strokeWidthRef.current, 
        fillStyleRef.current, 
        fillColorRef.current, 
        textContent, 
        { x: intitialPoint.x, y: intitialPoint.y }, 
        font, 
        textAlign, 
        textBaseline
      );
      break;

    default:
      console.warn(`Unsupported command: ${command}`);
      return null;
  }

  // Draw the entity on the canvas
  if (entity) {
    entity.draw(ctx);
  }

  return entity; // Return the entity for further use if needed
}

export const isPointInside= (entity,mouseX,mouseY)=>{
  let isPointIntersect = false;
  switch (entity.type) {
    case ENTITYTYPE.CIRCLE:
      isPointIntersect = Circle.deserialize(entity).isPointInside(mouseX,mouseY);
      break;
    case ENTITYTYPE.LINE:
      isPointIntersect = Line.deserialize(entity).isPointInside(mouseX,mouseY);
      break;
    case ENTITYTYPE.RECTANGLE:
      isPointIntersect = Rectangle.deserialize(entity).isPointInside(mouseX,mouseY);
      break;
    case ENTITYTYPE.ELLIPSE:
      isPointIntersect = Ellipse.deserialize(entity).isPointInside(mouseX,mouseY);
      break;
    case ENTITYTYPE.TEXT:
      isPointIntersect = Text.deserialize(entity).isPointInside(mouseX,mouseY);
      break;
    default:
      break;
  }
  return isPointIntersect;
}


export const isPointAbove = (entity, mouseX, mouseY) => {
  let isAbove = false;
  switch (entity.type) {
    case ENTITYTYPE.CIRCLE:
      isAbove = Circle.deserialize(entity).isPointAbove(mouseX, mouseY);
      break;
    case ENTITYTYPE.LINE:
      isAbove = Line.deserialize(entity).isPointAbove(mouseX, mouseY);
      break;
    case ENTITYTYPE.RECTANGLE:
      isAbove = Rectangle.deserialize(entity).isPointAbove(mouseX, mouseY);
      break;
    case ENTITYTYPE.ELLIPSE:
      isAbove = Ellipse.deserialize(entity).isPointAbove(mouseX, mouseY);
      break;
    case ENTITYTYPE.PATH:
      isAbove = Path.deserialize(entity).isPointAbove(mouseX, mouseY);
      break;
    default:
      break;
  }
  return isAbove;
};


export const getDrawingExtents = (entities)=>{
  if(entities.length <= 0)
    return { 
               min: { x: 0, y: 0 },
               max: { x: 0, y: 0 }
           }
           
  let minPoint = {x:Number.MAX_VALUE,y:Number.MAX_VALUE};
  let maxPoint = {x:Number.MIN_VALUE,y:Number.MIN_VALUE};
  entities.forEach(ent => {
      minPoint.x = Math.min(minPoint.x,ent.extents.min.x);
      minPoint.y = Math.min(minPoint.y, ent.extents.min.y);
      maxPoint.x = Math.max(maxPoint.x, ent.extents.max.x);
      maxPoint.y = Math.max(maxPoint.y, ent.extents.max.y);
   
  });

  return {
    min:minPoint,
    max:maxPoint
  }
}



// Method to check if two extents intersect
export function isExtentIntersecting(extent1, extent2) {
  // Check if one extent is to the left of the other or above the other
  if (
    extent1.max.x < extent2.min.x ||  
    extent1.min.x > extent2.max.x || 
    extent1.max.y < extent2.min.y || 
    extent1.min.y > extent2.max.y     
  ) {
    return false; 
  }
  return true;
}

// Method to check if extent1 is completely inside extent2
export function isExtentInside(extent1, extent2) {
  return (
    extent1.min.x >= extent2.min.x && extent1.max.x <= extent2.max.x && 
    extent1.min.y >= extent2.min.y && extent1.max.y <= extent2.max.y    
  );
}

export function correctExtent(extent) {
  const { min, max } = extent;

  if (max.x < min.x) {
      [min.x, max.x] = [max.x, min.x]; 
  }

  if (max.y < min.y) {
      [min.y, max.y] = [max.y, min.y];
  }
  return { min, max }; 
}

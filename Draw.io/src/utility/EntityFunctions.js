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

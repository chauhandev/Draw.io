import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Line from '../models/Line';
import Rectangle from '../models/Rectangle';
import Circle from '../models/Circle';
import Ellipse from '../models/Ellipse';
import Text from '../models/Text';
import { COMMANDS } from '../constants';
import { addElement, removeElement } from '../slices/canvasElements';
import { onActionItemClick, onActiveItemClick } from '../slices/commandSlice';
import ENTITYTYPE from '../models/EnittyType';
import { History, AddElementCommand, RemoveElementCommand } from '../command/command.js';
import { undo, redo ,setHover,setSelection,removeElements} from '../slices/canvasElements.js';
import {isPointInside,isPointAbove,getDrawingExtents,isExtentIntersecting,isExtentInside,correctExtent} from '../utility/EntityFunctions.js'
import Path from '../models/Path.js';


const CURSORS = {
  DEFAULT: "pointer",
  CROSSHAIR: "crosshair",
  GRAB: "grab",
  GRABBING: "grabbing",
  MOVE: "move",
  DELETE: "not-allowed", 
};


const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const frontCanvasRef = useRef(null);

  const [ dimensions, setDimensions ] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [ zoomLevel, setZoomLevel ] = useState(100);
  const [cursorClass, setCursorClass] = useState("cursor-crosshair");
  const [hovered, setHovered] = useState(false);
  const [panning, setPanning] = useState(false);



  const strokeColor = useSelector((state) => state.canvasProperties.strokeColor);
  const fillColor = useSelector((state) => state.canvasProperties.fillColor);
  const fillStyle = useSelector((state) => state.canvasProperties.fillStyle);
  const strokeWidth = useSelector((state) => state.canvasProperties.strokeWidth);
  const strokeStyle = useSelector((state) => state.canvasProperties.strokeStyle);
  const canvasColor = useSelector((state) => state.canvasProperties.canvasColor);
  const showGrid = useSelector((state) => state.canvasProperties.showGrid);
  const opacity = useSelector((state) => state.canvasProperties.opacity);

  const activeCommand = useSelector((state) => state.command.activeCommandName);
  const actionCommand = useSelector((state) => state.command.actionCommandName);
  const elements = useSelector((state) => state.entities.elements);

  const strokeColorRef = useRef(strokeColor);
  const fillColorRef = useRef(fillColor);
  const strokeWidthRef = useRef(strokeWidth);
  const fillStyleRef = useRef(fillStyle);
  const strokeStyleRef = useRef(strokeStyle);
  const opacityRef = useRef(opacity);
  const activeCommandRef = useRef(activeCommand);
  const actionCommandRef = useRef(actionCommand);
  const elementsRef = useRef([ ...elements ]);
  const showGridRef = useRef(showGrid);
  const originRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const historyRef = useRef(new History());
  const isMouseDown = useRef(false);

  const dispatch = useDispatch();
  let initialPointRef = useRef();
  let pathRef = useRef([]);
  const MIN_ZOOM = 10; 
  const MAX_ZOOM = 500; 
  const ZOOM_SPEED = 1;

  useEffect(() => {
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      setDimensions({ width: window.innerWidth , height: window.innerHeight });
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        dispatch(onActiveItemClick(null))
      }
    }

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('mousedown', handleClickEvent);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('wheel', handleWheelEvent);
      window.removeEventListener('mousedown', handleClickEvent);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current == null || frontCanvasRef.current == null) return;
    const canvas = canvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const frontCtx = frontCanvas.getContext("2d");
  
    const savedTransform = ctx.getTransform();
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    frontCanvas.width = dimensions.width;
    frontCanvas.height = dimensions.height;
    ctx.setTransform(savedTransform);
    frontCtx.setTransform(savedTransform);
    reDraw();
  }, [dimensions ]);

  useEffect(() => {
    if (actionCommand == null) return;
    if (actionCommand === COMMANDS.ZOOMIN) {
      ZoomCentre(true);
    } else if (actionCommand === COMMANDS.ZOOMOUT) {
      ZoomCentre(false);
    }
     else if (actionCommand === COMMANDS.ZOOMEXTENT) {
      ZoomExtents();
  }
  }, [ actionCommand ]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
    fillColorRef.current = fillColor;
    strokeWidthRef.current = strokeWidth;
    fillStyleRef.current = fillStyle;
    strokeStyleRef.current = strokeStyle;
    opacityRef.current = opacity;
    activeCommandRef.current = activeCommand;
    actionCommandRef.current = actionCommand;
    elementsRef.current = [ ...elements ];
    showGridRef.current = showGrid;
    updateCursor(activeCommand);
    
    reDraw();
  }, [ strokeColor, fillColor, strokeWidth, fillStyle, strokeStyle, opacity, activeCommand, actionCommand, elements, showGrid,panning,hovered ]);

  const smoothZoom = useCallback((targetScale, centerX, centerY) => {
    const startScale = 1;
    const startTime = performance.now();
    const duration = 100;

    const zoomStep = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);

      const currentScale = startScale + (targetScale - startScale) * easeProgress;
      ZoomByPoint(currentScale, centerX, centerY);

      if (progress < 1) {
        requestAnimationFrame(zoomStep);
      }
    };

    requestAnimationFrame(zoomStep);
  }, []);

  const handleWheelEvent = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = Math.pow(2, -e.deltaY * ZOOM_SPEED / 100);
    smoothZoom(zoomFactor, e.offsetX, e.offsetY);
  }, [ smoothZoom ]);

  const ZoomCentre = (zoomIn) => {
    const ZoomBy = 10;
    const ZOOMFACTOR = ZoomBy / 100.0;
    let zoom = 1 + ZOOMFACTOR;

    if (!zoomIn)
      zoom = 1 / zoom;

    // smoothZoom(zoom);
    ZoomByPoint(zoom);

  };
  const ZoomByPoint = (zoomFactor, clientX, clientY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frontCtx = frontCanvasRef.current.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const minZoom = 0.1; 
    const maxZoom = 5;   

    let newScale = scaleRef.current * zoomFactor;
    newScale = Math.max(minZoom, Math.min(maxZoom, newScale));

    zoomFactor = newScale / scaleRef.current;

    let newOrigin;
    if (clientX !== undefined && clientY !== undefined) {
        // Get the mouse position relative to the canvas
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Calculate new origin based on the zoom towards the mouse point
        newOrigin = {
            x: (mouseX / scaleRef.current) + originRef.current.x - (mouseX / (scaleRef.current * zoomFactor)),
            y: (mouseY / scaleRef.current) + originRef.current.y - (mouseY / (scaleRef.current * zoomFactor)),
        };
    } else {
        // Zoom by center if no mouse position is provided
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate new origin based on the zoom towards the center
        newOrigin = {
            x: (centerX / scaleRef.current) + originRef.current.x - (centerX / (scaleRef.current * zoomFactor)),
            y: (centerY / scaleRef.current) + originRef.current.y - (centerY / (scaleRef.current * zoomFactor)),
        };
    }

    // Clear canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frontCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply the transformations for both canvases
    ctx.translate(originRef.current.x, originRef.current.y);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-newOrigin.x, -newOrigin.y);

    frontCtx.translate(originRef.current.x, originRef.current.y);
    frontCtx.scale(zoomFactor, zoomFactor);
    frontCtx.translate(-newOrigin.x, -newOrigin.y);

    scaleRef.current = newScale;
    originRef.current = { x: newOrigin.x, y: newOrigin.y };

    reDraw(ctx, newScale, newOrigin);

    setZoomLevel(Math.round(newScale * 100));

    dispatch(onActionItemClick(null));
};


  const ZoomExtents = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frontCanvas = frontCanvasRef.current;
    const frontCtx = frontCanvas.getContext('2d');

    const ext = getDrawingExtents(elementsRef.current);
    const width = Math.abs(ext.max.x - ext.min.x);
    const height = Math.abs(ext.max.y - ext.min.y);

    const scaleValueForXDirFitting = dimensions.width / width;
    const scaleValueForYDirFitting = dimensions.height / height;

    let scaleVal, translateX, translateY;

    if (height * scaleValueForXDirFitting > dimensions.height) {
        scaleVal = scaleValueForYDirFitting;
        translateX = ext.min.x - ((dimensions.width / scaleVal - width) / 2);
        translateY = dimensions.height - ext.max.y;
    } else {
        scaleVal = scaleValueForXDirFitting;
        translateX = ext.min.x;
        translateY = (dimensions.height - ext.max.y) - ((dimensions.height / scaleVal - height) / 2);
    }

    // Update scale and origin
    scaleRef.current = scaleVal;
    originRef.current = { x: translateX, y: translateY };

    // Reset and apply transformations for both canvases
    [ctx, frontCtx].forEach(context => {
        context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations
        context.scale(scaleRef.current, scaleRef.current); // Apply scaling
        context.translate(-originRef.current.x, -originRef.current.y); // Apply translation
    });

    // Dispatch action
    dispatch(onActionItemClick(null));
};


  const drawElements = (context) => {
    context.save();
    elementsRef.current.forEach((element) => {
      switch (element.type) {
        case ENTITYTYPE.CIRCLE:
          Circle.deserialize(element).draw(context);
          break;
        case ENTITYTYPE.LINE:
          Line.deserialize(element).draw(context);
          break;
        case ENTITYTYPE.RECTANGLE:
          Rectangle.deserialize(element).draw(context);
          break;
        case ENTITYTYPE.ELLIPSE:
          Ellipse.deserialize(element).draw(context);
          break;
        case ENTITYTYPE.TEXT:
          Text.deserialize(element).draw(context);
          break;
          case ENTITYTYPE.PATH:
          Path.deserialize(element).draw(context);
          break;
        default:
          break;
      }
    });
    context.restore();
  };


  const handleClickEvent = (e) => {
    if (frontCanvasRef.current && activeCommandRef.current == COMMANDS.PAN) {
      setPanning(true);
    }
    isMouseDown.current = true;

    if(activeCommandRef.current == COMMANDS.ERASER){
      const rect = canvasRef.current.getBoundingClientRect();
      let mousePosition ={ x:e.clientX - rect.left ,y:e.clientY - rect.top} ;
      const normalizedCursorPostion = getNormalizedCoordinate(mousePosition)
      for (let entity of elementsRef.current) {        
        if (isPointAbove(entity, normalizedCursorPostion.x, normalizedCursorPostion.y)) {
          dispatch(removeElement(entity.id));
          return;
        }
      }
    }
    initialPointRef.current = { x: e.clientX, y: e.clientY };
    if (!Array.isArray(pathRef.current)) {
      pathRef.current = [];
    }
  };

  const handleMouseMove = (e) => {
    if (initialPointRef.current == null && (activeCommandRef.current == null || activeCommandRef.current === COMMANDS.ERASER )) {
      const rect = canvasRef.current.getBoundingClientRect();
      let mousePosition ={ x:e.clientX - rect.left ,y:e.clientY - rect.top} ;
      const normalizedCursorPostion = getNormalizedCoordinate(mousePosition)
      let isHovered = false;
      for (let entity of elementsRef.current) {
        if (isPointAbove(entity, normalizedCursorPostion.x, normalizedCursorPostion.y)) {
          isHovered = true;
          setHovered(true);
          dispatch(setHover(entity.id));
          break;
        }
      }
      if (!isHovered) {
        setHovered(false);
        dispatch(setHover({ id: null }));
      }
      return;
    }
    if(initialPointRef.current == null)
      return;

    if (activeCommandRef.current === null) {
      drawSelection(e);
    }
    else if (activeCommandRef.current === COMMANDS.PAN) {
      const change = {
        x: (e.clientX - initialPointRef.current.x),
        y: (e.clientY - initialPointRef.current.y)
      };
      initialPointRef.current.x = e.clientX;
      initialPointRef.current.y = e.clientY;
      //initialPointRef.current =  getNormalizedCoordinate({ x: e.clientX, y: e.clientY });
      doPan(change);
    }
    else {
      if ( isMouseDown.current && activeCommandRef.current === COMMANDS.FREEHAND) {
        pathRef.current.push( getNormalizedCoordinate({ x: e.clientX, y: e.clientY }));
      }
      createObject(e, activeCommandRef.current);
    }
  }
  
  const handleMouseUp= (event)=> {
    isMouseDown.current = false;
    if(initialPointRef.current == null)
      return;
    const ctx = frontCanvasRef.current.getContext('2d');
    if(activeCommandRef.current == null){
      updateSelectionSet(getNormalizedCoordinate({x:event.clientX,y:event.clientY}))
    }
    if (activeCommandRef.current !== COMMANDS.PAN) {
      const entity = createObject(event, activeCommandRef.current);
      if (entity) {
        const serializedEntity = entity.serialize();
        const command = new AddElementCommand(elementsRef.current, serializedEntity);
        historyRef.current.execute(command);
        dispatch(addElement(serializedEntity));
      }
      ClearCanvas(ctx)
    }

    initialPointRef.current = null;
    pathRef.current = [] ;
    setPanning(false);
  }

  const createObject = (event, command)=> {
    if (!initialPointRef.current) return;
    const ctx = frontCanvasRef.current.getContext('2d');
    ClearCanvas(ctx)
    const width = (event.clientX - initialPointRef.current.x) / scaleRef.current;
    const height = (event.clientY - initialPointRef.current.y) / scaleRef.current;
    let entity = null;
    const position = getNormalizedCoordinate(initialPointRef.current)
    switch (command) {
      case COMMANDS.RECTANGLE:
        entity = new Rectangle(
          strokeStyleRef.current,
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,
          position,
          width,
          height,
          opacityRef.current
        );
        break;

      case COMMANDS.CIRCLE:
        const radius = Math.sqrt(Math.abs(width) ** 2 + Math.abs(height) ** 2);
        entity = new Circle(
          strokeStyleRef.current,
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,
          position,
          radius,
          opacityRef.current
        );
        break;

      case COMMANDS.LINE:
        entity = new Line(
          strokeStyleRef.current,
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,
          position,
          { x: position.x + width, y: position.y + height },
          opacityRef.current
        );
        break;

      case COMMANDS.ELLIPSE:
        entity = new Ellipse(
          strokeStyleRef.current,
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,
          position,
          Math.abs(width),
          Math.abs(height),
          opacityRef.current
        );
        break;

      case COMMANDS.TEXT:
        const textContent = 'Sample Text';
        const font = '20px Arial';
        const textAlign = 'center';
        const textBaseline = 'alphabetic';
        entity = new Text(
          'solid',
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,
          textContent,
          position,
          font,
          textAlign,
          textBaseline,
          opacityRef.current
        );
        break;

        case COMMANDS.FREEHAND:
          console.log(pathRef.current)
        entity = new Path(
          strokeStyleRef.current,
          strokeColorRef.current,
          strokeWidthRef.current,
          fillStyleRef.current,
          fillColorRef.current,          
          opacityRef.current,
          pathRef.current
        );
        break;

      default:
        console.warn(`Unsupported command: ${command}`);
        return null;
    }

    if (entity) {
      entity.draw(ctx);
    }

    return entity;
  }

  const doPan = (newOrigin) => {
    if (scaleRef.current == null || originRef.current == null)
      return;
    newOrigin.x /= scaleRef.current;
    newOrigin.y /= scaleRef.current;
    const ctx = canvasRef.current.getContext('2d');
    const frontctx = frontCanvasRef.current.getContext('2d');

    ctx.translate(newOrigin.x, newOrigin.y)
    frontctx.translate(newOrigin.x, newOrigin.y)

    originRef.current = { x: originRef.current.x - newOrigin.x, y: originRef.current.y - newOrigin.y }

    reDraw();
  };

  const  drawSelection =(event)=>{
    if (!initialPointRef.current) return;
    const ctx = frontCanvasRef.current.getContext('2d');
    ClearCanvas(ctx)
    const width = (event.clientX - initialPointRef.current.x) / scaleRef.current;
    const height = (event.clientY - initialPointRef.current.y) / scaleRef.current;
    const position = getNormalizedCoordinate(initialPointRef.current);

    const  isWindowSelect = width< 0 ? false : true;
    const opacity = 0.2;
    let entity = null;
    if(isWindowSelect){
      entity = new Rectangle(
        "solid",
        "white",
        strokeWidthRef.current,
        fillStyleRef.current,
        "#0000FF",
        position,
        width,
        height,
        opacity
      );
    }
    else{
      entity = new Rectangle(
        "dashed",
        "white",
        strokeWidthRef.current,
        fillStyleRef.current,
        "#00FF00",
        position,
        width,
        height,
        opacity
      );
    }
    entity.draw(ctx);   
  }
   
  const updateSelectionSet= (currentPoint) =>{
      const prevPoint = getNormalizedCoordinate(initialPointRef.current);
      let isWindowSelect = true;
      if(prevPoint.x> currentPoint.x)
         isWindowSelect = false;
      const selectionExtents =correctExtent({min:prevPoint,max:currentPoint});
      const selectedEnt = [];

      if(isWindowSelect){
        elementsRef.current.forEach((ele)=> {
              if(isExtentInside(ele.extents,selectionExtents)){
                selectedEnt.push(ele.id)
              }

          })
      }
      else{
         elementsRef.current.forEach((ele)=> {
                if(isExtentIntersecting(ele.extents,selectionExtents)){
                  selectedEnt.push(ele.id)
                }
  
            })
      }
      dispatch(setSelection(selectedEnt));
  }

  // Re-draw all elements on the canvas with the current scale and origin
  const reDraw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ClearCanvas(ctx);

    //test rectancle draw on current screen
    //ctx.beginPath();
    //ctx.rect(originRef.current.x + 5, originRef.current.y + 5, dimensions.width / scaleRef.current - 10, dimensions.height / scaleRef.current - 10);
    //ctx.stroke();

    drawGrid(ctx)
    drawElements(ctx);
  };


  const drawGrid = (ctx) => {
    if (!showGridRef.current) return;

    // Calculate visible canvas area adjusted by scale and origin
    const width = dimensions.width / scaleRef.current + originRef.current.x;
    const height = dimensions.height / scaleRef.current + originRef.current.y;

    const majorGridSpacing = { x: 100, y: 100 };
    const minorGridSpacing = { x: 20, y: 20};

    ctx.save();
    ctx.lineWidth = 1 / scaleRef.current;

    // Helper function to draw vertical and horizontal grid lines
    const drawLines = (spacing, strokeStyle) => {
      ctx.strokeStyle = strokeStyle;

      const startX = originRef.current.x - originRef.current.x % spacing.x;
      const startY = originRef.current.y - originRef.current.y % spacing.y;

      // Draw vertical lines
      for (let x = startX; x <= width; x += spacing.x) {
        ctx.beginPath();
        ctx.moveTo(x, originRef.current.y);
        ctx.lineTo(x, dimensions.height / scaleRef.current + originRef.current.y);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = startY; y <= height; y += spacing.y) {
        ctx.beginPath();
        ctx.moveTo(originRef.current.x, y);
        ctx.lineTo(dimensions.width / scaleRef.current + originRef.current.x, y);
        ctx.stroke();
      }
    };

    // Draw minor grid lines
    drawLines(minorGridSpacing, '#e0e0e0');
    // Draw major grid lines
    drawLines(majorGridSpacing, '#a3a0a0');

    ctx.restore();
  };

  const getNormalizedCoordinate = (position) => {
    return { x: position.x / scaleRef.current + originRef.current.x, y: position.y / scaleRef.current + originRef.current.y }
  };

  const ClearCanvas = (ctx) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          const ZoomBy = 10;
          const ZOOMFACTOR = ZoomBy / 100.0;
          let zoom = 1 + ZOOMFACTOR;
          e.preventDefault();
          ZoomByPoint(zoom);
        } else if (e.key === '-') {
          e.preventDefault();
          const ZoomBy = 10;
          const ZOOMFACTOR = ZoomBy / 100.0;
          let zoom = 1 + ZOOMFACTOR;
          zoom = 1 / zoom;
          ZoomByPoint(zoom);
        }
        else if(e.key === 'z'){
          if (historyRef.current.canUndo()) {
            dispatch(undo());
          }
        }
        else if(e.key === 'y'){
          dispatch(redo());
        }      
      }
      else if(e.key === 'Delete'){
        dispatch(removeElements())
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ smoothZoom, dimensions ]);

  const updateCursor = (command) => {
      if(hovered && activeCommandRef.current == null){
        setCursorClass("cursor-move"); 
        return;
      }
      if(panning){
        setCursorClass("cursor-grabbing"); 
        return;
      }
    
    switch (command) {
      case COMMANDS.PAN:
        setCursorClass("cursor-grab"); 
        break;
      case "PANNING":
          setCursorClass("cursor-grabbing"); 
          break;
      case COMMANDS.ERASER:
        setCursorClass("cursor-eraser"); 
        break;
      case "HOVER":
        setCursorClass("cursor-move"); 
        break;
        case COMMANDS.FREEHAND:
        setCursorClass("cursor-pencil"); 
        break;
      default:
        setCursorClass("cursor-crosshair");
        break;
    }
  };

return (
    <>
      <canvas ref={canvasRef} style={{ backgroundColor: canvasColor }}  />
      <canvas ref={frontCanvasRef}  className={`absolute left-0 top-0 ${cursorClass}`} />
      <div className='absolute select-none right-3 top-3 bg-background px-1 rounded-3xl'>
        Zoom: {zoomLevel}%
      </div>
    </>
  );
};

export default DrawingBoard;
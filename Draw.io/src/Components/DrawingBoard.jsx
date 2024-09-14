import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Line from '../models/Line';
import Rectangle from '../models/Rectangle';
import Circle from '../models/Circle';
import Ellipse from '../models/Ellipse';
import Text from '../models/Text';
import { COMMANDS } from '../constants';
import { addElement } from '../slices/canvasElements';
import { onActionItemClick, onActiveItemClick } from '../slices/commandSlice';
import ENTITYTYPE from '../models/EnittyType';

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const frontCanvasRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [zoomLevel, setZoomLevel] = useState(100);

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
  const elementsRef = useRef(elements);
  const showGridRef = useRef(showGrid);

  const originRef = useRef({x:0, y:0});
  const scaleRef = useRef(1);

  const dispatch = useDispatch();
  let initialPoint = null;

  const MIN_ZOOM = 10; // 10%
  const MAX_ZOOM = 500; // 500%
  const ZOOM_SPEED = 1;

  useEffect(() => {
    const updateCanvasSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        dispatch(onActiveItemClick(null))
      }
    }

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('mousedown', handleClickEvent);
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('wheel', handleWheelEvent);
      window.removeEventListener('mousedown', handleClickEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current == null || frontCanvasRef.current == null) return;
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    frontCanvas.width = dimensions.width;
    frontCanvas.height = dimensions.height;
   
    // canvas.width = dimensions.width*dpr;
    // canvas.height = dimensions.height*dpr;

    // frontCanvas.width = dimensions.width*dpr;
    // frontCanvas.height = dimensions.height*dpr;
   

    // canvas.style.width = `${dimensions.width}px`;
    // canvas.style.height = `${dimensions.height}px`;
  
    // frontCanvas.style.width = `${dimensions.width}px`;
    // frontCanvas.style.height = `${dimensions.height}px`;

      // Get contexts
    const ctx = canvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    
    // ZoomByPoint(dpr)
    // scaleRef.current = dpr;
      // ctx.scale(dpr, dpr);
      // frontCtx.scale(dpr, dpr);
      // ctx.save();
      // frontCtx.save();
    reDraw();
  }, [dimensions]);

  useEffect(() => {
    if (actionCommand == null) return;
    if (actionCommand === COMMANDS.ZOOMIN) {
      ZoomCentre(true);
    } else if (actionCommand === COMMANDS.ZOOMOUT) {
      ZoomCentre(false);
    }
  }, [actionCommand]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
    fillColorRef.current = fillColor;
    strokeWidthRef.current = strokeWidth;
    fillStyleRef.current = fillStyle;
    strokeStyleRef.current = strokeStyle;
    opacityRef.current = opacity;
    activeCommandRef.current = activeCommand;
    actionCommandRef.current = actionCommand;
    elementsRef.current = elements;
    showGridRef.current = showGrid;
    reDraw();
  }, [strokeColor, fillColor, strokeWidth, fillStyle, strokeStyle, opacity, activeCommand, actionCommand, elements, showGrid]);

  const smoothZoom = useCallback((targetScale , centerX, centerY) => {
    const startScale = 1;
    const startTime = performance.now();
    const duration = 100; // milliseconds

    const zoomStep = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad

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
    const newScale = Math.min(MAX_ZOOM / 100, Math.max(MIN_ZOOM / 100, scaleRef.current * zoomFactor));
    // smoothZoom(newScale, e.offsetX, e.offsetY);
    ZoomByPoint(zoomFactor,e.offsetX, e.offsetY);
  }, [smoothZoom]);

  const ZoomCentre = (zoomIn) => {
    const ZoomBy = 10;
    const ZOOMFACTOR = ZoomBy / 100.0;
    let zoom = 1 + ZOOMFACTOR;

    if (!zoomIn)
      zoom = 1 / zoom;

    const newScale = Math.min(MAX_ZOOM / 100, Math.max(MIN_ZOOM / 100, scaleRef.current * zoom));
    // smoothZoom(zoom);
    ZoomByPoint(zoom);

  };
  const ZoomByPoint = (zoomFactor, clientX, clientY) => {
    console.log(zoomFactor,"zoomfactor")
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frontCtx = frontCanvasRef.current.getContext('2d');

    const rect = canvas.getBoundingClientRect();

    let newOrigin;
    if (clientX !== undefined && clientY !== undefined) {
        // Get the mouse position relative to the canvas
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        // Calculate new origin based on the zoom towards the mouse point
        newOrigin = {
            x: (mouseX/scaleRef.current)+originRef.current.x-(mouseX/ (scaleRef.current* zoomFactor)),
            y:(mouseY/scaleRef.current)+originRef.current.y-(mouseY/ (scaleRef.current * zoomFactor))
        };

    } else {
        // Zoom by center if no mouse position is provided
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate new origin based on the zoom towards the center
        newOrigin = {
            x:  (centerX/scaleRef.current)+originRef.current.x-(centerX/ (scaleRef.current* zoomFactor)),
            y:(centerY/scaleRef.current)+originRef.current.y-(centerY/ (scaleRef.current * zoomFactor))
        };
    }
    // Clear canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frontCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(originRef.current.x,originRef.current.y);
    ctx.scale(zoomFactor,zoomFactor);
    ctx.translate(-newOrigin.x,-newOrigin.y);
    frontCtx.translate(originRef.current.x,originRef.current.y);
    frontCtx.scale(zoomFactor,zoomFactor);
    frontCtx.translate(-newOrigin.x,-newOrigin.y);

    const newScale = scaleRef.current * zoomFactor ;

    scaleRef.current = newScale;
    originRef.current = {x:newOrigin.x,y:newOrigin.y};

    reDraw(ctx, newScale, newOrigin);
    setZoomLevel(Math.round(newScale * 100));

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
        default:
          break;
      }
    });
    context.restore();
  };


  const handleClickEvent = (e) => {
    if (!activeCommandRef.current || frontCanvasRef.current == null) return;
    
    if (canvasRef.current && actionCommandRef.current == COMMANDS.PAN) {
      canvasRef.current.classList.remove("cursor-grab");
      canvasRef.current.classList.add("cursor-grabbing");
    }
    const ctx = frontCanvasRef.current.getContext('2d');
    initialPoint = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    function handleMouseMove(event) {
      if (activeCommandRef.current === COMMANDS.PAN) {
        const change = {
          x: (event.clientX - initialPoint.x),
          y: (event.clientY - initialPoint.y)
        };
        initialPoint.x = event.clientX;
        initialPoint.y = event.clientY;
        // passing the change 
        doPan(change);

      } else {
        createObject(event, activeCommandRef.current);
      }
    }


    function handleMouseUp(event) {
      if (activeCommandRef.current !== COMMANDS.PAN) {
        const entity = createObject(event, activeCommandRef.current);
        if (entity) {
          dispatch(addElement(entity.serialize()));
        }
        ClearCanvas(ctx)
      }

      initialPoint = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    function createObject(event, command) {
      if (!initialPoint) return;
      ClearCanvas(ctx)
      const width = (event.clientX - initialPoint.x)/scaleRef.current;
      const height = (event.clientY - initialPoint.y)/scaleRef.current;
      let entity = null;
      const position = getNormalizedCoordinate(initialPoint)
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

        default:
          console.warn(`Unsupported command: ${command}`);
          return null;
      }

      if (entity) {
        entity.draw(ctx);
      }

      return entity;
    }

  };

  const doPan = (newOrigin) => {
    if(scaleRef.current == null || originRef.current== null)
      return;
    newOrigin.x /= scaleRef.current;
    newOrigin.y /= scaleRef.current;
    const ctx = canvasRef.current.getContext('2d');
    const frontctx = frontCanvasRef.current.getContext('2d');

    ctx.translate(newOrigin.x,newOrigin.y)
    frontctx.translate(newOrigin.x,newOrigin.y)
   
    originRef.current = { x: originRef.current.x - newOrigin.x, y: originRef.current.y - newOrigin.y }

    reDraw();
  };


   // Re-draw all elements on the canvas with the current scale and origin
const reDraw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ClearCanvas(ctx);

    //test rectancle draw on current screen
    ctx.beginPath();
    ctx.rect(originRef.current.x +5, originRef.current.y +5, dimensions.width / scaleRef.current -10, dimensions.height/ scaleRef.current-10);
    ctx.stroke();

    drawGrid(ctx)   
    drawElements(ctx);
    ctx.restore();
  };


  const drawGrid = (ctx) => {
    if (!showGridRef.current) return;
  
    // Calculate visible canvas area adjusted by scale and origin
    const width = dimensions.width / scaleRef.current + originRef.current.x;
    const height = dimensions.height / scaleRef.current + originRef.current.y;
  
    const majorGridSpacing = { x: 50, y: 50 };
    const minorGridSpacing = { x: 5, y: 5 };
  
    ctx.save();
    ctx.lineWidth = 1 / scaleRef.current;
    console.log(scaleRef.current);
  
    // Helper function to draw vertical and horizontal grid lines
    const drawLines = (spacing, strokeStyle) => {
      ctx.strokeStyle = strokeStyle;
  
      const startX = originRef.current.x-originRef.current.x % spacing.x;
      const startY = originRef.current.y-originRef.current.y % spacing.y;
  
      // Draw vertical lines
      for (let x = startX; x <= width; x += spacing.x) {
        ctx.beginPath();
        ctx.moveTo(x, originRef.current.y);
        ctx.lineTo(x, dimensions.height/ scaleRef.current + originRef.current.y);
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
    return {x: position.x / scaleRef.current + originRef.current.x, y: position.y / scaleRef.current + originRef.current.y}
  };

  const ClearCanvas = (ctx) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
     
  
      if (!zoomIn)
        zoom = 1 / zoom;
  
      const newScale = Math.min(MAX_ZOOM / 100, Math.max(MIN_ZOOM / 100, scaleRef.current * zoom));
      // smoothZoom(zoom);
      ZoomByPoint(zoom);
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          const ZoomBy = 10;
          const ZOOMFACTOR = ZoomBy / 100.0;
          let zoom = 1 + ZOOMFACTOR;
          e.preventDefault();
          ZoomByPoint(zoom);
          // smoothZoom(Math.min(MAX_ZOOM / 100, scaleRef.current * 1.1), dimensions.width / 2, dimensions.height / 2);
        } else if (e.key === '-') {
          e.preventDefault();
          const ZoomBy = 10;
          const ZOOMFACTOR = ZoomBy / 100.0;
          let zoom = 1 + ZOOMFACTOR;
          zoom = 1 / zoom;
          ZoomByPoint(zoom);
          // smoothZoom(Math.max(MIN_ZOOM / 100, scaleRef.current / 1.1), dimensions.width / 2, dimensions.height / 2);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [smoothZoom, dimensions]);

  return (
    <>
      <canvas ref={canvasRef} style={{ backgroundColor: canvasColor }} />
      <canvas ref={frontCanvasRef} style={{ position: 'absolute', left: 0, top: 0 }} />
      <div className='absolute select-none right-3 top-3 bg-background px-1'>
        Zoom: {zoomLevel}%
      </div>
    </>
  );
};

export default DrawingBoard;
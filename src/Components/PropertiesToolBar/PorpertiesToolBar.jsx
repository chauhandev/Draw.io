import React, { useState } from 'react';
import styles from './index.module.css'
import { useDispatch ,useSelector} from 'react-redux';
import { setCanvasColor ,setFillColor,setFillStyle,setStrokeColor,setStrokeStyle,setStrokeWidth,setOpacity ,toggleGrid} from '../../slices/canvasPropertiesSlice';

const PropertiesToolBar = ({theme="light"}) => {
  const [backgroundColor, setBackgroundcolor] = useState(useSelector((state)=>state.canvasProperties.backgroundColor));
  const [strokeColor, setStrokecolor] = useState(useSelector((state)=>state.canvasProperties.strokeColor));
  const [fillColor, setFillcolor] = useState(useSelector((state)=>state.canvasProperties.fillColor));

  const [strokeWidth, setStrokewidth] = useState(useSelector((state)=>state.canvasProperties.strokeWidth));
  const [strokeStyle, setStrokestyle] = useState(useSelector((state)=>state.canvasProperties.strokeStyle));
  const [opacity, setopacity] = useState(useSelector((state)=>state.canvasProperties.opacity));
  const showGrid = useSelector((state) => state.canvasProperties.showGrid);
  const activeCommandName = useSelector((state) => state.command.activeCommandName);

  const isDrawingCommandActive = activeCommandName? true :false;


  const dispatch = useDispatch();
   
  const handleBackGroundColor =(color)=>{
    setBackgroundcolor(color);
    dispatch(setCanvasColor(color));
  } 
  const HandleFillColor =(color)=>{
    setFillcolor(color);
    dispatch(setFillColor(color))
  }
  const HandleStrokeColor =(color)=>{
    setStrokecolor(color);
    dispatch(setStrokeColor(color))
  }
  const HandleStrokeStyle =(style)=>{
    setStrokestyle(style);
    dispatch(setStrokeStyle(style))
  }

  const HandleFillStyle =(style)=>{
    setFillstyle(style);
    dispatch(setFillStyle(style))
  }
  const HandleStrokeWidth =(width)=>{
    setStrokewidth(width);
    dispatch(setStrokeWidth(width))
  }

  const HandleStrokeOpacity = (opacity)=>{
    setopacity(opacity);
    dispatch(setOpacity(opacity))
  }
  return (    
      !isDrawingCommandActive ? <></> :
        <div className=
       {`
        ${styles.propertiesToolbarContainer}
        ${theme === 'light' ? styles.propertiesToolbarContainerLight : styles.propertiesToolbarContainerDark }
         select-none 
      `} 
      onMouseDown={(e)=> e.stopPropagation() } 
      >

    {/* Background Section */}
      <div > 
        <label className="text-sm font-bold">Background</label>
        <div className="flex space-x-2 mt-2">
          {['#FFFFFF', '#FFCCCC', '#CCFFCC', '#CCCCFF', '#CCFF99', '#FFFFCC'].map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full border ${
                backgroundColor === color ? 'ring-2 ring-black' : ''
              }`}
              onClick={() => handleBackGroundColor(color)}
            ></button>
          ))}
        </div>
      </div>

      <button
        onClick={() => dispatch(toggleGrid())}
        className="px-4 py-2 bg-gray-200"
        >
        {showGrid ? 'Hide Grid' : 'Show Grid'}
    </button>

      {/* Stroke Section */}
      <div>
        <label className="text-sm font-bold">Stroke</label>
        <div className="flex space-x-2 mt-2">
          {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF'].map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full border ${
                strokeColor === color ? 'ring-2 ring-black' : ''
              }`}
              onClick={() => HandleStrokeColor(color)}
            ></button>
          ))}
        </div>
      </div>


      {/* Fill Section */}
      <div>
        <label className="text-sm font-bold">Fill</label>
        <div className="flex space-x-2 mt-2">
          {['transparent','#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF'].map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full border ${
                fillColor === color ? 'ring-2 ring-black' : ''
              }`}
              onClick={() => HandleFillColor(color)}
            ></button>
          ))}
        </div>
      </div>
    
      {/* Stroke Width Section */}
      <div>
        <label className="text-sm font-bold">Stroke Width</label>
        <div className="flex space-x-2 mt-2">
          {[1, 2, 3, 4].map((width) => (
            <button
              key={width}
              className={`w-8 h-8 border rounded ${
                strokeWidth === width ? 'ring-2 ring-black' : ''
              }`}
              onClick={() => HandleStrokeWidth(width)}
            >
              {width}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style Section */}
      <div>
        <label className="text-sm font-bold">Stroke Style</label>
        <div className="flex space-x-2 mt-2">
          <button
            className={`w-8 h-8 border rounded ${
              strokeStyle === 'solid' ? 'ring-2 ring-black' : ''
            }`}
            onClick={() => HandleStrokeStyle('solid')}
          >
            <div className="border-t-2 border-black w-full"></div>
          </button>
          <button
            className={`w-8 h-8 border rounded ${
              strokeStyle === 'dashed' ? 'ring-2 ring-black' : ''
            }`}
            onClick={() => HandleStrokeStyle('dashed')}
          >
            <div className="border-t-2 border-dashed border-black w-full"></div>
          </button>
        </div>
      </div>

      {/* Opacity Slider */}
      <div>
        <label className="text-sm font-bold">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => HandleStrokeOpacity(e.target.value)}
          className="w-full mt-2"
        />
      </div>
    </div>
      
    

  
  );
};

export default PropertiesToolBar;

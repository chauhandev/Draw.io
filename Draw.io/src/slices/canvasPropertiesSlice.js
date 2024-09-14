import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  strokeColor:"#000000",
  fillColor:"transparent",
  strokeWidth:4,
  strokeStyle: "solid",
  fillStyle: "solid",
  canvasColor:"#ffffff",
  opacity:1,
  scale:1,
  showGrid :true,
  origin :{x:0,y:0}
}

export const canvasPropertiesSlice = createSlice({
  name: "CanvasProperties",
  initialState,
  reducers: {
    setStrokeColor: (state,action)=>{
      state.strokeColor =action.payload
    },
    setFillColor: (state,action)=>{
        state.fillColor =action.payload
    },
    setCanvasColor: (state,action)=>{
        state.canvasColor =action.payload
    },
    setStrokeWidth: (state,action)=>{
        state.strokeWidth =action.payload
    },
    setStrokeStyle: (state,action)=>{
        state.strokeStyle =action.payload
    },
    setFillStyle: (state,action)=>{
        state.fillStyle =action.payload
    },
    setOpacity: (state,action)=>{
        state.opacity =action.payload
    },
    setCanvasScale: (state,action)=>{
        state.scale =action.payload
    },
    toggleGrid:(state,action)=>{
        state.showGrid =  !state.showGrid 
    },
    setOrigin: (state,action)=>{
        state.origin = action.payload
        console.log(state.origin ,"reducer")
    }

  },
})

export const { setStrokeColor, setFillColor,setCanvasColor ,setStrokeWidth,setStrokeStyle,setOpacity,setFillStyle ,setCanvasScale,toggleGrid,setOrigin} = canvasPropertiesSlice.actions

export default canvasPropertiesSlice.reducer
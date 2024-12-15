import { configureStore } from '@reduxjs/toolkit'
import CommandReducer from './slices/commandSlice';
import CanvasPropertiesReducer  from './slices/canvasPropertiesSlice'
import ElementsReducer from './slices/canvasElements';
export const store = configureStore({
    reducer: {
        command:CommandReducer,
        canvasProperties:CanvasPropertiesReducer,
        entities:ElementsReducer
    },
  })
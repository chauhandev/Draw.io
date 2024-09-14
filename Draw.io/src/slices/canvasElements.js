import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  elements: localStorage.getItem("Elements") ?localStorage.getItem("Elements") :[]
}

export const elementSlice = createSlice({
  name: "objects",
  initialState,
  reducers: {
    addElement: (state,action)=>{
      state.elements.push(action.payload)
    },
    removeElement: (state,action)=>{
      state.elements = state.elements.filter(ele => ele.id!=action.payload)
    }
  },
})

export const { addElement, removeElement } = elementSlice.actions

export default elementSlice.reducer
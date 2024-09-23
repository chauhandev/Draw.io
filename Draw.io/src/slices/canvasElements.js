import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  elements: localStorage.getItem("Elements") ? JSON.parse(localStorage.getItem("Elements")) :[],
  undoStack: [],
  redoStack: [],
  selectionSet:[]
}

export const elementSlice = createSlice({
  name: "objects",
  initialState,
  reducers: {
    addElement: (state, action) => {
      state.elements.push(action.payload);
      state.undoStack.push({ type: 'add', element: action.payload });
      state.redoStack = [];
      localStorage.setItem('Elements', JSON.stringify(state.elements));
    },
    removeElement: (state, action) => {
      const elementToRemove = state.elements.find(ele => ele.id === action.payload);
      const indexToRemove = state.elements.findIndex(ele => ele.id === action.payload);
    
      if (indexToRemove !== -1) {
        state.undoStack.push({ type: 'remove', element: elementToRemove, index: indexToRemove });
        state.elements = state.elements.filter(ele => ele.id !== action.payload);
        state.redoStack = [];
      }
       localStorage.setItem('Elements', JSON.stringify(state.elements));
    },
    removeElements: (state) => {
      const elementsToRemove = state.elements.filter(element => {
        if(element.selected){
          return {...element ,hovered :false ,selected:false}
        }
      });
  
      const indexesToRemove = state.elements
          .map((ele, index) => ele.selected ? index : -1) 
          .filter(index => index !== -1);
  
      if (elementsToRemove.length >= 1) {
          state.elements = state.elements.filter(element => !element.selected);
  
          state.undoStack.push({ type: 'removeMultiple', elements: elementsToRemove, indexes: indexesToRemove });
  
          state.redoStack = [];
  
          localStorage.setItem('Elements', JSON.stringify(state.elements));
      }
  },
  undo: (state) => {
      const lastAction = state.undoStack.pop();
      if (lastAction) {
          if (lastAction.type === 'add') {
              state.elements.pop();
          } else if (lastAction.type === 'remove') {
              state.elements.splice(lastAction.index, 0, lastAction.element);
          } else if (lastAction.type === 'removeMultiple') {
              lastAction.indexes.forEach((index, i) => {
                  state.elements.splice(index, 0, lastAction.elements[i]);
              });
          }
  
          state.redoStack.push(lastAction);
  
          localStorage.setItem('Elements', JSON.stringify(state.elements));
      }
  },
  redo: (state) => {
      const lastAction = state.redoStack.pop();
      if (lastAction) {
          if (lastAction.type === 'add') {
              state.elements.push(lastAction.element);
          } else if (lastAction.type === 'remove') {
              state.elements = state.elements.filter((_, i) => i !== lastAction.index);
          } else if (lastAction.type === 'removeMultiple') {
              lastAction.indexes.forEach((index) => {
                  state.elements = state.elements.filter((_, i) => i !== index);
              });
          }
           localStorage.setItem('Elements', JSON.stringify(state.elements));
      }
  },
    setHover:(state,action)=>{
      state.elements = state.elements.map(ele =>{
        if(ele.id === action.payload)
          return {...ele ,hovered:true}
        else
          return {...ele ,hovered:false}
      })
    },
    setSelection:(state,action)=>{
      const selectedElementsID = action.payload;
      state.selectionSet.length = 0;
      state.elements = state.elements.map(ele =>{
        if(selectedElementsID.includes(ele.id)){
          state.selectionSet.push(ele)
          return {...ele ,selected: true,hovered:false}

        }
        else{
           state.selectionSet.push(ele)
            return {...ele ,selected:false,hovered:false}
        }
      })
    }

  }
})

export const { addElement, removeElement ,undo ,redo,setHover,setSelection,removeElements} = elementSlice.actions

export default elementSlice.reducer
import { createSlice } from '@reduxjs/toolkit'
import { COMMANDS } from '../constants'
const initialState = {
  activeCommandName: null,
  actionCommandName: null
}

export const commandSlice = createSlice({
  name: COMMANDS.FREEHAND,
  initialState,
  reducers: {
    onActiveItemClick: (state,action)=>{
      state.activeCommandName =action.payload
    },
    onActionItemClick: (state,action)=>{
      state.actionCommandName =action.payload;
    }
  },
})

export const { onActiveItemClick, onActionItemClick  } = commandSlice.actions

export default commandSlice.reducer
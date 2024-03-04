import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showNavbar: false,
};

export const navBarSlice = createSlice({
  name: "showNavbar",
  initialState,
  reducers: {
    showOnWidth: (state) => {
      state.showNavbar = true;
    },
    showOnButtonClick: (state) => {
      state.showNavbar = !state.showNavbar;
      
    },
    hideOnWidth:(state)=>{
        state.showNavbar=false
    }
  },
});

export const showNavbar=(state)=>state.showNavbar
export const {showOnWidth,showOnButtonClick,hideOnWidth} =navBarSlice.actions;
export default navBarSlice.reducer 
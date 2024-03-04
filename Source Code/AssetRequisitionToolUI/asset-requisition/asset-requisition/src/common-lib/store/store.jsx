import { configureStore } from "@reduxjs/toolkit";
import  navBarReducer from '../../features/sidenavbar/sideNavbarSlice';
import  filterReducer from "../../features/myrequest/filterSlice";

export const store= configureStore({
    reducer:{
        showNavbar:navBarReducer,
        filterRequest:filterReducer
    }
})
import { createSlice } from "@reduxjs/toolkit";


const initialState={
    filterResults:[]
}

const filterSlice=createSlice({
    name:"filter",
    initialState,
    reducers:{
        addFilters:(state,{payload})=>{
            state.filterResults=payload
        }
    }
})



export const {addFilters}=filterSlice.actions

export const getAllFilters=(state)=>state.filterResults.filter

export default filterSlice.reducer
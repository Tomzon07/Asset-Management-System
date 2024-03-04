
import { SpinnerRoundFilled } from "spinners-react"
import classes from "./loadingscreen.module.css"

const LoadingScreen=()=>{
    return (
        <div className={classes.loadingScreen}>
            <SpinnerRoundFilled style={{width:"60px",color: "#415A90"}}></SpinnerRoundFilled >
            <SpinnerRoundFilled style={{width:"60px",color: "#415A90"}}></SpinnerRoundFilled >
            <SpinnerRoundFilled style={{width:"60px",color: "#415A90"}}></SpinnerRoundFilled >
            
        </div>
    )
}

export default LoadingScreen
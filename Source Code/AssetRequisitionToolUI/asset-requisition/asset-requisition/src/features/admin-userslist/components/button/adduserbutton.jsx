import classes from './adduserbutton.module.css'

const AddUserButton=({buttonText,onClick})=>{
return (
    <div className={classes.button} onClick={onClick}>{buttonText}</div>
)
}
export default AddUserButton
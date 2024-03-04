import classes from './adduserbutton.module.css'

const AddUploadButton=({onCLick})=>{
return (
    <div className={classes.button} onClick={onCLick}>Upload User</div>
)
}
export default AddUploadButton
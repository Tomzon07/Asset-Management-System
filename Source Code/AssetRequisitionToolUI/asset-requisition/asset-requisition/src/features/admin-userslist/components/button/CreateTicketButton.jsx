import classes from './adduserbutton.module.css'

const CreateTicketButton=({onCLick})=>{
return (
    <div className={classes.button} onClick={onCLick}>Create Ticket</div>
)
}
export default CreateTicketButton
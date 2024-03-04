import classes from './ticketchart.module.css'

const TicketChart=({title,count,backgroundColor,onClick})=>{
    return (
        <div className={classes.ticketChart} onClick={onClick}>
            <div className={classes.outerCircle} style={{backgroundColor:backgroundColor}}>
                <div className={classes.innerCircle}>
                <p className={classes.count}>{count}</p>
                </div>
            </div>
            <p className={classes.title}>{title}</p>
        </div>
    )
}

export default TicketChart
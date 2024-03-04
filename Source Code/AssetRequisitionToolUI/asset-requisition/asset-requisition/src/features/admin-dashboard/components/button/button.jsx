import { Link } from 'react-router-dom'
import classes from './button.module.css'
const Button =({buttonTitle,to})=>{
    return (
        <Link className={classes.button} to={to}>
            {buttonTitle}
        </Link>
    )
}

export default Button
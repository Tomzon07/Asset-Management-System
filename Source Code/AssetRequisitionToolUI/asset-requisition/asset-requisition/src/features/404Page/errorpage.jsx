import { useNavigate } from "react-router-dom";
import errpage from "./error.module.css";
const ErrorPage=()=>{
const navigate=useNavigate()
return(
    <div>
      <div className={errpage.aligncenter}>
        <div className={errpage.fourzerofourbg}>
          <h1>404</h1>
        </div>

        <div className={errpage.contantbox404}>
          <h3 className={errpage.h2}>Look like you're lost</h3>

          <p>the page you are looking for not avaible!</p>

          <h3 className={errpage.link404} onClick={()=>{
            navigate("dashboard")
          }}>Go to Home</h3>
        </div>
      </div>
    </div>
)
}

export default ErrorPage
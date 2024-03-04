import classes from "./login.module.css";
import logo from "../../assets/logo-login.svg";
import loginImage from "../../assets/logincImage.svg";
import googleicon from "../../assets/googleicon.svg";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAccessToken } from "../../common-lib/services/service";
import jwt_decode from "jwt-decode";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
function LoginPage() {
  const googleSignIn = () => {
    window.location.href =
      // "https://4ys0cof9s7.execute-api.ap-south-1.amazonaws.com/auth/google"

      "https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile%20email&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http://localhost:3000/login&client_id=112968374542-34j1m0vjk2r2do5vvo3j57ushc70qroj.apps.googleusercontent.com";

    // "https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile%20email&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=https://requisition-dev.innovaturelabs.com/login&client_id=112968374542-34j1m0vjk2r2do5vvo3j57ushc70qroj.apps.googleusercontent.com";
  };
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    if (code) {
      setIsLoading(true);
      getAccessToken(code)
        .then((res) => {
          if (res.data?.accessToken) {
            let CryptoJS = require("crypto-js");
            const secretPass = "XkhZG4fW2t2W";
              localStorage.setItem("accessToken", res.data.accessToken);
              localStorage.setItem("refreshToken", res.data.refresh);
            const decoded = jwt_decode(res.data.accessToken);
            let roles = JSON.stringify(decoded);
            const datas = CryptoJS.AES.encrypt(roles, secretPass).toString();
            localStorage.setItem("role", datas);
            navigate("/dashboard");
            setIsLoading(true);
          }
        })
        .catch((err) => {
          setIsLoading(false)
          Swal.fire({
            title: "Failed",
            text: err?.response?.data?.message,
            icon: "error",
            timer: 1700,
            showConfirmButton: false,
          });
        });
    }
  }, [location]);

  return (
    <div className={classes.body}>
      <img src={logo} alt="" className={classes.logo}></img>
      <div className={classes.main}>
        <div className={classes.imgBox}>
          <img alt="" src={loginImage} className={classes.loginImage} />
        </div>
        <div className={classes.buttonBox}>
          <button className={classes.signInButton} onClick={googleSignIn}>
            <div style={{ display: "flex", placeContent: "center" }}>
              <img src={googleicon} alt="" className={classes.gIcon} />
              <div style={{ marginTop: "3.5%" }}>Sign in with google</div>
            </div>
          </button>
        </div>
      </div>
    { isLoading && <LoadingScreen/>}
    </div>
  );
}

export default LoginPage;

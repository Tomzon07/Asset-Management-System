import classes from "./changepassword.module.css";
import logo from "../../assets/logo-login.svg";
import loginImage from "../../assets/logincImage.svg";
import { useEffect, useState } from "react";
import { changePassword } from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen"
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
function ChangePassword() {
    const [isSpinner, setIsSpinner] = useState(false);
    const navigate = useNavigate()
    const location = useLocation();
    const [accessToken, setAccessToken] = useState("")
    const token = localStorage.getItem("accessToken")
    const { register, getValues, setValue, formState: { errors }, handleSubmit, reset } = useForm()
    const [passError, setPassError] = useState("")

    /**Function that called when submit button is clicked.In this funtion if the form is valid the dat from form is set data variable and and it is passed through change password api kfunction */
    const onFormSubmit = (data) => {

        setIsSpinner(true)
        changePassword(data, accessToken).then((res) => {
            setIsSpinner(false)
            Swal.fire({
                title: "Success",
                text: res.data.message,
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            })
            reset()
            navigate("/login")
        }).catch((err) => {
            setIsSpinner(false)
            if (err?.response?.data?.message === "Current password doesn't match") {
                setValue("currPassword", "")
                setPassError("Current password doesn't match")
            } else {
                Swal.fire({
                    title: "Failed",
                    text: err?.response?.data?.message,
                    icon: "error",
                    timer: 1600,
                    showConfirmButton: false
                })
            }

        })
    };


    useEffect(() => {
        if (location.state) {
            setAccessToken(location.state.accessToken)
        }
        else if (token) {
            setAccessToken(token)
        }
        else {
            navigate("/login")
        }
    }, [accessToken, navigate, location.state,token])

    return (
        <div className={classes.body}>
            <img src={logo} alt="" className={classes.logo}></img>
            <div className={classes.main}>
                <div className={classes.imgBox}>
                    <img alt="" src={loginImage} className={classes.loginImage} />
                </div>
                <div className={classes.buttonBox}>
                    <form>

                        <input type={"password"} className={classes.inputField} placeholder={"Current Password"}   {...register("currPassword", {
                            required: true, pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/, onChange: () => {
                                setPassError("")
                            }
                        })} />
                        <p className={classes.err}>
                            {errors.currPassword?.type === "required" && "Password is required"}
                            {errors.currPassword?.type === "pattern" && "Enter a valid password"}
                            {passError}
                        </p>
                        <input type={"password"} className={classes.inputField} placeholder={"New Password"}  {...register("newPassword", { required: true, pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/, validate: value => value !== getValues("currPassword") })} />
                        <p className={classes.err}>
                            {errors.newPassword?.type === "required" && "Password is required"}
                            {errors.newPassword?.type === "pattern" && "Password must contain atleast 8 characters,maxmium 16 characters Lowercase and uppercase letter,number and special charater"}
                            {errors.newPassword?.type === "validate" && "New password can't be same as current password"}
                        </p>
                        <input type={"password"} className={classes.inputField} placeholder={"Re-Enter Password"} {...register("renewPassword", { required: true, validate: value => value === getValues("newPassword") })} />
                        <p className={classes.err}>
                            {errors.renewPassword?.type === "required" && "Password is required"}
                            {errors.renewPassword?.type === "validate" && "Password mismatch"}
                        </p>
                        <div onClick={() => {
                            setPassError("")
                        }}> <button className={classes.signInButton} onClick={handleSubmit(onFormSubmit)}>Change Password</button></div>
                    </form>
                </div>
            </div>

            {isSpinner && <LoadingScreen />}
        </div>
    );
}

export default ChangePassword;

import classes from "./basiclogin.module.css";
import logo from "../../assets/logo-login.svg";
import loginImage from "../../assets/logincImage.svg";
import { useRef, useState } from "react";
import { forgetPassword, loginUser } from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import jwt_decode from "jwt-decode";

function BasicLogin() {
  const [isSpinner, setIsSpinner] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [emairError, setEmailError] = useState("");
  const [resetEmail, setResetEmail] = useState();
  const ref = useRef();
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEmailError("");
    setResetEmail();
  };

  const handleChange = (e) => {
    setResetEmail();
    if (e.target.value) {
      const regEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if (!regEmail.test(e.target.value)) {
        setEmailError("Enter a valid email");
        setResetEmail(e.target.value);
      } else {
        setEmailError("");
        setResetEmail(e.target.value);
      }
    } else {
      setEmailError("Email is required");
    }
  };

  const onEmailSubmit = () => {
    if (resetEmail && (emairError === "" || emairError === "User not found")) {
      const value = { email: resetEmail };
      setIsSpinner(true);
      forgetPassword(value)
        .then((res) => {
          setIsSpinner(false);
          handleClose();
          Swal.fire({
            title: "Success",
            text: "Success, you will recieve an email that contains a one time password",
            icon: "success",
            timer: 2500,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          setIsSpinner(false);
          if (err?.response?.data?.message === "User not found") {
            setEmailError(err?.response?.data?.message);
            ref.current.value = "";
            ref.current.value = resetEmail;
          } else {
            handleClose();
            Swal.fire({
              title: "Failed",
              text: err?.response?.data?.message,
              icon: "error",
              timer: 1700,
              showConfirmButton: false,
            });
          }
        });
    } else if (resetEmail && emairError) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("Email is required");
    }
  };
  /**This function will be triggered when the submit button is clicked and  in this function we trigger the validate method
   * by passing formvalues varible that contains values from  the form to it. */
  const onFormSubmit = (data) => {
    setIsSpinner(true);
    loginUser(data)
      .then((res) => {
        setIsSpinner(false);
        reset();
        if (res.data.status === "0") {
          navigate("/changepassword", {
            state: { accessToken: res.data.accessToken },
          });
        } else {
          let CryptoJS = require("crypto-js");
          const secretPass = "XkhZG4fW2t2W";
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refresh);
          const decoded = jwt_decode(res.data.accessToken);
          let roles = JSON.stringify(decoded);
          const datas = CryptoJS.AES.encrypt(roles, secretPass).toString();
          localStorage.setItem("role", datas);
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        setIsSpinner(false);
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1600,
          showConfirmButton: false,
        });
      });
  };

  return (
    <div className={classes.body}>
      <img src={logo} alt="" className={classes.logo}></img>
      <div className={classes.main}>
        <div className={classes.imgBox}>
          <img alt="" src={loginImage} className={classes.loginImage} />
        </div>
        <div className={classes.buttonBox}>
          <form>
            <input
              type={"email"}
              className={classes.inputField}
              placeholder={"Email"}
              {...register("email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              })}
            />
            <p className={classes.err}>
              {errors.email?.type === "pattern" && "Please enter a valid email"}
              {errors.email?.type === "required" && "Email is required"}
            </p>
            <input
              autoComplete="off"
              type={"password"}
              name="password"
              className={classes.inputField}
              placeholder={"Password"}
              {...register("password", {
                required: true,
                pattern:
                  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/,
              })}
            />
            <p className={classes.err}>
              {errors.password?.type === "required" && "Password is required"}
              {errors.password?.type === "pattern" && "Enter a valid password"}
            </p>
            <p
              style={{
                width: "95%",
                textAlign: "end",
                color: "blue",
                cursor: "pointer",
                marginRight: "20px",
              }}
              onClick={handleClickOpen}
            >
              Forgot password?
            </p>
            <button
              className={classes.signInButton}
              onClick={handleSubmit(onFormSubmit)}
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {isSpinner && <LoadingScreen />}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email associated with your account
          </DialogContentText>
          <input
            type={"text"}
            className={classes.emailField}
            onChange={handleChange}
            placeholder="Enter your email"
            ref={ref}
          />
          <p
            style={{
              color: "red",
              margin: "0",
              height: "25px",
              display: "flex",
              alignItems: "end",
            }}
          >
            {emairError}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button className={classes.confirmBtn} onClick={onEmailSubmit}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BasicLogin;

/* eslint-disable no-useless-escape */
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./adduser.module.css";
import "./adduser.css";
import closeIcon from "../../assets/closeIcon.svg";
import { useState, useEffect, useRef } from "react";
import {
  addUser,
  editUser,
  getUniqueId,
  getUserByEmail,
  getUniqueEmail,
  departmentList,
  getAllPermissions,
} from "../../common-lib/services/service";
import { SpinnerRoundFilled } from "spinners-react";
import Swal from "sweetalert2";
import { Controller, useForm } from "react-hook-form";
import { MultiSelect } from "primereact/multiselect";
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";

//icons
import "primeicons/primeicons.css";

export default function BasicModal({
  open,
  onClose,
  getAllUsers,
  editUserEmail,
  setSearchValue,
  count,
}) {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({ mode: "onChange" });
  const [isSpinner, setIsSpinner] = useState(false);
  const [isSpinners, setIsSpinners] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [empIdError, setEmpIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [version, setVersion] = useState();
  const [isEmpIdCheck, setIsEmpIdCheck] = useState(false);
  const [isCeoVisible, setIsCeoVisible] = useState(true);
  const [isAdminVisible, setIsAdminVisible] = useState(false);

  const [isClicked, setIsClicked] = useState(false);
  const inputRef = useRef();

  //to restrict only numbers and hyphen in stock field
  const isNumberKey = (evt) => {
    let charCode = evt.which ? evt.which : evt.keyCode;

    if (
      (charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        (charCode < 96 || charCode > 105)) ||
      evt.shiftKey
    ) {
      evt.preventDefault();
    }
    return true;
  };
  
  useEffect(() => {
    if (open) {
      getDepartmenets();
      getPermissions().then(() => {
        getUserById();
      });
    }
  }, [open]);
  /** Function to list all departments */
  const getDepartmenets = () => {
    setIsSpinners(true);
    departmentList()
      .then((res) => {
        setDepartments(res.data);
        setIsSpinners(false);
      })
      .catch((err) => {
        setIsSpinners(false);
      });
  };

  /** Function to list all permissions */
  const getPermissions = () => {
    setIsSpinners(true);
    return getAllPermissions()
      .then((res) => {
        setPermissions(res.data);
        setIsSpinner(false);
      })
      .catch(() => {
        setIsSpinners(false);
      });
  };
  /**  function for the create user and its validations */
  const createUser = (data) => {
    const dept = [];
    for (let val of data.department) {
      dept.push(val.id);
    }

    if (emailError === "" && empIdError === "" && isEmpIdCheck === false) {
      const obj = {
        name: data.name,
        email: data.email,
        permission: data.permission,
        empId: data.empId,
        department: dept,
        admin: isAdminVisible,
        ceo: data.ceo,
      };
      setIsSpinner(true);
      let apicall;
      if (editUserEmail) {
        const objs = { version: version };
        Object.assign(obj, objs);
        apicall = editUser(obj, editUserEmail);
      } else {
        apicall = addUser(obj);
      }

      apicall
        .then((response) => {
          getAllUsers(count, 0, "", 0, "");
          onClose();
          setEmailError("");
          setEmpIdError("");
          reset();
          setIsSpinner(false);
          Swal.fire({
            title: "Success",
            text: editUserEmail
              ? "User updated Sucessfully"
              : "User added succesfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        })
        .catch((error) => {
          onClose();
          setEmailError("");
          setEmpIdError("");
          reset();
          setIsSpinner(false);
          Swal.fire({
            title: "Failed",
            text:
              error.response.data.message === '"pk" must be a valid email'
                ? "Please enter a valid email"
                : error.response.data.message,
            icon: "error",
            timer: 1000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        });
    }
    // }
  };

  /** Function to get userdetails by passing id */
  const getUserById = () => {
    if (editUserEmail) {
      setIsSpinner(true);
      getUserByEmail(editUserEmail)
        .then((res) => {
          setValue("name", res?.data?.name);
          setValue("empId", res?.data?.employeeId);
          setValue("email", res.data?.email);
          setValue("department", res.data?.userDepartments);
          setValue("permission", res.data?.userPermissions[0]?.id);
          setValue("ceo", res.data?.isCeo);
          setValue("admin", res.data?.isAdmin);
          res.data?.userPermissions[0]?.id === 4 && setIsCeoVisible(false);
          setIsAdminVisible(res.data?.isAdmin)
          setVersion(res.data?.version);
          setIsSpinner(false);
        })
        .catch((err) => {
          onClose();
          setEmailError("");
          setEmpIdError("");
          Swal.fire({
            title: "Failed",
            text: err.response.data.message,
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
          });
        });
    }
  };

  /**Function to submit value check for validation */
  const onFormSubmit = (data) => {
    setIsClicked(true);

    createUser(data);
  };

  /** Function for unique validation of employee id from api call */

  const handleEmpIdChange = (empId) => {
    setEmpIdError("");
    if (
      empId.target.value &&
      empId.target.value.length < 7 &&
      empId.target.value.length > 3
    ) {
      setIsEmpIdCheck(true);
      getUniqueId(empId.target.value)
        .then((res) => {
          setIsEmpIdCheck(false);
          setEmpIdError("");
        })
        .catch((err) => {
          setIsEmpIdCheck(false);
          err.response.data.errorCode === 1085 &&
            setEmpIdError(err.response.data.message);
        });
    } else {
      setEmpIdError("");
    }
  };

  /** Function for unique validation of email from api call */
  const handleEmailChange = (email) => {
    setEmailError("");
    if (email.target.value)
      getUniqueEmail(email.target.value)
        .then((res) => {
          setEmailError("");
        })
        .catch((err) => {
          if (err.response.data.errorCode === 1084) {
            setEmailError(err.response.data.message);
          }
        });
    else {
      setEmailError("");
    }
  };

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.modal}>
          {(isSpinner || isSpinners) && (
            <div
              className={classes.modal}
              style={{
                zIndex: "999",
                backgroundColor: "transparent",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SpinnerRoundFilled
                style={{ width: "100px", color: "#415A90" }}
              />{" "}
              <SpinnerRoundFilled
                style={{ width: "100px", color: "#415A90" }}
              />
              <SpinnerRoundFilled
                style={{ width: "100px", color: "#415A90" }}
              />
            </div>
          )}
          <div className={classes.titleDiv}>
            <p className={classes.modalTitle}>
              {editUserEmail ? "Edit" : "Add"} User
            </p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={() => {
                onClose();
                setEmailError("");
                setEmpIdError("");
                setIsSpinner(false);
                reset();
                setIsCeoVisible(false);
                setIsAdminVisible(false);
              }}
            />
          </div>

          {/* Form to add user details */}

          <form id="addUserForm">
            <br />
            <br />
            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Name
              </label>
              <input
                id={"name"}
                type={"text"}
                className={`${classes.textField} `}
                autoComplete="off"
                {...register("name", {
                  required: true,
                  pattern:
                    /^(?!\d)[\p{L}\p{M}0-9]+(?:[\s-][\p{L}\p{M}0-9]+)*$/u,
                  minLength: 4,
                  maxLength: 30,
                })}
              />
            </div>
            <p className={classes.errors}>
              {errors.name?.type === "required" && "Name is required"}
              {errors.name?.type === "pattern" && "Please enter a valid name"}
              {errors.name?.type === "minLength" &&
                "Name should be atleast 4 characters long"}
              {errors.name?.type === "maxLength" &&
                "Maxmimum length allowed is 30"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="employeeId" className={classes.formLabel}>
                Emp Id
              </label>
              <input
                autoComplete="off"
                id={"employeeId"}
                type={"text"}
                onKeyDown={isNumberKey}
                className={`${classes.textField} `}
                onBlurCapture={handleEmpIdChange}
                disabled={editUserEmail ? true : false}
                {...register("empId", {
                  required: true,
                  pattern: /^(?!(0))[0-9]+$/,
                  minLength: 4,
                  maxLength: 6,
                  onChange: (e) => {
                    setEmpIdError("");
                  },
                })}
              />
            </div>
            <p className={classes.errors}>
              {errors.empId?.type === "required" && "Employee Id is required"}
              {errors.empId?.type === "pattern" && "Enter a valid Employee Id"}
              {errors.empId?.type === "minLength" &&
                "Employee Id should be atleast a 4 digit number"}
              {errors.empId?.type === "maxLength" &&
                "Maxmimum length allowed is 6"}
              {!errors.empId && empIdError}
              {/** {isEmpIdCheck && !errors.empId && <span style={{ color: "blue" }}>Checking Employee Id...</span>} */}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="email" className={classes.formLabel}>
                Email
              </label>
              <input
                ref={inputRef}
                id={"email"}
                type={"text"}
                className={`${classes.textField} `}
                onBlurCapture={handleEmailChange}
                disabled={editUserEmail ? true : false}
                {...register("email", {
                  required: true,

                  pattern:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  maxLength: 50,
                  onChange: (e) => {
                    setEmailError("");
                  },
                })}
              />
            </div>
            <p className={classes.errors}>
              {errors.email?.type === "required" && "Email is required"}
              {errors.email?.type === "pattern" && "Please enter a valid Email"}
              {errors.email?.type === "maxLength" &&
                "Maximum length allowed is 50"}
              {!errors.email && emailError}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Department
              </label>

              <Controller
                name="department"
                control={control}
                rules={{ required: "Value is required." }}
                render={({ field }) => (
                  <MultiSelect
                    value={field.value}
                    showClear={true}
                    onChange={(e) => {
                      field.onChange(e.value);
                    }}
                    options={departments}
                    optionLabel="departmentName"
                    filter
                    placeholder="Select"
                    maxSelectedLabels={4}
                    className={`${classes.select} ${
                      errors.department && classes.error
                    }`}
                  />
                )}
              />
            </div>
            <p className={classes.errors}>
              {errors.department?.type === "required" &&
                "Please select  department"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Permission
              </label>
              <select
                className={`${classes.select} ${
                  errors.permission && classes.error
                }`}
                defaultValue=""
                name="permission"
                style={{
                  border: errors.permission
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("permission", {
                  required: true,
                  onChange: (e) => {
                    if (e.target.value === "4") {
                      setValue("ceo", false);
                      setIsCeoVisible(false);
                    } else {
                      setValue("ceo", false);
                      setIsCeoVisible(true);
                    }
                  },
                })}
              >
                <option value={""} color="#aaaaaa" disabled>
                  Select
                </option>
                {permissions.map((Permission, index) => {
                  return (
                    <option
                      value={Permission.id}
                      key={index}
                      style={{ color: "black" }}
                    >
                      {Permission.permission}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className={classes.errors}>
              {errors.permission?.type === "required" &&
                "Please select permission"}
            </p>
            <div className={classes.formDiv} style={{ marginTop: "0px" }}>
              <label></label>
              <div className={classes.checkBox}>
                <input
                  type="checkbox"
                  id="ceo"
                  {...register("ceo")}
                  disabled={isCeoVisible}
                />
                <label htmlFor="ceo"> CEO</label>
                <input
                  id="admin"
                  style={{ marginLeft: "20px" }}
                  type="checkbox"
                  {...register("admin", {
                    onChange: () => {
                      setIsAdminVisible(!isAdminVisible);
                    },
                  })}
                />
                <label htmlFor="admin"> ADMIN</label>
              </div>
            </div>

            <br />
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "end",
              }}
            >
              <button
                disabled={isEmpIdCheck ? true : false}
                className={`${isEmpIdCheck ? classes.button2 : classes.button}`}
                onClick={handleSubmit(onFormSubmit)}
              >
                Submit
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

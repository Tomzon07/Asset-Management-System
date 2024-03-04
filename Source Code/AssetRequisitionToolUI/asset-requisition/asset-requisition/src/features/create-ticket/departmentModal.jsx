import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useForm } from "react-hook-form";
import closeIcon from "../../assets/closeIcon.svg";
import classes from "./departmentModal.module.css";
import Swal from "sweetalert2";
import { addDepartment,editDepartment } from "../../common-lib/services/service";

export default function DepartmentModal({ open, onClose,editData}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,setValue,
  } = useForm();

  const [DepartmentError, setDepartmentError] = React.useState("");

  React.useEffect(()=>{
    if(editData?.id){
      setValue('departmentName',editData?.departmentName)
    }

  },[editData])

  const submitDepartment= (data) => {
    let apiCall;
    if (editData?.id) {
      apiCall = editDepartment(editData?.id, data);
    } else {
      apiCall = addDepartment(data);
    }
  
    apiCall
      .then((res) => {
        onClose();
        reset();
        Swal.fire({
          title: "Success",
          text: editData?.id ? "Department updated successfully" : "Department added successfully",
          icon: "success",
          timer: 1700,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setDepartmentError(err.response.data.message);
        } 
      });
  };
  
  const onFormSubmit = (event) => {
    const data = {
      departmentName:event.departmentName
    };
    submitDepartment(data);
  };
  
  
  
  return (
    <Modal open={open} onClose={onClose} >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius:3,
          width:500
        }}
      >
        <div className={classes.titleDiv}>
          <p className={classes.modalTitle}>{editData?.id?'Update Department':' Add Department' }</p>
          <img
            src={closeIcon}
            alt=""
            style={{ margin: "20px", cursor: "pointer" }}
            className={classes.closeButton}
            onClick={() => {
              onClose();
              reset();
              setDepartmentError("");
            }}
          />
        </div>

        <form id="addDepartmentForm" >
          <br />
          <br />
          <div className={classes.formDiv}>
  <label htmlFor="departmentName" className={classes.formLabel}>
    Department
  </label>
  <input
    id="departmentName"
    type="text"
    className={`${classes.textField} ${(DepartmentError || errors.DepartmentName) && classes.error}`}
    autoComplete="off"
    style={{
      border: errors.departmentName || DepartmentError
        ? "2px red solid"
        : "1px #a7a7a7 solid",
    }}
    {...register("departmentName", {
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: /^\S(.*\S)?$/,
      onChange: () => {
        setDepartmentError("");
      },
    })}
  />
</div>
<p className={classes.errors}>
  {errors.departmentName?.type === "required" && "Department is required"}
  {errors.departmentName?.type === "pattern" && "Enter a valid Department"}
  {errors.departmentName?.type === "minLength" && "Department should be at least 2 characters long"}
  {errors.departmentName?.type === "maxLength" && "Maximum length allowed is 20"}

  {!errors.DepartmentName && DepartmentError}
</p>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
            }}
          >
           <button
                            className={classes.button}
                            onClick={handleSubmit(onFormSubmit)}
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </Box>
                  </Modal>

        )
    }
    

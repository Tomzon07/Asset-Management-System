import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useForm } from "react-hook-form";
import closeIcon from "../../assets/closeIcon.svg";
import classes from "./projectModal.module.css";
import Swal from "sweetalert2";
import { addProject, editProject } from "../../common-lib/services/service";



export default function ProjectModal({ open, onClose,editData ,onProjectAdded}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm();

  const [projectError, setProjectError] = React.useState("");
  const [projectNameError,setProjectNameError]=React.useState("");


React.useEffect(()=>{
  if(editData ?.id){
    setValue('projectCode',editData?.projectCode)
    setValue('projectName',editData?.projectName)

  }
},[editData])

const submitProject= (data) => {
  let apiCall;
  if (editData?.id) {
    apiCall = editProject(editData?.id, data);
  } else {
    apiCall = addProject(data);
  }
  apiCall
    .then((res) => {
      onClose();
      Swal.fire({
        title: "Success",
        text: editData?.id ? "Project updated successfully" : "Project added successfully",
        icon: "success",
        timer: 1700,
        showConfirmButton: false,
      });
      onProjectAdded();
    })
    .catch((err) => {

      const error = err?.response?.data;
    
      if(error?.errorCode===1021){
        setProjectError(error.message)
      }
      if(error?.errorCode===1022){
        setProjectNameError(error.message)
      }
      if (error && Array.isArray(error)) {
        error?.map((value) => {
          if (value?.errorCode === 1021) {
            setProjectError(value.message);
          }
          if (value?.errorCode === 1022) {
            setProjectNameError(value.message);
          }
        });
      }
    });
};

const onFormSubmit=(event)=>{
  const data={
    projectName:event.projectName,
    projectCode:event.projectCode
  }
  submitProject(data)
}



  return (
    <Modal open={open} onClose={onClose} >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 550,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius:3
        }}
      >
        <div className={classes.titleDiv}>
          <p className={classes.modalTitle}>
            {editData?.id ? 'Update Project' : 'Add Project'}
          </p>
          <img
            src={closeIcon}
            alt=""
            style={{ margin: "20px", cursor: "pointer" }}
            className={classes.closeButton}
            onClick={() => {
              onClose();
              reset();
              setProjectError("");
            }}
          />
        </div>

        <form id="addProjectForm">
          <br />
          <br />
          <div className={classes.formDiv}>
            <label htmlFor="projectCode" className={classes.formLabel}>
              Project Code
            </label>
            <input
              id={"projectCode"}
              type={"text"}
              className={`${classes.textField} ${
                (projectError || errors.projectCode) && classes.error
              } `}
              autoComplete="off"
              style={{
                border:
                  errors.projectCode || projectError
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
              }}
              {...register("projectCode", {
                required: true,
                minLength: 4,
                maxLength: 30,
                pattern: /^\S(.*\S)?$/,
                onChange: () => {
                  setProjectError("");
                },
              })}
            />
          </div>
          <p className={classes.errors}>
            {errors.projectCode?.type === "required" && "Project code is required"}
            {errors.projectCode?.type === "pattern" && "Enter a valid project code"}
            {errors.projectCode?.type === "minLength" &&
              "Project code should be at least 4 characters long"}
            {errors.projectCode?.type === "maxLength" &&
              "Maximum length allowed is 20"}

            {!errors.projectCode && projectError}
          </p>
          
          <div className={classes.formDiv}>
            <label htmlFor="projectName" className={classes.formLabel}>
              Project Name
            </  label>
        <input
          id={"projectName"}
          type={"text"}
          className={`${classes.textField} ${
            (projectNameError || errors.projectName) && classes.error
          } `}
          autoComplete="off"
          style={{
            border:
              errors.projectName || projectNameError
                ? "2px red solid"
                : "1px #a7a7a7 solid",
          }}
          {...register("projectName", {
            required: true,
            minLength: 4,
            maxLength: 50,
            pattern: /^\S(.*\S)?$/,
            onChange: () => {
              setProjectNameError("");
              
            },
          })}
        />
      </div>
      <p className={classes.errors}>
        {errors.projectName?.type === "required" && "Project name is required"}
        {errors.projectName?.type === "pattern" && "Enter a valid project name"}
        {errors.projectName?.type === "minLength" &&
          "Project name should be at least 4 characters long"}
        {errors.projectName?.type === "maxLength" &&
          "Maximum length allowed is 30"}

        {!errors.projectName && projectNameError}
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
    

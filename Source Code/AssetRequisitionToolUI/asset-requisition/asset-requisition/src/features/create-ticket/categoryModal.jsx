import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useForm } from "react-hook-form";
import closeIcon from "../../assets/closeIcon.svg";
import classes from "./categoryModal.module.css";
import Swal from "sweetalert2";
import { addCategory, editCategory } from "../../common-lib/services/service";

export default function CategoryModal({ open, onClose, editData}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm();

  const [categoryError, setCategoryError] = React.useState("");



  React.useEffect(()=>{
    if(editData?.id){
      setValue('categoryName',editData?.categoryName)
    }

  },[editData])

  const submitCategory = (data) => {
    let apiCall;
    if (editData?.id) {
      apiCall = editCategory(editData.id, data);
    } else {
      apiCall = addCategory(data);
    }
  
    apiCall
      .then((res) => {
        reset();
        Swal.fire({
          title: "Success",
          text: editData?.id ? "Category updated successfully" : "Category added successfully",
          icon: "success",
          timer: 1700,
          showConfirmButton: false,
        });
        onClose();

      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setCategoryError(err.response.data.message);
        } 
      });
  };
  

  const onFormSubmit = (event) => {

    const data={
      categoryName:event.categoryName
    }
    submitCategory(data);
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
          <p className={classes.modalTitle}>
            {editData?.id ? "Update Category":"Add Category"}
          </p>
          <img
            src={closeIcon}
            alt=""
            style={{ margin: "20px", cursor: "pointer" }}
            className={classes.closeButton}
            onClick={() => {
              onClose();
              reset();
              setCategoryError("");
            }}
          />
        </div>

        <form id="addCategoryForm" >
          <br />
          <br />
          <div className={classes.formDiv}>
          <label htmlFor="categoryName" className={classes.formLabel}>
  Category
</label>
<input
  id="categoryName"
  type="text"
  className={`${classes.textField} ${(categoryError || errors.categoryName) && classes.error}`}
  autoComplete="off"
  style={{
    border: errors.categoryName || categoryError
      ? "2px red solid"
      : "1px #a7a7a7 solid",
  }}
  {...register("categoryName", {
    required: true,
    minLength: 4,
    maxLength: 30,
    pattern: /^\S(.*\S)?$/,
    onChange: () => {
      setCategoryError("");
    },
  })}
/>
</div>
<p className={classes.errors}>
  {errors.categoryName?.type === "required" && "Category is required"}
  {errors.categoryName?.type === "pattern" && "Enter a valid category"}
  {errors.categoryName?.type === "minLength" && "Category should be at least 4 characters long"}
  {errors.categoryName?.type === "maxLength" && "Maximum length allowed is 30"}

  {!errors.categoryName && categoryError}
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
    

import { Box, Modal, TextField } from "@mui/material";
import classes from "./addQuotation.module.css";
import { SpinnerRoundFilled } from "spinners-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import closeIcon from "../../assets/closeIcon.svg";
import { addQuotation } from "../../common-lib/services/service";
import Swal from "sweetalert2";

const AddQuoation = ({ open, onClose, id }) => {
  const [isSpinner, setisSpinner] = useState();
  const [selectedQuotationIndex, setSelectedQuotationIndex] = useState(null);
  const [quotationError, setQuotationError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    unregister,
  } = useForm({ mode: "onChange", shouldFocusError: false });

  useEffect(() => {
    setSelectedQuotationIndex("");
    setQuotationError(false);
  }, [open]);

  const [quo, setQuo] = useState([1]);
  const onFormSubmit = (data) => {
    setisSpinner(true);
    let datas = [];
    const formData = new FormData();
    quo.forEach((dat, index) => {
      const obj = {
        title: data[`title${index}`],
        description: data[`description${index}`],
        amount: data[`amount${index}`],
        status: selectedQuotationIndex === index + 1 ? 1 : 0,
      };
      datas.push(obj);
      if (index === 0) {
        formData.append("quotation1", data[`file${index}`][0]);
      } else if (index === 1) {
        formData.append("quotation2", data[`file${index}`][0]);
      } else if (index === 2) {
        formData.append("quotation3", data[`file${index}`][0]);
      }
    });
    formData.append("quotation", JSON.stringify(datas));
    formData.append("forward", 1);
    addQuotation(id, formData)
      .then((res) => {
        setisSpinner(false);
        handleClose();
        reset();
        Swal.fire({
          title: "Success",
          text: "Quotation added successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        setisSpinner(false);
        handleClose();
        reset();
        Swal.fire({
          title: "Failed",
          text: err?.data?.message,
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      });
  };

  const spliceElement = (index) => {
    const newArray = [...quo];
    newArray.splice(index, 1);
    setQuo(newArray);
    if (index + 1 === selectedQuotationIndex) {
      setSelectedQuotationIndex(null);
      setQuotationError(true);
    }
    unregister(`title${index}`);
    unregister(`description${index}`);
    unregister(`amount${index}`);
    unregister(`file${index}`);
  };

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

  const handleClose = () => {
    onClose();
    setQuotationError(false);
    setSelectedQuotationIndex(null);
  };

  return (
    <Modal
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.modal}>
        {isSpinner && (
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
            <SpinnerRoundFilled style={{ width: "100px", color: "#415A90" }} />{" "}
            <SpinnerRoundFilled style={{ width: "100px", color: "#415A90" }} />
            <SpinnerRoundFilled style={{ width: "100px", color: "#415A90" }} />
          </div>
        )}
        <div className={classes.titleDiv}>
          <p className={classes.modalTitle}>Add Quotation</p>
          <img
            src={closeIcon}
            alt=""
            style={{ margin: "20px", cursor: "pointer" }}
            className={classes.closeButton}
            onClick={() => {
              handleClose();
              reset();
              setQuo([1]);  
            }}
          />
        </div>

        {/* Form to add user details */}

        <form id="addUserForm">
          {quo.map((data, index) => {
            return (
              <React.Fragment key={index}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="selectedQuotation"
                    value={index + 1}
                    checked={selectedQuotationIndex === index + 1}
                    onChange={() => {
                      setSelectedQuotationIndex(index + 1);
                      setQuotationError(false);
                    }}
                    required
                  />
                  <h3 className={classes.title}>Quotation {index + 1}</h3>{" "}
                  {index > 0 && (
                    <button
                      className={classes.addBtn}
                      style={{ color: "red", marginLeft: "10px" }}
                      onClick={() => {
                        spliceElement(index);
                      }}
                    >
                      - Remove
                    </button>
                  )}
                </div>
                <div className={classes.formDiv}>
                  <div style={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "99%" }}
                      placeholder="Title"
                      id={"title"}
                      type={"text"}
                      style={{ marginRight: "10px" }}
                      className={`${classes.textField} `}
                      autoComplete="off"
                      {...register(`title${index}`, {
                        required: {
                          value: true,
                          message: "This field is required",
                        },
                        pattern: {
                          value: /^\S(.*\S)?$/,
                          message: "Enter a valid title",
                        },
                        minLength: {
                          value: 4,
                          message: "Minimum 4 characters required",
                        },

                        maxLength: {
                          value: 30,
                          message: "Maximum 30 characters allowed",
                        },
                      })}
                    />
                    <p className={classes.error}>
                      {errors[`title${index}`]?.message}
                    </p>
                  </div>
                  <div style={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "99%" }}
                      id={"description"}
                      type={"text"}
                      placeholder="Description"
                      className={`${classes.textField}`}
                      autoComplete="off"
                      {...register(`description${index}`, {
                        required: {
                          value: true,
                          message: "This field is required",
                        },
                        pattern: {
                          value: /^\S(.*\S)?$/,
                          message: "Enter a valid description",
                        },
                        minLength: {
                          value: 4,
                          message: "Minimum 4 characters required",
                        },
                        maxLength: {
                          value: 100,
                          message: "Maximum 100 characters allowed",
                        },
                      })}
                    />
                    <p className={classes.error}>
                      {errors[`description${index}`]?.message}
                    </p>
                  </div>
                </div>

                <div className={classes.formDiv}>
                  <div style={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "99%" }}
                      placeholder="Amount"
                      id={"name"}
                      type={"text"}
                      onKeyDown={isNumberKey}
                      style={{ marginRight: "10px" }}
                      className={`${classes.textField} `}
                      autoComplete="off"
                      {...register(`amount${index}`, {
                        required: {
                          value: true,
                          message: "This field is required",
                        },
                        pattern: {
                          value: /^\S(.*\S)?$/,
                          message: "Enter a valid Amount",
                        },
                        maxLength: {
                          value: 6,
                          message: "Maximum amount allowed is 999999",
                        },
                      })}
                    />
                    <p className={classes.error}>
                      {errors[`amount${index}`]?.message}
                    </p>
                  </div>
                  <div style={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "99%" }}
                      id={"file"}
                      type={"file"}
                      className={`${classes.textField} ${classes.fileSelect}`}
                      autoComplete="off"
                      {...register(`file${index}`, {
                        required: {
                          value: true,
                          message: "Please select a file",
                        },
                      })}
                    />
                    <p className={classes.error}>
                      {errors[`file${index}`]?.message}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {!selectedQuotationIndex && quotationError && (
            <p
              style={{ justifyContent: "center", height: "10px" }}
              className={classes.error}
            >
              Please select a Quotation
            </p>
          )}

          {quo.length < 3 && (
            <button
              className={classes.addBtn}
              onClick={(e) => {
                e.preventDefault();
                setQuo((quo) => [...quo, 1]);
              }}
            >
              + Add Quotation
            </button>
          )}

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <button
              className={`${classes.button}`}
              onClick={(e) => {
                e.preventDefault();
                if (selectedQuotationIndex) {
                  handleSubmit(onFormSubmit)();
                } else {
                  setQuotationError(true);
                }
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default AddQuoation;

import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useForm } from "react-hook-form";
import closeIcon from "../../assets/closeIcon.svg";
import classes from "./assetExtend.module.css";
import { extendAsset } from "../../common-lib/services/service";
import Swal from "sweetalert2";

export default function ExtendAsset({
  open,
  onClose,
  assetId,
  ticketId,
  getAssetbyId,
}) {

  const today = new Date();

  const todayString = today.toISOString().substring(0, 10);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const onFormSubmit = (data) => {
    extendAsset(ticketId, data)
      .then((res) => {
        onClose()
        getAssetbyId(assetId);
        Swal.fire({
          title: "Success",
          text: "Date extended successfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        onClose()
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.modal}>
          <div
            style={{
              zIndex: "999",
              backgroundColor: "transparent",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></div>

          <div className={classes.titleDiv}>
            <p className={classes.modalTitle}>Extend Asset</p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={() => {
                onClose();
                reset();
                
              }}
            />
          </div>

          {/* Form to Extend Asset details */}

          <form id="ExtendAssetForm" onSubmit={handleSubmit(onFormSubmit)}>
            <br />
            <br />
            <div className={classes.formDiv}>
              <label htmlFor="assetId" className={classes.formLabel}>
                Asset Id
              </label>
              <div
                className={classes.textField}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(167, 167, 167, 0.11)",
                  border: "none",
                }}
              >
                {assetId}
              </div>
            </div>
            <div className={classes.formDiv}>
              <label htmlFor="extendedDate" className={classes.formLabel}>
                Expiry Date
              </label>
              <input
                id={"extendedDate"}
                type={"date"}
                min={todayString}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                className={`${classes.textField} ${
                  errors.extendedDate && classes.error
                }`}
                autoComplete="off"
                style={{
                  border: errors.extendedDate
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("extendedDate", { required: true })}
              />
            </div>
            <p className={classes.errors}>
              {errors.extendedDate?.type === "required" &&
                "select a valid expiry date"}
            </p>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "end",
              }}
            >
              <button className={classes.button} type="submit">
                Confirm
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

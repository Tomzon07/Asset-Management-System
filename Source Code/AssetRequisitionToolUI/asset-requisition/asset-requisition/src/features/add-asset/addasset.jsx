import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./addasset.module.css";
import closeIcon from "../../assets/closeIcon.svg";
import { useState, useEffect } from "react";
import {
  createAsset,
  editAsset,
  getAssetById,
  getCategoryList,
} from "../../common-lib/services/service";
import { SpinnerRoundFilled } from "spinners-react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";

export default function AddAsset({
  open,
  onClose,
  getAllAssets,
  editUserEmail,
  editAssetId,
  getAllCategory,
}) {
  const [isSpinner, setIsSpinner] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm();

  const today = new Date();
  const todayString = today.toISOString().substring(0, 10);
  const [version, setVersion] = useState();
  const [categoriesList, setCategoriesLIst] = useState([]);
  const [assetIdErr, setAssetIdErr] = useState("");

  useEffect(() => {
    open === true &&
      getCategoryList()
        .then((res) => {
          setCategoriesLIst(res?.data);
        })
  }, [open]);

  /**  function for the create user and its validations */
  const addAsset = (datas) => {
    setIsSpinner(true);
    const data = {
      assetId: datas.assetId,
      category: datas.category,
      device: datas.device,
      modelNo: datas.modelNo,
    };
    if (datas.expiryDate !== "") {
      const objs = { expiryDate: datas.expiryDate };
      Object.assign(data, objs);
    }

    let apicall;
    if (editAssetId) {
      const obj = { version: version };
      Object.assign(data, obj);
      apicall = editAsset(data);
    } else {
      apicall = createAsset(data);
    }

    apicall
      .then(() => {
        getAllAssets("total");
        getAllCategory("total");
      })
      .then(() => {
        onClose();
        reset();
        setIsSpinner(false);
        Swal.fire({
          title: "Success",
          text: editAssetId
            ? "Asset updated Sucessfully"
            : "Asset added succesfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        if (error?.response?.data?.errorcode === 1024) {
          setIsSpinner(false);
          setAssetIdErr(error?.response?.data?.message);
        } else {
          setAssetIdErr("");
          onClose();
          getAllAssets("total");
          reset();
          setIsSpinner(false);
          Swal.fire({
            title: "Failed",
            text: error?.response?.data?.message,
            icon: "error",
            timer: 1000,
            showConfirmButton: false,
          });
        }
      });
  };

  /** Use Effect to call api to get user */
  useEffect(() => {
    if (open === true && editAssetId) {
      setIsSpinner(true);
      getAssetById(editAssetId)
        .then((res) => {
          setTimeout(() => {
            setValue("assetId", res.data.Item?.pk);
            setValue("modelNo", res.data.Item?.modelNo);
            setValue("device", res.data.Item?.device);
            setValue("expiryDate", res.data.Item?.expiryDate);
            setValue("category", res.data.Item?.category);
            setVersion(res.data.Item?.version);
            setIsSpinner(false);
          }, 10);
        })
        .catch((err) => {
          onClose();
          Swal.fire({
            title: "Failed",
            text: err.response.data.message,
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
          });
        });
    }
  }, [editUserEmail, onClose]);

  /**Function to submit value check for validation */
  const onFormSubmit = (data) => {
    addAsset(data);
  };

  return (
    <div>
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
              {editAssetId ? "Update" : "Add"} Asset
            </p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={() => {
                onClose();
                setIsSpinner(false);
                reset();
                setAssetIdErr("");
              }}
            />
          </div>

          {/* Form to add user details */}

          <form id="addUserForm">
            <br />
            <br />
            <div className={classes.formDiv}>
              <label htmlFor="assetId" className={classes.formLabel}>
                Asset Id
              </label>
              <input
                id={"assetId"}
                type={"text"}
                className={`${classes.textField} ${
                  errors.assetId && classes.error
                }`}
                autoComplete="off"
                style={{
                  border:
                    errors.assetId || assetIdErr
                      ? "2px red solid"
                      : "1px #a7a7a7 solid",
                }}
                {...register("assetId", {
                  required: true,
                  minLength: 4,
                  maxLength: 30,
                  pattern: /^\S(.*\S)?$/,
                  onChange: () => {
                    setAssetIdErr("");
                  },
                })}
                disabled={editAssetId ? true : false}
              />
            </div>
            <p className={classes.errors}>
              {errors.assetId?.type === "required" && "Asset Id is required"}
              {errors.assetId?.type === "pattern" && "Enter a valid Asset Id"}
              {errors.assetId?.type === "minLength" &&
                "Asset Id should be atleast 4 characters long"}
              {errors.assetId?.type === "maxLength" &&
                "Maxmimum length allowed is 30"}
              {!errors.assetId && assetIdErr}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="modelNo" className={classes.formLabel}>
                Model No.
              </label>
              <input
                id={"modelNo"}
                type={"text"}
                className={`${classes.textField} ${
                  errors.modelNo && classes.error
                }`}
                autoComplete="off"
                style={{
                  border: errors.modelNo
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("modelNo", {
                  required: true,
                  minLength: 4,
                  maxLength: 30,
                  pattern: /^\S(.*\S)?$/,
                })}
              />
            </div>
            <p className={classes.errors}>
              {errors.modelNo?.type === "required" && "Model No. is required"}
              {errors.modelNo?.type === "pattern" && "Enter a valid Model No."}
              {errors.modelNo?.type === "minLength" &&
                "Model No. should be atleast 4 characters long"}
              {errors.modelNo?.type === "maxLength" &&
                "Maxmimum length allowed is 30"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="category" className={classes.formLabel}>
                Category
              </label>
              <select
                className={`${classes.select} ${
                  errors.category && classes.error
                }`}
                defaultValue=""
                style={{
                  border: errors.category
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("category", {
                  required: true,
                })}
              >
                <option value={""} disabled>
                  Select
                </option>

                {categoriesList.map((categories, index) => {
                  return (
                    <option value={categories} key={index}>
                      {categories}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className={classes.errors}>
              {errors.category?.type === "required" &&
                "Please select  category"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="device" className={classes.formLabel}>
                Asset
              </label>
              <input
                id={"device"}
                type={"text"}
                className={`${classes.textField} ${
                  errors.device && classes.error
                }`}
                autoComplete="off"
                style={{
                  border: errors.device ? "2px red solid" : "1px #a7a7a7 solid",
                }}
                {...register("device", {
                  required: true,
                  minLength: 4,
                  maxLength: 20,
                  pattern: /^\S(.*\S)?$/,
                })}
              />
            </div>
            <p className={classes.errors}>
              {errors.device?.type === "required" && "Asset is required"}
              {errors.device?.type === "pattern" && "Enter a valid Asset"}

              {errors.device?.type === "minLength" &&
                "Asset should be atleast 4 characters long"}
              {errors.device?.type === "maxLength" &&
                "Maxmimum length allowed is 20"}
            </p>
            <div className={classes.formDiv}>
              <label htmlFor="expiryDate" className={classes.formLabelExpiry}>
                Expiry Date
              </label>
              <input
                id={"expiryDate"}
                type={"date"}
                min={todayString}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                className={`${classes.textField} ${
                  errors.expiryDate && classes.error
                }`}
                autoComplete="off"
                style={{
                  border: errors.expiryDate
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("expiryDate")}
              />
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
                className={`${classes.button}`}
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

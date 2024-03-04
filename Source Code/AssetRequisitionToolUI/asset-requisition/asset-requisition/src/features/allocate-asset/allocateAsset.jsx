import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./allocateAsset.module.css";
import closeIcon from "../../assets/closeIcon.svg";
import { useState ,useEffect} from "react";
import { SpinnerRoundFilled } from "spinners-react";
import { useForm } from "react-hook-form";
import {
  allocateAssets,
  getAssetIdList,
  getCategoryList,
  getDeviceList,
} from "../../common-lib/services/service";
import Swal from "sweetalert2";

export default function BasicModal({
  ticketdetails,
  open,
  onClose,
  getTicket,
}) {
  const today = new Date();
  const todayString = today.toISOString().substring(0, 10);
  const [allCategory, setAllCategory] = useState([]);
  const [alldevice, setAllDevice] = useState([]);
  const [assetIdList, setAssetIdList] = useState([]);
  const [isSpinner, setIsSpinner] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  /**Function to submit value check for validation */
  const onFormSubmit = (data) => {
    onClose();
    setIsSpinner(true);
    const datas = {
      ticketId: ticketdetails.ticketId,
      assetId: data.assetId,
      expiryDate: data.expiryDate,
    };

    allocateAssets(datas)
      .then((res) => {
        setIsSpinner(false);
        getTicket();
        onClose();
        Swal.fire({
          title: "Success",
          text: "Asset Allocated Succesfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        setIsSpinner(false);
        onClose();
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  };

  useEffect(() => {
    const { category, device } = ticketdetails;
  
    const fetchCategoryList = async () => {
      try {
        const res = await getCategoryList();
        setAllCategory(res?.data);
      } catch {}
    };
  
    const fetchDevice = () => {
      if (category !== "OTHER") {
        getDevice(category);
      }
    };
  
    const fetchAssetId = () => {
      if (device !== "OTHER" && category !== "OTHER") {
        getAllAssetId(device);
      }
    };
  
    fetchCategoryList();
    fetchDevice();
    fetchAssetId();
  }, [ticketdetails]);

  const getDevice = (e) => {
    getDeviceList(e)
      .then((res) => {
        setAllDevice(res?.data);
      });
  };

  const getAllAssetId = (e) => {
    getAssetIdList(e)
      .then((res) => {
        setAssetIdList(res.data);
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
            <p className={classes.modalTitle}>Allocate Asset</p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={() => {
                onClose();
                setIsSpinner(false);
                reset();
                /** setIsModalOpen(false);*/
              }}
            />
          </div>

          {/* Form to add user details */}

          <form id="allocateAssetForm">
            <br />
            <br />

            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Category
              </label>

              {ticketdetails?.category === "OTHER" ? (
                <select
                  className={`${classes.select} ${
                    errors.category && classes.error
                  }`}
                  defaultValue=""
                  name="category"
                  style={{
                    border: errors.category
                      ? "2px red solid"
                      : "1px #a7a7a7 solid",
                  }}
                  {...register("category", {
                    required: true,
                    onChange: (e) => {
                      setValue("asset", "");
                      setValue("assetId","")
                      setAssetIdList([])
                      getDevice(e.target.value);
                    },
                  })}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {allCategory.map((options) => (
                    <option key={options} value={options}>
                      {options}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={classes.textField}>
                  {ticketdetails.category}
                </div>
              )}
            </div>
            <p className={classes.errors}>
              {errors.category?.type === "required" && "Please select category"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Asset
              </label>

              {ticketdetails?.device === "OTHER" ? (
                <select
                  className={`${classes.select} ${
                    errors.asset && classes.error
                  }`}
                  defaultValue=""
                  name="asset"
                  style={{
                    border: errors.asset
                      ? "2px red solid"
                      : "1px #a7a7a7 solid",
                  }}
                  {...register("asset", {
                    required: true,
                    onChange: (e) => {
                      getAllAssetId(e.target.value);
                      setValue("assetId", "");
                    },
                  })}
                >
                  <option value={""} disabled>
                    Select
                  </option>
                  {alldevice.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={classes.textField}> {ticketdetails.device}</div>
              )}
            </div>
            <p className={classes.errors}>
              {errors.asset?.type === "required" && "Please select asset"}
            </p>
            
            <div className={classes.formDiv}>
              <label htmlFor="name" className={classes.formLabel}>
                Asset ID
              </label>
              <select
                className={`${classes.select} ${
                  errors.assetId && classes.error
                }`}
                defaultValue=""
                name="assetId"
                style={{
                  border: errors.category
                    ? "2px red solid"
                    : "1px #a7a7a7 solid",
                }}
                {...register("assetId", { required: true })}
              >
                <option value={""} disabled>
                  Select
                </option>
                {assetIdList.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <p className={classes.errors}>
              {errors.assetId?.type === "required" && "Please select asset Id"}
            </p>

            <div className={classes.formDiv}>
              <label htmlFor="expiryDate" className={classes.formLabel}>
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
                {...register("expiryDate", { required: true })}
              />
            </div>
            <p className={classes.errors}>
              {errors.expiryDate?.type === "required" &&
                "Please enter valid expiry date"}
            </p>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "end",
              }}
            >
              <button
                disabled={isSpinner}
                className={classes.button}
                onClick={handleSubmit(onFormSubmit)}
              >
                Confirm
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

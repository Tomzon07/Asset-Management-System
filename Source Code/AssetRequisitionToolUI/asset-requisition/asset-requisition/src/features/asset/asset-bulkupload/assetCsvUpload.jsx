import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./assetCsvUpload.module.css";
import { SpinnerRoundFilled } from "spinners-react";
import { useState, useRef } from "react";
import roundcloseIcon from "../../../assets/roundcloseIcon.svg";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import moment from "moment";
import AssetcsvTemplate from "../../../assets/AssetCsv.csv";
import { AssetCsvUpload } from "../../../common-lib/services/service";
import Swal from "sweetalert2";

export default function AssetCsv({
  csvOpen,
  CsvClose,
  getAllAsset,
  getAllCategory,
}) {
  const [isSpinner, setIsSpinner] = useState(false);
  const [csvEmpty,setCsvEmpty]=useState();
  const [csvInvalid, setCsvInvalid] = useState([]);
  const [csvDuplicate, setCsvDuplicate] = useState([]);
  const [csvRequired,setCsvRequired]=useState([]);
  const inputRef = useRef();

  const currentDateTime = moment().format("YYYYMMDD-hhmmss");
  const fileName = `AssetTemplate_${currentDateTime}.csv`;
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const changeHandler = (event) => {
    const file = event.target.files[0];
  
    setError("");
    setSelectedFile(file || "");
  
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setError("Only .csv files are allowed");
        return;
      }
  
      if (file.size > 1000000) {
        setError("Maximum size allowed is 1 MB");
        return;
      }
    }
  
    setError();
  };

  const handleSubmission = () => {
    setCsvDuplicate([]);
    setCsvInvalid([]);
    setCsvRequired([]);
    setCsvEmpty();
    if (selectedFile) {
      if(!error){
      const formData = new FormData();
      formData.append("csv", selectedFile);
      setIsSpinner(true);
      AssetCsvUpload(formData)
        .then((res) => {
          getAllAsset("total");
          getAllCategory("total");
          setIsSpinner(false);
          CsvClose();
          setSelectedFile();
          inputRef.current.value = "";
          Swal.fire({
            icon: "success",
            title: "File has been uploaded",
            showConfirmButton: false,
            timer: 2500,
          });
        })
        .catch((err) => {
          setCsvEmpty(err?.response?.data?.message)
          err?.response?.data?.DuplicateItems &&
            setCsvDuplicate(err.response.data.DuplicateItems);
          setCsvRequired(err?.response?.data?.RequiredItems)
          err?.response?.data?.InvalidItems &&
            setCsvInvalid(err.response.data.InvalidItems);
          setIsSpinner(false);
          setSelectedFile();
          setError("");
          inputRef.current.value = "";
          if (error.message !== "Request failed with status code 400") {
            onClose();
            Swal.fire({
              icon: "error",
              title: err.message,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        });
      }
    } else {
      setError("Please select a csv file");
    }
  };
  const onClose = () => {
    CsvClose();
    setCsvDuplicate([]);
    setCsvInvalid([]);
    setCsvRequired([]);
    setError("");
    setSelectedFile();
    setCsvEmpty() 
  };

  return (
    <Modal open={csvOpen} onClose={onClose}>
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
              style={{
                width: "70px",
                color: "#415A90",
              }}
            />{" "}
            <SpinnerRoundFilled
              style={{
                width: "70px",
                color: "#415A90",
              }}
            />
            <SpinnerRoundFilled
              style={{
                width: "70px",
                color: "#415A90",
              }}
            />
          </div>
        )}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            marginLeft: "auto",
          }}
        >
          <div className={classes.roundbutton}>
            {" "}
            <img
              src={roundcloseIcon}
              alt=""
              style={{ cursor: "pointer", color: "black" }}
              className={classes.closeButton}
              onClick={onClose}
            />
          </div>

          <h3> Upload CSV</h3>

          <label>
            <CloudUploadIcon
              sx={{
                fontSize: "120px",
                color: "#0a356b",
              }}
              titleAccess={"Choose File"}
            />
          </label>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <input
              style={{
                margin: "auto",
                textAlign: "right",
                border: error ? "2px red solid" : "1px #a7a7a7 solid",
              }}
              type="file"
              accept=".csv"
              name="file"
              id="inputTag"
              onChange={changeHandler}
              ref={inputRef}
              className={`${classes.textField} ${error && classes.error}`}
            />
          </div>
          <br />
          <p
            style={{
              color: "red",
              marginTop: "10px",
              margin: 0,
              padding: 0,
              paddingBottom: "10px",
            }}
          >
            {error}
          </p>

          {csvInvalid !== undefined && csvInvalid?.length > 0 ? (
            <div className={classes.scroll}>
              {csvInvalid?.map((value, index) => {
                return (
                  <>
                    {value.invalidFields !== undefined &&
                    value.invalidFields.length > 0
                      ? value.invalidFields.map((field, subIndex) => (
                          <p
                            key={`${index}-${subIndex}`}
                            style={{ color: "red", margin: 0, padding: 5 }}
                          >
                            {`Line ${value.lineNumber}: ${field.message}`}
                          </p>
                        ))
                      : ""}
                  </>
                );
              })}
            </div>
          ) : (
            ""
          )}

      {csvRequired !== undefined && csvRequired?.length > 0 ? (
            <div className={classes.scroll}>
              {csvRequired?.map((values, index) => {
                return (
                  <>
                    {values.requiredFields !== undefined &&
                    values.requiredFields.length > 0
                      ? values.requiredFields.map((field, subIndex) => (
                          <p
                            key={`${index}-${subIndex}`}
                            style={{ color: "red", margin: 0, padding: 5 }}
                          >
                            {`Line ${values.lineNumber}: ${field.message}`}
                          </p>
                        ))
                      : ""}
                  </>
                );
              })}
            </div>
          ) : (
            ""
          )}

          {csvDuplicate.length > 0 && (
            <div className={classes.scroll}>
              {csvDuplicate.map((errors, index) => (
                <p
                  key={index}
                  style={{
                    color: "red",
                    margin: 0,
                    padding: 5,
                  }}
                >
                  {`line ${errors.lineNumber}: ${errors.assetId} already exists`}
                </p>
              ))}
            </div>
          )}

{csvEmpty ? (
                        <div className={classes.scroll}>
                          <p
                            style={{
                              color: "red",
                              margin: 0,
                              padding: 5,
                            }}
                          >
                            {csvEmpty}
                          </p>
                        </div>
                      ) : (
                        ""
                      )}

          <div className={classes.button} onClick={handleSubmission}>
            Upload
          </div>

          <div>
            <a href={AssetcsvTemplate} download={fileName}>
              <button className={classes.csvButton}>Download Template</button>
            </a>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

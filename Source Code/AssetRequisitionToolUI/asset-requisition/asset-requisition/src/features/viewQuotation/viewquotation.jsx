import { Box, Button, Modal } from "@mui/material";
import classes from "./addQuotation.module.css";

import closeIcon from "../../assets/closeIcon.svg";
import configuration from "../../common-lib/configuartion";

const ViewQuoation = ({ open, onClose, data }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.modal}>
        <div className={classes.titleDiv}>
          <p className={classes.modalTitle}>View Quotation</p>
          <img
            src={closeIcon}
            alt=""
            style={{ margin: "20px", cursor: "pointer" }}
            className={classes.closeButton}
            onClick={() => {
              onClose();
            }}
          />
        </div>

        {/* Form to add user details */}

        <form id="addUserForm">
          {data?.map((data, index) => {
            return (
              <>
                <div style={{ display: "flex" }}>
                  <h3 className={classes.title}>Quotation {index + 1}</h3>{" "}
                </div>
                <div className={classes.formDiv}>
                  <div style={{ width: "100%" }}>
                    <input
                      value={data?.title}
                      id={"title"}
                      type={"text"}
                      style={{ marginRight: "10px", background: "white" }}
                      className={`${classes.textField} `}
                      autoComplete="off"
                      disabled={true}
                    />
                  </div>

                  <div style={{ width: "100%" }}>
                    <input
                      id={"description"}
                      type={"text"}
                      style={{background: "white"}}
                      value={data?.description}
                      className={`${classes.textField}`}
                      autoComplete="off"
                      disabled={true}
                    />
                  </div>
                </div>
                <br />
                <div className={classes.formDiv}>
                  <div style={{ width: "100%" }}>
                    <input
                      value={data?.amount}
                      id={"name"}
                      type={"number"}
                      style={{ marginRight: "10px", background: "white" }}
                      className={`${classes.textField} `}
                      autoComplete="off"
                      disabled={true}
                    />
                  </div>
                  <div style={{ width: "100%" }}>
                    <a
                      style={{ textDecoration: "none" }}
                      target={"_blank"}
                      rel="noreferrer"
                      title={data.filename}
                      href={configuration.FILE_LOCATION + data.filename}
                      download
                    >
                      <div
                        style={{
                          padding: 0,
                          display: "grid",
                          placeContent: "center",
                        }}
                        className={`${classes.textField} `}
                      >
                        Download
                      </div>
                    </a>
                  </div>
                </div>
              </>
            );
          })}

          <br />
          <br />
          <br />
          <br />
        </form>
      </Box>
    </Modal>
  );
};

export default ViewQuoation;

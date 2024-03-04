import configuration from "../../../../common-lib/configuartion";
import classes from "../../ticketdetails.module.css";
import classe from "./ticketvalues.module.css";
import { ArrowDownward, RemoveRedEye } from "@mui/icons-material";
import closeIcon from "../../../../assets/closeIcon.svg";
import { Box, Modal } from "@mui/material";
import React, { useState } from "react";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';


const TicketValues = ({ ticketDetails, userdata }) => {

  let color;
  let status = "";
  // const [quotation, setquotation] = useState(false);
  
  if (ticketDetails?.status === 2) {
    color = "#06a711";
    status = "APPROVED";
  } else if (ticketDetails?.status === 10) {
    color = "#C70000";
    status = "REJECTED";
  } else {
    color = "orange";
    if (ticketDetails.level === 2) {
      status = "Manager Verification";
    } else if (ticketDetails.level === 3) {
      status = "Head Verification";
    } else if (ticketDetails.level === 4) {
      status = "Administration Verification";
    } else if (ticketDetails.level === 5) {
      status = "Quotation Verification";
    } else if (ticketDetails.level === 6) {
      status = "Finance Verification";
    } else if (ticketDetails.level === 7) {
      status = "Ceo Verification";
    } else if (ticketDetails.level === 8) {
      status = "Finance Purchase Order Approval";
    } else {
      status = "Pending";
    }
  }

  const [open, setOpen] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Status:</p>
        <div className={classes.detaildField}>
          <p
            className={classes.detail}
            style={{
              color: color,
            }}
          >
            {status}
          </p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Title:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>
            {ticketDetails?.title?.toUpperCase()}
          </p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Request ID:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.id}</p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Project Code:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.projectCode}</p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Project Name:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.projectName}</p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Category:</p>
        <div className={classes.detaildField}>
          <div className={classes.detailRequirement}>
            {ticketDetails?.categoryName}
          </div>
          <br />
        </div>
      </div>
      {
        ticketDetails?.budget &&  
        <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Amount:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.budget}</p>
        </div>
      </div> 
      }
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Description:</p>
        <div className={classes.detaildField}>
          <div className={classes.detailRequirement}>
            {ticketDetails?.description}
          </div>
          <br />
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Department:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.departmentName}</p>
        </div>
      </div>
      <div className={classes.detailsDiv}>
        <p className={classes.detailtitle}>Raised By:</p>
        <div className={classes.detaildField}>
          <p className={classes.detail}>{ticketDetails?.userName}</p>
        </div>
      </div>




    {
      ticketDetails?.quotations?.length > 0 && (
          <div className={classes.detailsDiv}>
            <p className={classes.detailtitle}>Quotations:</p>
                <div  className={classe.QuotesForm} >
                {
                ticketDetails?.quotations?.map((data, index) => {
                  const isSelected = data.status === "1";
                return (
                  <React.Fragment key={data.id}>
               <div  className={classe.QuotesForms}>

                    <div style={{ display: "flex" }}>
                    {isSelected && <CheckCircleIcon style={{ color: 'blue' }} />}
                      <h3 className={classe.title}>Quotation {index + 1}</h3>{" "}
                    </div>

                    <div className={classe.formDiv}>
                      <div style={{ width: "100%" ,margin:"3px"}}>
                        <input
                          value={data?.title}
                          id={"title"}
                          type={"text"}
                          style={{ marginRight: "10px", background: "white" }}
                          className={`${classe.textField} `}
                          autoComplete="off"
                          disabled={true}
                        />
                      </div>
    
                      <div style={{ width: "100%",margin:"3px" }}>
                        <input
                          id={"description"}
                          type={"text"}
                          style={{background: "white"}}
                          value={data?.description}
                          className={`${classe.textField}`}
                          autoComplete="off"
                          disabled={true}
                        />
                      </div>
                    </div>
                    {/* <br /> */}
                    <div className={classe.formDiv}>
                      <div style={{ width: "100%",margin:"3px" }}>
                        <input
                          value={data?.amount}
                          id={"name"}
                          type={"number"}
                          style={{ marginRight: "10px", background: "white" }}
                          className={`${classe.textField} `}
                          autoComplete="off"
                          disabled={true}
                        />
                      </div>
                      <div style={{ width: "100%",margin:"3px"}}>
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
                              height:"35px"
                            }}
                            className={`${classe.textField} `}
                          >
                            Download
                          </div>
                        </a>
                      </div>
                    </div>
            </div>

                  </React.Fragment>
                );
              })
             }

          </div>
        </div>  
      )

    }




      {ticketDetails?.files?.length > 0 && (
        <div className={classes.detailsDiv}>
          <p className={classes.detailtitle}>File:</p>
          <div style={{ justifyContent: "start" }}>
            <div
              className={classes.approveRrejectbtn}
              style={{ backgroundColor: "blue" }}
              onClick={() => {
                setOpen(true);
              }}
            >
              <RemoveRedEye /> &nbsp; View Files
            </div>
          </div>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <div className={classe.titleDiv}>
            <p className={classe.modalTitle}>{"Files"}</p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={() => {
                setOpen(false);
              }}
            />
          </div>

          <div>
            {ticketDetails?.files?.map((file, index) => {
              return (
                <div
                  key={file?.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{ fontSize: "18px", marginRight: "20px" }}
                    className={classe.modalTitle}
                  >
                    {"File " + parseInt(index + 1) + ":"}
                  </p>
                  <a
                    target={"_blank"}
                    rel="noreferrer"
                    title={file.filePath}
                    href={configuration?.FILE_LOCATION + file?.filePath}
                    download
                    style={{ textDecoration: "none" }}
                  >
                    {" "}
                    <div
                      className={classes.approveRrejectbtn}
                      style={{
                        backgroundColor: "blue",
                        width: "200px",
                        marginTop: "4px",
                      }}
                    >
                      <ArrowDownward /> &nbsp; Download
                    </div>
                  </a>
                </div>
              )
            })
            }
          </div>
        </Box>
      </Modal>
      {ticketDetails?.purchaseOrder?.length > 0 && ticketDetails?.level > 6 &&(
  <>
    <div className={classes.detailsDiv}>
      <p className={classes.detailtitle}>Purchase Order:</p>
      <div style={{ justifyContent: "start" }}>
        <a
          target={"_blank"}
          rel="noreferrer"
          title={ticketDetails?.purchaseOrder}
          href={configuration.FILE_LOCATION + ticketDetails?.purchaseOrder}
          download
          style={{ textDecoration: "none" }}
        >
          {" "}
          <div
            className={classes.approveRrejectbtn}
            style={{
              backgroundColor: "blue",
              marginTop:"0px"
            }}
          >
            <ArrowDownward /> &nbsp; PO File
          </div>
        </a>
      </div>
    </div>
  </>
)}
    </div>
  );
};

export default TicketValues;

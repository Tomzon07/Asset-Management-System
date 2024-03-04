import classes from "./ticketdetails.module.css";
import SideNavbar from "../sidenavbar/sideNavabr";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  setLevelTickets,
  setStatusTickets,
} from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import getUserPermission from "../../common-lib/checkuser";
import Swal from "sweetalert2";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ConfirmationDialogue from "./components/confirmationDIalogue/confirmation";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import "./ticketdetails.css";
import BasicModal from "../allocate-asset/allocateAsset";
import StepperComponent from "./components/Stepper/StepperComponent";
import StepperVertical from "./components/Stepper/StepperVertical";
import TicketValues from "./components/ticketValues/ticketValues";

import { selectFile } from "./components/util/selectFile";
import { cisoApprove } from "./components/util/cisoApprove";
import { ticketById } from "./components/util/ticketById";
import AddQuoation from "../addQuotation/addQuoatation";
import TicketHistory from "./components/TicketHistory/ticketHistory";

const TicketDetails = ({ getNotification }) => {
  const [quotationModal, setQuotationModal] = useState(false);
  const location = useLocation();
  const [ticketDetails, setTicketDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [role, setrole] = useState(false);
  const [userdata, setuserdata] = useState();

  const [open, setOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [error, setError] = useState("");
  const { height } = useWindowDimensions();
  const [divHeight, setDivHeight] = useState(height - 160);
  const [isForward, setIsForward] = useState("FALSE");
  const [categoryDetail, setCategoryDetail] = useState({});
  const [isClicked, setIsClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formData = new FormData();
  const ConfirmationBoxOpen = () => setConfirmationOpen(true);
  const ConfirmationClose = () => setConfirmationOpen(false);

  const handleAssetClose = () => setIsModalOpen(false);
  const rejectBoxOpen = () => setRejectOpen(true);
  const rejectBoxClose = () => setRejectOpen(false);
  const forwardBoxClose = () => setForwardOpen(false);
  const handleClose = () => {
    setOpen(false);
    setSelectedFile();
    setError("");
  };

  /** use Effects */
  useEffect(() => {
    setuserdata(getUserPermission());
  }, []);

  useEffect(() => {
    setDivHeight(height - 88);
  }, [height]);

  /** set user type
  useEffect(() => {
    const roles = checkUser(userdata, ticketDetails);
    setrole(roles?.role);
    setIfCiso(roles?.ifCiso);
    setifInfra(roles?.ifInfra);
  }, [userdata, ticketDetails]);*/

  /** This use effect is used to get the details of ticket */
  useEffect(() => {
    getTicket();
  }, []);
  /** -------------------------------------- */

  /** This function triggers when  user click reject button and in this function set pk,sk of current ticket to setApproveStatus vaariable and ticketstatus to rejected */
  const onClickReject = (obj) => {
    setIsLoading(true);
    !isClicked &&
      setStatusTickets(obj)
        .then((res) => {
          ConfirmationClose();
          rejectBoxClose();
          forwardBoxClose();
          Swal.fire({
            title: "Success",
            text: "Request Rejected Successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
          setIsLoading(false);
          getTicket();
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        })
        .catch((err) => {
          setIsLoading(false);
          ConfirmationClose();
          rejectBoxClose();
          forwardBoxClose();
          Swal.fire({
            title: "Failed",
            text: "Unable to reject ticket",
            icon: "error",
            timer: 1600,
            showConfirmButton: false,
          });
          setTimeout(() => {
            setIsClicked(false);
          }, 20);
        });
  };
  /** Function to call the api of setlvelof tickets when ticket is approved by user */
  const setLevelOfTickets = (id,data) => {
    setIsLoading(true);
    !isClicked &&
      setLevelTickets(id,data)
        .then(() => {
          Swal.fire({
            title: "Success",
            text:
              data.forward === "1"
                ? "Request Approved Successfully"
                : "Request  Approved Successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
          setIsLoading(false);
          getTicket();
          setSelectedFile("");
          setError("");
          handleClose();
          ConfirmationClose();
          rejectBoxClose();
          forwardBoxClose();
          setTimeout(() => {
            setIsClicked(false);
          }, 40);
        })
        .catch(() => {
          setTimeout(() => {
            setIsClicked(false);
          }, 40);
          ConfirmationClose();
          rejectBoxClose();
          forwardBoxClose();
          handleClose();
          setIsLoading(false);
          Swal.fire({
            title: "Failed",
            text: "Failed",
            icon: "error",
            timer: 1600,
            showConfirmButton: false,
          });
        });
  };

  /** Function set file that selected by ciso head  */
  const handlChange = selectFile(setError, setSelectedFile);
  /** This function used to get current ticket details by passing current ticket Id by calling getTicketById api function */
  const getTicket = ticketById(
    getNotification,
    location,
    setIsLoading,
    setIsForward,
    setTicketDetails,
    setrole
  );
  /** Function used append files uploaded by ciso head to formdata and call setlevel function */
  const onClickApproveCiso = cisoApprove(
    selectedFile,
    formData,
    ticketDetails,
    error,
    setLevelOfTickets,
    setError
  );

  return (
    <>
      <div className={classes.userDashboard}>
        <div style={{ display: "flex" }}>
          {/*  -----Side Navbar---------*/}
          <SideNavbar className={classes.navBar} />
          {!isLoading && <div className={classes.ticketdetails} style={{ height: divHeight }}>
            <p className={classes.title}>Request Details</p>
            <StepperComponent ticketDetails={ticketDetails} />
            <div style={{ display: "flex" }}>
              <StepperVertical ticketDetails={ticketDetails} />
              <div style={{ width: "100%", display: "flex" }}>
                <TicketValues
                  ticketDetails={ticketDetails}
                  userdata={userdata}
                />
                <div className={classes.history}>
                  <TicketHistory ticketDetails={ticketDetails} />
                </div>
                </div>
                </div>

               <div className={classes.buttonDiv}>
               {role && ticketDetails.status !== 10 && (
                <>
                  <div
                    className={classes.approveRrejectbtn}
                    onClick={() => {
                      ticketDetails.level === 4
                        ? setQuotationModal(true)
                        : ConfirmationBoxOpen();
                    }}
                  >
                    <DoneIcon /> &nbsp; Approve
                  </div>

                  <div
                    className={classes.approveRrejectbtn}
                    style={{ backgroundColor: "#C70000" }}
                    onClick={rejectBoxOpen}
                  >
                    <CloseIcon /> &nbsp;Deny
                  </div>
                </>
               )}
                </div>

                <div>
               {/* {isModalOpen && (
                <BasicModal
                  open={isModalOpen}
                  onClose={handleAssetClose}
                  ticketdetails={categoryDetail}
                  getTicket={getTicket}
                />
               )} */}
                </div>
                </div>
                 }
                </div>
    
                {isLoading && <LoadingScreen />}
                <div>
                  <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogContent sx={{ paddingBottom: "0px" }}>
               <DialogContentText>
                Please upload estimate for the asset requested
                </DialogContentText>
                <input
                type={"file"}
                className={`${classes.textField} ${error && classes.error}`}
                onChange={handlChange}
                style={{
                  border: error ? "2px red solid" : "1px #a7a7a7 solid",
                }}
                />

                <p
                style={{
                  color: "red",
                  padding: 0,
                  margin: 0,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                }}
                >
                {error}
                </p>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} className={classes.closeBtn}>
                Cancel
                </Button>
                <Button
                onClick={() => {
                  setIsClicked(true);
                  onClickApproveCiso();
                }}
                className={classes.confirmBtn}
                >
                Confirm
                </Button>
                </DialogActions>
                </Dialog>
                </div>
        <AddQuoation
          id={ticketDetails?.id}
          open={quotationModal}
          // getTicket={getTicket}
          onClose={() => {
            setQuotationModal(false);
          }}
        />
          <ConfirmationDialogue
            open={confirmationOpen}
            handleClose={ConfirmationClose}
            ticketDetails={ticketDetails}
            disabled={isClicked}
            onClickApprove={(file,comments) => {
              setConfirmationOpen(false);
              setIsClicked(true);
              if (ticketDetails?.level === 8) {
                file.append("id",ticketDetails?.id)
                file.append("forward", "1")
                file.append("comments",comments)
                setLevelOfTickets(ticketDetails?.id,file);
              } else {
                const data = {
                  id: ticketDetails?.id,
                  forward: "1",
                  comments:comments
                };
                setLevelOfTickets(ticketDetails?.id, data);
              }
            }}
            status={"approve"}
          />

        <ConfirmationDialogue
          open={rejectOpen}
          handleClose={rejectBoxClose}
          disabled={isClicked}
          onClickApprove={(file,comments) => {
            setRejectOpen(false);
            setIsClicked(true);
            const obj = { ticketId: ticketDetails.id, comments:comments };
            onClickReject(obj);
          }}
          status={"reject"}
        />
        <ConfirmationDialogue
          open={forwardOpen}
          handleClose={forwardBoxClose}
          disabled={isClicked}
          onClickApprove={() => {
            setForwardOpen(false);
            setIsClicked(true);
            setLevelOfTickets({ id: ticketDetails.id, forward: "0" });
          }}
          status={"forward"}
        />
      </div>
    </>
  );
};
export default TicketDetails;

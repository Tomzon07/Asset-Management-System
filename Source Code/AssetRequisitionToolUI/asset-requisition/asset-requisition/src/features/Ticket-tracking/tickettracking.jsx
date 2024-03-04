import classes from "./tickettracking.module.css";
import SideNavbar from "../sidenavbar/sideNavabr";
import { Stepper, Step, StepLabel } from "@mui/material";
import clases from "../Ticket/ticketdetails.module.css";
import {
  getTicketById,
  getUserByEmail,
} from "../../common-lib/services/service";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import Swal from "sweetalert2";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";

const TicketTracking = ({getNotification}) => {
  const initialStepperValue = [
    "Ticket Raised",
    "Dept Head",
    "Infra",
    "Allocation",
  ];
  const forwardedValue = [
    "Ticket Raised",
    "Dept Head",
    "Infra",
    "Ciso",
    "Finance",
    "Infra",
    "Allocation",
  ];

  const [raised, setRaised] = useState("");
  const location = useLocation();
  const [ticketId, setTicketId] = useState("");
  const [history, setHistory] = useState([]);
  const { height } = useWindowDimensions();
  const [divHeight, setDivHeight] = useState(height - 100);
  const [isLoading, setIsLoading] = useState(true);
  const [stepperValues, setStepperValues] = useState(initialStepperValue);
  const [level, setLevel] = useState();

  const setStepper = (forward, ticketlevel, ticketstatus) => {
    if (forward === "TRUE") {
      setStepperValues(forwardedValue);
      if (ticketstatus === "APPROVED") {
        setLevel(8);
      } else {
        switch (ticketlevel) {
          case "CISO":
            setLevel(3);
            return;
          case "FINANCE":
            setLevel(4);
            return;
          case "INFRASTRUCTURE":
            setLevel(5);
            return;
          default:
            setLevel(0);
        }
      }
    } else if (ticketstatus === "APPROVED") {
      setLevel(4);
    } else {
      switch (ticketlevel) {
        case "HEAD":
          setLevel(1);
          return;
        case "INFRASTRUCTURE":
          setLevel(2);
          return;
        default:
          setLevel(0);
      }
    }
  };
  useEffect(() => {
    setDivHeight(height - 100);
  }, [height]);
  const fetchTicket = () => {
    const ticketIds = location.state.ticketId;

    setTicketId(ticketIds);
    if (ticketIds) {
      setIsLoading(true);
      getTicketById(ticketIds)
        .then((res) => {
          setIsLoading(false);
          setStepper(
            res.data.Item.forward,
            res.data.Item.level,
            res.data.Item.ticketstatus
          );
          setHistory(res.data.Item.history);
        })
        .catch((err) => {
          Swal.fire({
            title: "Failed",
            text: err?.response?.data?.message,
            icon: "error",
            timer: 1700,
            showConfirmButton: false,
          });
        });
    }
  };

  const fetchEmail = () => {
    const email = location.state.email;
    if (email) {
      getUserByEmail(email)
        .then((res) => {
          setRaised(res.data.Item.name);
        });
    }
  };

  useEffect(() => {
    fetchEmail();
    fetchTicket();
  }, []);

  return (
    <div className={classes.userDashboard}>
      <div style={{ display: "flex", height: "95vh" }}>
        {/*  -----Side Navbar---------*/}
        <SideNavbar className={classes.navBar} />
        <div className={classes.ticketdetails} style={{ height: divHeight }}>
          <p className={clases.title}>Ticket Tracking</p>
          <div
            style={{
              width: "100%",
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowX: "auto",
            }}
          >
            <div style={{ width: "100%" }}>
              <Stepper
                alternativeLabel
                activeStep={level}
                sx={{
                  width: "100%",
                }}
                className={classes.stepper}
              >
                {stepperValues.map((value, index) => {
                  return (
                    <Step key={index}>
                      <StepLabel>{value}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </div>
          </div>
          <div className={classes.detailsDiv}>
            <span className={classes.detailtitle}>
              Ticket ID: &nbsp;{ticketId}
            </span>
            <span className={classes.detailtitle}>
              Raised By:&nbsp; {raised}
            </span>
          </div>
          <div className={classes.contentDiv}>
            <table className={classes.table}>
              <thead>
                <tr style={{ height: "70px" }}>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Action</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr style={{ height: "70px" }} key={index}>
                    <td>{new Date(item.time).toLocaleDateString("en-GB")}</td>
                    <td>
                      {new Date(item.time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </td>
                    <td>{item && `Ticket ${item.action}`}</td>
                    <td>{item.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>{" "}
      </div>
      {isLoading && <LoadingScreen />}
    </div>
  );
};
export default TicketTracking;

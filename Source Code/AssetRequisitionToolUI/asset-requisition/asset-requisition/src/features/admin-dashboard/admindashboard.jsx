import classes from "./admindashboard.module.css";
import SideNavbar from "../sidenavbar/sideNavabr";
import TicketChart from "./components/ticketChart/ticketchart";
import Button from "./components/button/button";

import { useEffect, useRef, useState } from "react";
import { getTicketCount, getTickets } from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
import useWindowDimensions from "./useWindowDimensions";
import getUserPermission from "../../common-lib/checkuser";
import TicketTables from "../admin-ticketlist/components/table/ticketTable";
import { useNavigate } from "react-router-dom";

const AdminDashBoard = ({ getNotification }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [totalCount, settotalCount] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [rejectCount, setrejectCount] = useState(null);
  const [rows, setRows] = useState([]);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [isTicketLoading, setTicketLoading] = useState(true);
  const [pageNo, setPageNo] = useState(0);
  const [count, setPagecount] = useState(15);
  const [totalTicketCount, setTotalTicketCount] = useState(0);
  const user = getUserPermission();
  const [ticketType, setTicketType] = useState(1);
  const { height } = useWindowDimensions();
  const ref = useRef();
  const [tableHeight, setTableHeight] = useState();

  const getAllTickets = (
    pageNo,
    count,
    type,
    ticketType,
    search,
    projectId,
    departmentId,
    field,
    status
  ) => {
    if (user) setTicketLoading(true);
    getTickets(
      pageNo,
      count,
      type,
      ticketType,
      search,
      projectId,
      departmentId,
      field,
      status
    )
      .then((res) => {
        setRows(res.data.Items);
        setTotalTicketCount(res.data.Count);
        setTicketLoading(false);
        ticketCount();
      })
      .catch((err) => {
        setTicketLoading(false);
      });
  };

  useEffect(() => {
    const tktType = user.permission.includes("EMPLOYEE");
    tktType && setTicketType(0);
    getAllTickets(pageNo, count, 0, tktType ? 0 : 1, "", "", "", "", "");
  }, []);

  useEffect(() => {
    setIsVisible(true);
    isVisible && setTableHeight(height - 46.5 - ref?.current?.offsetHeight);
  }, [height, isVisible]);

  function ticketCount() {
    setIsCountLoading(true);

    getTicketCount()
      .then((res) => {
        setTableHeight(height - 46.5 - ref?.current?.offsetHeight);
        setIsCountLoading(false);
        settotalCount(res.data.Total);
        setPendingCount(res.data.Pending);
        setrejectCount(res.data.Rejected);
      })
      .catch((err) => {
        setIsCountLoading(false);
        Swal.fire({
          title: "Failed",
          text: err.message,
          icon: "error",
          timer: 1600,
          showConfirmButton: false,
        });
      });
  }

  return (
    <>
      <div className={classes.userDashboard}>
        <div className={classes.divs} style={{ display: "flex" }}>
          {/*  -----Side Navbar---------*/}
          <SideNavbar className={classes.navBar} />
          {isVisible && (
            <div className={classes.adminDashBoard}>
              <div ref={ref}>
                <br />
                <p className={classes.title}>Requests</p>
                {/**  It displays the chart tickets in the orginisation it shows total tickets,pending and completed*/}
                {pendingCount === "" ||
                rejectCount === "" ||
                totalCount === "" ? (
                  <LoadingScreen />
                ) : (
                  <div className={classes.chartDiv}>
                    <TicketChart
                      onClick={() => {
                        navigate("/myrequestlist", {
                          replace: true,
                          state: {
                            filter: "myrequest",
                          },
                        });
                      }}
                      title={"My Requests"}
                      backgroundColor="#080672"
                      count={totalCount}
                    />
                    <TicketChart
                      onClick={() => {
                        navigate(user.permission.includes("EMPLOYEE")?"/myrequestlist":"/requestlist", {
                          replace: true,
                          state: {
                            filter: "pending",
                          },
                        });
                      }}
                      title="Pending"
                      backgroundColor="#03A500"
                      count={pendingCount}
                    />
                    <TicketChart
                      onClick={() => {
                        navigate("/requestlist", {
                          replace: true,
                          state: {
                            filter: "rejected",
                          },
                        });
                      }}
                      title="Rejected"
                      backgroundColor="#CE0A0A"
                      count={rejectCount}
                    />
                  </div>
                )}
                <br />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    width: "100%",
                  }}
                >
                  {rows.length !== 0 && (
                    <Button buttonTitle="View All" to="/requestlist" />
                  )}
                </div>
                <br />
              </div>
              {/**  The table shows the list all tickets in the organisation to admin*/}
              {rows.length === 0 &&
                isTicketLoading === false &&
                isCountLoading === false && (
                  <div className={classes.noRecord}>
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ margin: "auto" }}
                      width="150"
                      height="150"
                      fill="grey"
                      className="bi bi-folder2-open"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z" />
                    </svg>
                    <h2>No Records Found</h2>{" "}
                  </div>
                )}

              {rows.length > 0 &&
                isTicketLoading === false &&
                isCountLoading === false && (
                  <TicketTables
                    rowsperPages={count}
                    type={0}
                    departmentSelected={""}
                    projectSelected={""}
                    statusSelected={""}
                    searchValue={""}
                    pageNo={pageNo}
                    minHeight={0}
                    maxHeight={tableHeight}
                    alltickets={rows}
                    getAllTickets={getAllTickets}
                    count={totalTicketCount}
                    setpageNo={setPageNo}
                    setCount={setPagecount}
                    ticketType={ticketType}
                    isPagination={false}
                  />
                )}
            </div>
          )}
        </div>
      </div>
      {isCountLoading && <LoadingScreen />}
      {isTicketLoading && <LoadingScreen />}
    </>
  );
};

export default AdminDashBoard;

import SideNavbar from "../sidenavbar/sideNavabr";
import classes from "./adminTicketList.module.css";
import classe from "../admin-dashboard/admindashboard.module.css";
import clas from "../admin-userslist/adminuserslist.module.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useState, useEffect, useRef } from "react";
import {
  getDepartment,
  getTickets,
  projectLists,
} from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
import getUserPermission from "../../common-lib/checkuser";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import { useLocation } from "react-router-dom";
import TicketTables from "./components/table/ticketTable";
import { Dropdown } from "primereact/dropdown";
import { Button } from "@mui/material";

const AdminTicketList = ({ getNotification }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [count, setPagecount] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const type = 0;
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentSelected, setDepartmentSelected] = useState("");
  const [projectSelected, setProjectSelected] = useState("");
  const [statusSelected, setStatusSelected] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [ticketType, setTicketType] = useState(1);
  const [isExpanded, setIsExapnded] = useState(true);
  const [role, setRole] = useState();
  const { height, width } = useWindowDimensions();
  const ref = useRef();
  const [alignment, setAlignment] = useState("left");

  const user = getUserPermission();
  const [tableHeight, setTableHeight] = useState(
    height - ref?.current?.offsetHeight - 87
  );
  const [departments, setDepartments] = useState([]);
  const [statusList, setstatusList] = useState([
    {
      label: "Pending",
      id: 12,
    },
    {
      label: "Approved",
      id: 11,
    },
    {
      label: "Rejected",
      id: 10,
    },
    {
      label: "Manager level",
      id: 2,
    },
    {
      label: "Head level",
      id: 3,
    },
    {
      label: "Administration level",
      id: 4,
    },
    {
      label: "Quotation verification level",
      id: 5,
    },
    {
      label: "Finance level",
      id: 6,
    },
    {
      label: "Ceo level",
      id: 7,
    },
    {
      label: "Finance Purchase Order level",
      id: 8,
    },
  ]);
  const [projectList, setProjectList] = useState([]);

  /** Function to reset filtrers and when switching between requests and my requests */
  const resetFilter = (ticketTYpe) => {
    setSelectedDepartment("");
    setSelectedProject("");
    setSelectedStatus("");
    setDepartmentSelected("");
    setProjectSelected("");
    setStatusSelected("");
    setSearchValue("");
    setPageNo(0);
    getAllTickets(0, count, type, ticketTYpe, "", "", "", "", "");
  };

  useEffect(() => {
    setTableHeight(height - ref?.current?.offsetHeight - 90);
  }, [height]);

  const getAllTickets = (
    pageNo,
    count,
    type,
    ticketType,
    search,
    projectId,
    departmentId,
    field,
    status,
    load
  ) => {
    !load && setIsLoading(true);

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
        setRows(res?.data?.Items);
        setTotalCount(res?.data?.Count);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: err.message,
          timer: 1500,
          showConfirmButton: false,
        });
      });
  };

  const ticketSearch = (e) => {
    setPageNo(0);
    setSearchValue("");
    const searchText = e.target.value;
    const load = true;
    getAllTickets(
      0,
      count,
      type,
      ticketType,
      searchText,
      projectSelected,
      departmentSelected,
      "",
      statusSelected,
      load
    );
  };

  /** Use effect to call get All tickets function when first time page is loaded */
  useEffect(() => {
    getDepartment().then((res) => {
      setDepartments(res?.data);
    });

    projectLists().then((res) => {
      setProjectList(res?.data);
    });
    let tktType = 1;

    setTicketType(tktType);
    if (location?.state?.filter === "myrequest") {
      setTicketType(0);
      resetFilter(0);
      setAlignment("right");
    } else if (location?.state?.filter === "rejected") {
      setIsExapnded(true);
      setSelectedStatus({
        label: "Rejected",
        id: 10,
      });
      setTicketType(0);
      setAlignment("right");
      getAllTickets(
        pageNo,
        count,
        type,
        0,
        searchValue,
        projectSelected,
        departmentSelected,
        "",
        10
      );
    } else if (location?.state?.filter === "pending") {
      setIsExapnded(true);
      setSelectedStatus({
        label: "Pending",
        id: 12,
      });
      getAllTickets(
        pageNo,
        count,
        type,
        tktType,
        searchValue,
        projectSelected,
        departmentSelected,
        "",
        12
      );
    } else {
      getAllTickets(
        pageNo,
        count,
        type,
        tktType,
        searchValue,
        projectSelected,
        departmentSelected,
        "",
        statusSelected
      );
    }
    const data = getUserPermission();
    setRole(data.permission);
  }, []);

  return (
    <div className={classes.adminTicketList}>
      <div style={{ display: "flex" }}>
        <SideNavbar />
        {!isLoading && (
          <div
            style={{
              width: width > 950 ? width - 225 : "100%",
              height: height - 88,
              overflowY: "auto",
            }}
          >
            <div style={{ width: "100%", paddingBottom: "14px" }} ref={ref}>
              <br />
              <div className={classes.firstDiv}>
                <input
                  type="text"
                  className={clas.searchBar}
                  placeholder="Search"
                  onChange={ticketSearch}
                />
              </div>
              <p
                className={classe.title}
                style={{ marginBottom: "0", marginTop: "10px" }}
              >
                Requests
              </p>
              <div className={classes.filter}>
                <div
                  onClick={() => {
                    setIsExapnded(!isExpanded);
                  }}
                  className={classes.filterTitleDiv}
                >
                  <>Filter</>
                  <ArrowBackIosIcon
                    style={{
                      width: "16px",
                      rotate: isExpanded ? "90deg" : "270deg",
                      marginBottom: isExpanded ? "0px" : "8px",
                      marginTop: isExpanded ? "7px" : "0px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: isExpanded ? "block" : "none",
                    width: "100%",
                    transition: "height  0.3s ease-in-out",
                  }}
                >
                  <div className={classes.filterDiv}>
                    <Dropdown
                      value={selectedDepartment}
                      onChange={(e) => {
                        setDepartmentSelected(e.value.id);
                        setSelectedDepartment(e.value);
                        setPageNo(0);
                        getAllTickets(
                          0,
                          count,
                          type,
                          ticketType,
                          searchValue,
                          projectSelected,
                          e.value.id,
                          "",
                          statusSelected
                        );
                      }}
                      options={departments}
                      optionLabel="departmentName"
                      placeholder="Department"
                      filter
                      className={classes.dropdown}
                    />
                    <Dropdown
                      value={selectedProject}
                      onChange={(e) => {
                        setPageNo(0);
                        setProjectSelected(e.target.value.id);
                        setSelectedProject(e.value);
                        getAllTickets(
                          0,
                          count,
                          type,
                          ticketType,
                          searchValue,
                          e.target.value.id,
                          departmentSelected,
                          "",
                          statusSelected
                        );
                      }}
                      options={projectList}
                      optionLabel="projectName"
                      placeholder="Project"
                      filter
                      className={classes.dropdown}
                    />{" "}
                    <Dropdown
                      value={selectedStatus}
                      onChange={(e) => {
                        setPageNo(0);
                        getAllTickets(
                          0,
                          count,
                          type,
                          ticketType,
                          searchValue,
                          projectSelected,
                          departmentSelected,
                          "",
                          e.value.id
                        );
                        setStatusSelected(e.value.id);
                        setSelectedStatus(e.value);
                      }}
                      options={statusList}
                      optionLabel="label"
                      placeholder="Status"
                      filter
                      className={classes.dropdown}
                    />
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <Button
                      className={classes.confirmBtn}
                      style={{
                        display: "grid",
                        placeContent: "ceneter",
                        height: "",
                        marginBottom: "10px",
                        marginRight: "10px",
                      }}
                      onClick={() => {
                        setSelectedDepartment("");
                        setSelectedProject("");
                        setSelectedStatus("");
                        setDepartmentSelected("");
                        setProjectSelected("");
                        setStatusSelected("");
                        setPageNo(0);
                        getAllTickets(
                          0,
                          count,
                          type,
                          ticketType,
                          searchValue,
                          "",
                          "",
                          "",
                          ""
                        );
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {rows?.length === 0 && isLoading === false && (
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
            {isLoading === false && rows.length !== 0 && (
              <TicketTables
                rowsperPages={count}
                type={type}
                departmentSelected={departmentSelected}
                projectSelected={projectSelected}
                statusSelected={statusSelected}
                searchValue={searchValue}
                pageNo={pageNo}
                minHeight={0}
                maxHeight={tableHeight}
                alltickets={rows}
                getAllTickets={getAllTickets}
                count={totalCount}
                setpageNo={setPageNo}
                setCount={setPagecount}
                ticketType={ticketType}
                isPagination={true}
              />
            )}
          </div>
        )}
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default AdminTicketList;

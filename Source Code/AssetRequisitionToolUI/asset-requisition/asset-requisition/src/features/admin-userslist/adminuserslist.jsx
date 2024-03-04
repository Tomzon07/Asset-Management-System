import classes from "./adminuserslist.module.css";
import classe from "../admin-dashboard/admindashboard.module.css";
import SideNavbar from "../sidenavbar/sideNavabr";
import AddUserButton from "./components/button/adduserbutton";
import { useState, useEffect, useRef } from "react";
import BasicModal from "../add-user/adduser";
import getUsers from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import TableUser from "./components/TableUser/tableuser";

const AdminUsersList = ({ getNotification }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState();
  const [load, setLoad] = useState(false);
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(15);
  const ref = useRef();
  const { height } = useWindowDimensions();
  const [tableHeight, setTableHeight] = useState(100);

  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    isVisible && setTableHeight(height - 88 - ref?.current?.offsetHeight);
  }, [height, isVisible]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError();
  };

  /** The function to call getUsers function from services and setValues to an array */
  const getAllUsers = async (rowsPerPage, page, field, type, value) => {
    if (!value) {
      setIsLoading(true);
    }
    return getUsers(rowsPerPage, page, field, type, value)
      .then((res) => {
        setIsLoading(false);
        setUsers(res.data.Items);
        setTotalCount(res.data.Count);
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

  useEffect(() => {
    getAllUsers(count, 0, "", 0, "").then(() => {
      setLoad(true);
      setTableHeight(height - 88 - ref?.current?.offsetHeight);
    });
  }, []);

  /** Function to search user by passing user email  */
  const userSearch = (e) => {
    const searchText = e.target.value;
    setSearchValue(e.target.value);
    if (searchText.length === 0) getAllUsers(count, 0, "", 0, "");
    else getAllUsers(count, 0, "", 0, searchText);
  };

  return (
    <div className={classes.adminuserlist}>
      <div style={{ display: "flex" }}>
        <SideNavbar />

        {isVisible &&
          <div className={classes.divs}>
            <div style={{ paddingBottom: "30px" }} ref={ref}>
              <br />
              <div className={classes.firstDiv}>
                <input
                  value={searchValue}
                  type="text"
                  className={classes.searchBar}
                  placeholder="Search"
                  onChange={userSearch}
                />
                <div style={{ display: "flex" }}>
                  <AddUserButton buttonText="Add User" onClick={handleOpen} />
                  {/* -------------------------------------------------------Modal to add user manually-------------------------------------------------------- */}
                  <BasicModal
                    open={open}
                    onClose={handleClose}
                    getAllUsers={getAllUsers}
                    count={count}
                    setSearchValue={setSearchValue}
                  />
                </div>
              </div>
              <p className={classe.title} style={{ marginBottom: 0 }}>
                Users
              </p>
            </div>
            {users.length === 0 && isLoading === false ? (
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
            ) : (
              (isLoading === false || load) && (
                <TableUser
                  searchValue={searchValue}
                  count={count}
                  setCount={setCount}
                  maxHeight={tableHeight}
                  users={users}
                  getAllUsers={getAllUsers}
                  totalCount={totalCount}
                />
              )
            )}
          </div>
        }
      </div>
      {isLoading && <LoadingScreen />}
    </div>
  );
};
export default AdminUsersList;

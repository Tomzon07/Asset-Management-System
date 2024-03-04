import classes from "./header.module.css";
import icon from "../../assets/logo-login.svg";
import profileIcon from "../../assets/profileIcon.svg";
import notificatioIcon from "../../assets/notification.svg";
import hamburgerIcon from "../../assets/hamburgerIcon.svg";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showOnButtonClick } from "../sidenavbar/sideNavbarSlice";
import getUserPermission from "../../common-lib/checkuser";
import { Logout } from "@mui/icons-material";
import {
  notificationDelete,
  getNotification,
  notificationCount,
  getUserByEmail,
  clearAllNotification,
} from "../../common-lib/services/service";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const Header = () => {
  const [profileDropDown, setProfileDropDown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [roles, setRoles] = useState([]);
  const [userData, setUserData] = useState();
  const [department, setDepartment] = useState([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const wrapperRef = useRef(null);
  const [notification, setNotification] = useState("");
  const [count, setCount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const onClickprofile = () => {
    setProfileDropDown(!profileDropDown);
    setOpen(false);
  };

  useEffect(() => {
    const user = getUserPermission();
    getUserByEmail(user.userId)
      .then((res) => {
        setName(res?.data?.name.toUpperCase());
        setUserData(res?.data);
      })
      .catch((err) => {
        if (err?.response?.data === "Access Denied") {
          localStorage.clear();
        }
      });
    const data = getUserPermission();
    setDepartment(data?.department);
    setRoles(data?.permission);
  }, []);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setProfileDropDown();
    }
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const onClickNotification = () => {
    setOpen((prevOpen) => !prevOpen);
    setProfileDropDown(false);
    getAllNotification();
  };

  const handleDetailsClick = () => {
    setOpen(false);
  };

  const getAllNotification = () => {
    setIsLoading(true);
    getNotification()
      .then((res) => {
        setIsLoading(false);
        const notificationData = res.data;
        setNotification(notificationData);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getAllNotification();
  }, []);

  const clearAll = () => {
    clearAllNotification().then((res) => {
      getAllNotification();
      getAllCount();
    });
  };

  const handleDotClick = (notificationId) => {
    notificationDelete(notificationId).then((res) => {
      getAllNotification();
      getAllCount();
      setOpen(true);
    });
  };

  const getAllCount = () => {
    notificationCount()
      .then((res) => {
        setCount(res.data.Count);
        getAllNotification();
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getAllCount();
  }, []);

  return (
    <div className={classes.header}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          alt=""
          src={hamburgerIcon}
          className={classes.hamburgerIcon}
          onClick={() => dispatch(showOnButtonClick())}
        />
        <img
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/dashboard");
          }}
          alt=""
          src={icon}
          className={classes.logo}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div ref={wrapperRef}>
          <img
            alt=""
            src={notificatioIcon}
            className={classes.notificationIcon}
            onClick={onClickNotification}
          />

          {count > 0 && (
            <div className={classes.counter}>{count > 99 ? "99+" : count}</div>
          )}
          {open && (
            <div
              className={classes.notiDropdown}
              style={{ padding: "5px", flexDirection: "column" }}
            >
              <ul className={classes.ul}>
                <h1 className={classes.notiHeading}>Notifications</h1>
                <hr className={classes.hr} />
                <button className={classes.clearAllButton} onClick={clearAll}>
                  CLEAR
                </button>
                <div className={classes.Listing}>
                  {isLoading && notification.length > 0 ? (
                    Array.from({ length: Math.min(count, 4) }).map((index) => (
                      <Box
                        key={index}
                        className={classes.box}
                        sx={{ marginTop: 0.5 }}
                      >
                        <Skeleton
                          animation="wave"
                          className={classes.wave}
                          sx={{ marginTop: -1 }}
                        />
                        <Skeleton
                          animation="wave"
                          className={classes.wave2}
                          sx={{ marginTop: -1 }}
                        />
                      </Box>
                    ))
                  ) : notification && notification.length > 0 ? (
                    notification.map((notifications, index) => (
                      <li className={classes.notiList} key={index}>
                        <p
                          style={{
                            width: "90%",
                            marginLeft: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          <NavLink
                            to="/requestlist/requestdetails"
                            onClick={() => handleDetailsClick()}
                            style={{
                              textDecoration: "none",
                              color: "black",
                              cursor: "pointer",
                            }}
                            state={{ ticketId: notifications?.ticketId }}
                          >
                            {notifications?.message}
                          </NavLink>
                        </p>
                        <span
                          className={classes.dot}
                          onClick={() => handleDotClick(notifications.id)}
                          title={"delete"}
                        ></span>
                      </li>
                    ))
                  ) : (
                    <li className={classes.notiList}>
                      <p
                        style={{
                          width: "90%",
                          marginLeft: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {notification.length === 0
                          ? "No notifications found..!"
                          : ""}
                      </p>
                    </li>
                  )}
                </div>
              </ul>
            </div>
          )}
        </div>

        <div ref={ref}>
          <div className={classes.profile} onClick={onClickprofile}>
            <img alt="" src={profileIcon} className={classes.profileIcon} />
          </div>
          {profileDropDown && (
            <div className={classes.menuDropdown}>
              <ul className={classes.ul}>
                <li className={classes.prof}>
                  <div className={classes.iconDiv}>
                    <img
                      alt=""
                      src={profileIcon}
                      className={classes.profileIcon}
                      style={{ width: "70px", margin: "auto" }}
                    />
                    <p
                      title={name}
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        margin: "2px",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      title={userData?.email}
                      style={{
                        fontSize: "14px",
                        fontWeight: "400",
                        marginTop: "3px",
                        marginBottom: 0,
                      }}
                    >
                      {userData?.email}
                    </p>
                    {department.map((data) => {
                      return (
                        <>
                          <p
                            key={data}
                            title={data}
                            style={{
                              fontSize: "14px",
                              fontWeight: "400",
                              marginTop: "3px",
                              marginBottom: 0,
                              display: "block",
                            }}
                          >
                            {data}
                          </p>
                        </>
                      );
                    })}

                    {roles.map((role) => {
                      return (
                        <p
                          key={role}
                          title={role}
                          style={{
                            fontSize: "14px",
                            fontWeight: "400",
                            marginTop: "3px",
                            marginBottom: 0,
                          }}
                        >
                          {role}
                        </p>
                      );
                    })}
                  </div>
                </li>
                <hr
                  style={{ margin: 0, borderColor: "rgba(224, 224, 224, .2)" }}
                />

                <li
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                  className={classes.li}
                >
                  <Logout />
                  &nbsp;Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

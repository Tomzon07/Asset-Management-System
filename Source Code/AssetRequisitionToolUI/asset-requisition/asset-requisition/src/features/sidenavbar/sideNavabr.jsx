import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import getUserPermission from "../../common-lib/checkuser";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import classes from "./sideNavbar.module.css";
import { hideOnWidth, showOnWidth } from "./sideNavbarSlice";
import { navDetails1, navDetailsAdmin, navDetails2, navDetailsAdmin2 } from "./navlist";

const SideNavbar = () => {
  const user = getUserPermission();
  const getNavBarDetails = (usr) => {
    const isAdmin = usr.permission.includes("ADMIN");
    const isEmployee = usr.permission.includes("EMPLOYEE");

    switch (true) {
      case isAdmin && isEmployee:
        return navDetailsAdmin2;
      case isAdmin && !isEmployee:
        return navDetailsAdmin;
      case isEmployee && !isAdmin:
        return navDetails2;
      default:
        return navDetails1;
    }
  };

  // const SideNavbar = () => {
  //   const user = getUserPermission()
  //   const getNavBarDetails = (usr) => {
  //     if (usr.permission.includes("ADMIN")) {
  //       return navDetailsAdmin;
  //     } else {
  //       return navDetails1;
  //     }
  //   }

  const { width, height } = useWindowDimensions();
  const showNavbar = useSelector((state) => state.showNavbar.showNavbar);
  const dispatch = useDispatch();
  const navBarDetails = getNavBarDetails(user)
  const [navHeight, setNavHeight] = useState(height - 98)

  useEffect(() => {
    setNavHeight(height - 98)
  }, [height])

  useEffect(() => {
    if (width > 950) {
      dispatch(showOnWidth({ range: 2 }));
    }
  }, [dispatch, showNavbar, width]);

  useEffect(() => {
    if (width < 950) {
      dispatch(hideOnWidth());
    }
  }, [width, dispatch]);

  return (
    <div >
      {showNavbar && (
        <div className={classes.sideNavbar} style={{ minHeight: width < 950 ? "100vh" : navHeight }}>
          <div
            style={{
              listStyle: "none",
              textAlign: "center",
              display: "grid",
              width: "100%",
            }}
          >
            <br />
            <div className={classes.closebtndiv} style={{ display: width < 950 ? "flex" : "none" }}><div className={classes.closebtn} onClick={() => { dispatch(hideOnWidth()) }}><Close titleAccess="close" /></div></div>
            <br />
            {navBarDetails.map((navDetail, index) => {
              return (
                <NavLink
                  className={({ isActive }) =>
                    isActive ? classes.navLinkActive : classes.navLink
                  }
                  to={navDetail.to}
                  key={index}
                >
                  {navDetail.icon}
                  <p className={classes.navTitle}>{navDetail.title}</p>
                </NavLink>
              );
            })}
          </div>
        </div>

      )}
      {showNavbar && width < 950 && <div className={classes.overlay} onClick={() => { dispatch(hideOnWidth()) }}></div>}
    </div>
  );
};

export default SideNavbar;

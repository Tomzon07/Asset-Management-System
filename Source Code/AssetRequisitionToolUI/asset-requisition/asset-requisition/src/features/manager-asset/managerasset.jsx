import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import { managerAssetsList } from "../../common-lib/services/service";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import SideNavbar from "../sidenavbar/sideNavabr";
import ManagerAssetTable from "./components/managerassettable/managerassettable";
import classes from "./managerasset.module.css";

const ManagerAsset = ({ getNotification }) => {
  const { height } = useWindowDimensions();

  const ref = useRef();
  const [tableHeight, setTableHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [assetList, setAssetList] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    managerAssetsList()
      .then((res) => {
        setIsLoading(false);
        setAssetList(res.data.Items);
      })
      .catch((err) => {
        setIsLoading(false);
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  }, []);
  useEffect(() => {
    setTableHeight(height - 90 - ref?.current?.offsetHeight);
  }, [height]);
  return (
    <div style={{ display: "flex" }}>
      <SideNavbar />
      <div style={{ width: "100%" }}>
        <div style={{ paddingBottom: "10px" }} ref={ref}>
          <br />
          <div className={classes.titleDiv}>
            <p className={classes.title}>Asset</p>
          </div>
        </div>
        {assetList.length === 0 && isLoading === false && (
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
        {assetList.length > 0 && isLoading === false && (
          <ManagerAssetTable assets={assetList} maxHeight={tableHeight} />
        )}

        {isLoading && <LoadingScreen />}
      </div>
    </div>
  );
};

export default ManagerAsset;

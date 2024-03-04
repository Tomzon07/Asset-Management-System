import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import { getAssetById } from "../../common-lib/services/service";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import ExtendAsset from "../assetExtend/ExtendAsset";
import ReturnAssetDialog from "../assetExtend/assetReturn/ReturnAssetDialog";
import SideNavbar from "../sidenavbar/sideNavabr";
import classes from "./assetdetails.module.css";

const AssetDetails = ({getNotification}) => {
  const { height } = useWindowDimensions();
  const [divHeight, setDivHeight] = useState(height - 160);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assetDetails, setAssetDetails] = useState({
    allocatedUser: "INFRA",
    ticketId: "",
    expiryDate: "",
  });
  const location = useLocation();
  useEffect(() => {
    setDivHeight(height - 160);
  }, [height]);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const handleOpenReturnModal = () => {
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
  };

  useEffect(() => {
    const assetId = location.state.assetId;
    getAssetsById(assetId);
    setIsLoading(true);
  }, [location]);
  const getAssetsById = (assetId) => {
    getAssetById(assetId)
      .then((res) => {
        setIsLoading(false);
        setAssetDetails(res.data.Item);
      })
      .catch((err) => {
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
        setIsLoading(false);
      });
  };
  return (
    <div className={classes.userDashboard}>
      <div style={{ display: "flex" }}>
        {/*  -----Side Navbar---------*/}
        <SideNavbar className={classes.navBar} />
        <div className={classes.ticketdetails} style={{ height: divHeight }}>
          <p className={classes.title}>Asset Details</p>
          <div style={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
              <div className={classes.detailsDiv}>
                <p className={classes.detailtitle}>Asset ID:</p>
                <div className={classes.detaildField}>
                  <p className={classes.detail}>{assetDetails?.pk}</p>
                </div>
              </div>
              {assetDetails.ticketId !== "" && (
                <div className={classes.detailsDiv}>
                  <p className={classes.detailtitle}>Ticket ID:</p>
                  <div className={classes.detaildField}>
                    <p className={classes.detail}>{assetDetails?.ticketId}</p>
                  </div>
                </div>
              )}
              <div className={classes.detailsDiv}>
                <p className={classes.detailtitle}>Model No.:</p>
                <div className={classes.detaildField}>
                  <p className={classes.detail}>{assetDetails?.modelNo}</p>
                </div>
              </div>
              <div className={classes.detailsDiv}>
                <p className={classes.detailtitle}>Category:</p>
                <div className={classes.detaildField}>
                  <p className={classes.detail}>{assetDetails?.category}</p>
                </div>
              </div>
              <div className={classes.detailsDiv}>
                <p className={classes.detailtitle}>Asset:</p>
                <div className={classes.detaildField}>
                  <p className={classes.detail}>{assetDetails?.device}</p>
                </div>
              </div>
              {assetDetails.expiryDate !== "" && (
                <div className={classes.detailsDiv}>
                  <p className={classes.detailtitle}>Expiry Date:</p>
                  <div className={classes.detaildField}>
                    <div className={classes.detailRequirement}>
                      {assetDetails.expiryDate}
                    </div>
                    <br />
                  </div>
                </div>
              )}
              <div className={classes.detailsDiv}>
                <p className={classes.detailtitle}>Equipped By:</p>
                <div className={classes.detaildField}>
                  <div className={classes.detailRequirement}>
                    {assetDetails.allocatedUser}
                  </div>
                  <br />
                </div>
              </div>
            </div>
          </div>
          <br />
          <br />
          {assetDetails.allocatedUser !== "INFRA" ? (
            <div className={classes.buttonDiv}>
              <div
                className={classes.approveRrejectbtn}
                style={{ backgroundColor: "orange" }}
                onClick={() => setIsOpen(true)}
              >
                Extend
              </div>
              <ExtendAsset
                open={isOpen}
                onClose={() => setIsOpen(false)}
                assetId={assetDetails.pk}
                ticketId={assetDetails?.ticketId}
                getAssetbyId={getAssetsById}
              />
              <div
                className={classes.approveRrejectbtn}
                style={{ backgroundColor: "blue" }}
                onClick={handleOpenReturnModal}
              >
                {" "}
                Return
              </div>
              <ReturnAssetDialog
                open={isReturnModalOpen}
                assetId={assetDetails.pk}
                onClose={handleCloseReturnModal}
                ticketId={assetDetails?.ticketId}
                getAssetById={getAssetsById}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default AssetDetails;

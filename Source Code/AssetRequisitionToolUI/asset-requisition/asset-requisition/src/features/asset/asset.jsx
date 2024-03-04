import { useState, useRef, useEffect } from "react";
import AddAsset from "../add-asset/addasset";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import SideNavbar from "../sidenavbar/sideNavabr";
import classes from "./asset.module.css";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import closeIcon from "../../assets/closeIcon.svg";
import { useForm } from "react-hook-form";
import {
  addCategory,
  getAssetList,
  getCategoryDetails,
} from "../../common-lib/services/service";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";
import Swal from "sweetalert2";
import AssetCsv from "./asset-bulkupload/assetCsvUpload";
import VirtualAssetTable from "./components/virtualTable/virtualtable";
import { SpinnerRoundFilled } from "spinners-react";
import InfiniteScroll from "react-infinite-scroller";

const Asset = ({ getNotification }) => {
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [catopen, setCatOpen] = useState(false);
  const handleAssetOpen = () => setCatOpen(true);
  const handleAssetClose = () => setCatOpen(false);
  const [assetList, setAssetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const handleCsvOpen = () => setIsCsvOpen(true);
  const handleCsvClose = () => setIsCsvOpen(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [isAllCategory, setAllCategory] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [catLoading, setcatLoading] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState();
  const ref = useRef();
  const [tableHeight, setTableHeight] = useState(0);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

   /** useEffect to set the height of the table according to the height of device */
   useEffect(() => {
    setTableHeight(height - 90 - ref?.current?.offsetHeight);
  }, [height, isAllCategory]);

  useEffect(() => {
    getAllAssets("total");
    getAllCategoryDetails("total");
  }, []);

/** Function that triggers when submit add category form */
  const onFormSubmit = (data) => {
    setcatLoading(true);
    addCategory(data)
      .then((response) => {
        setcatLoading(false);
        handleAssetClose();
        getAllCategoryDetails("total");
        reset();
        Swal.fire({
          title: "Success",
          text: "Category addedd successfully",
          icon: "success",
          timer: 1700,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        setcatLoading(false);
        setCategoryError(err?.response?.data?.message);
      });
  };

  let numberOfElements;
  if (width > 1300) {
    numberOfElements = 4;
  } else if (width > 600) {
    numberOfElements = 3;
  } else {
    numberOfElements = 2;
  }

 

  const changeCategory = (e) => {
    getAllAssets(e.target.value);
    getAllCategoryDetails(e.target.value);
  };

  const getAllCategoryDetails = (e) => {
    setIsCategoryLoading(true);
    getCategoryDetails(
      e,
      lastEvaluatedKey ? lastEvaluatedKey : { pk: "", sk: "" }
    )
      .then((res) => {
        setIsCategoryLoading(false);
        setCategoryDetails(res?.data?.items);
        categoryDetails.length === 0 || !lastEvaluatedKey
          ? setCategoryDetails(res?.data?.items)
          : setCategoryDetails([...categoryDetails, ...res?.data?.items]);
        res?.data?.lastEvaluatedKey
          ? setLastEvaluatedKey(res?.data?.lastEvaluatedKey)
          : setLastEvaluatedKey();
      })
      .catch((err) => {
        setIsCategoryLoading(false);
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1000,
          showConfirmButton: false,
        });
      });
  };
  /** Function to get all assets list based on parameter passes through it  */
  const getAllAssets = (e) => {
    setIsLoading(true);
    getAssetList(e)
      .then((res) => {
        setAssetList(res?.data?.Items);
        setIsLoading(false);
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
  };

  const loadMore = () => {
    getAllCategoryDetails("total");
  };
  return (
    <div style={{ display: "flex" }}>
      <SideNavbar />
      <div style={{ width: width > 950 ? width - 270 : "100%" }}>
        <div style={{ paddingBottom: "10px" }} ref={ref}>
          <br />
          <div className={classes.titleDiv}>
            <p className={classes.title}>Asset</p>
            <button
              className={classes.btn}
              onClick={() => {
                setAllCategory(!isAllCategory);
              }}
            >
              {isAllCategory ? "Hide Category" : "All Category"}
            </button>
          </div>
          {isAllCategory === false && (
            <div
              className={classes.categoryDiv}
              style={{
                justifyContent:
                  categoryDetails?.length > 3 || width < 600
                    ? "space-between"
                    : "unset",
              }}
            >
              {categoryDetails
                .slice(0, numberOfElements)
                .map((category, index) => {
                  const colorIndex = index % 3;
                  return (
                    <div
                      style={{
                        backgroundColor:
                          colorIndex === 1
                            ? "#828DFB"
                            : colorIndex === 2
                            ? "#8952EA"
                            : "#5421A2",
                      }}
                      className={classes.categoryCard}
                      key={index}
                    >
                      <p className={classes.categoryTitle}>
                        {category.categoryName}
                      </p>
                      <p className={classes.categoryCount}>{category.count}</p>
                    </div>
                  );
                })}
            </div>
          )}
          {isAllCategory && (
            <div
              style={{
                justifyContent:
                  categoryDetails?.length > 3 || width < 600
                    ? "space-between"
                    : "unset",
                maxHeight: width > 600 ? "32vh" : "29vh",
                height: "32vh",
                overflow: "auto",
              }}
            >
              <InfiniteScroll
                pageStart={0}
                loadMore={loadMore}
                hasMore={lastEvaluatedKey ? true : false}
                threshold={5}
                useWindow={false}
              >
                <div className={classes.categoryDiv}>
                  {categoryDetails.map((category, index) => {
                    const colorIndex = index % 3;
                    return (
                      <div
                        style={{
                          backgroundColor:
                            colorIndex === 1
                              ? "#828DFB"
                              : colorIndex === 2
                              ? "#8952EA"
                              : "#5421A2",
                        }}
                        className={classes.categoryCard}
                        key={index}
                      >
                        <p className={classes.categoryTitle}>
                          {category.categoryName}
                        </p>
                        <p className={classes.categoryCount}>
                          {category.count}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </InfiniteScroll>
            </div>
          )}
          <div className={classes.btnDiv}>
            <div className={classes.selectDiv}>
              <select
                className={classes.select}
                defaultValue={"total"}
                onChange={changeCategory}
              >
                <option value={"total"}>View All</option>
                <option value={"allocated"}>Allocated</option>
                <option value={"free"}>Unalloacted</option>
              </select>
            </div>
            <div className={classes.buttonDiv}>
              <button className={classes.btn} onClick={handleCsvOpen}>
                Upload Asset
              </button>
              <AssetCsv
                csvOpen={isCsvOpen}
                CsvClose={handleCsvClose}
                getAllAsset={getAllAssets}
                getAllCategory={getAllCategoryDetails}
              />
              <button className={classes.btn} onClick={handleAssetOpen}>
                Add Category
              </button>
              {catopen && (
                <div className={classes.modal}>
                  <Modal
                    sx={{ zIndex: 1000 }}
                    open={catopen}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box className={classes.modal}>
                      {catLoading && (
                        <div
                          className={classes.modal}
                          style={{
                            zIndex: "999",
                            backgroundColor: "transparent",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <SpinnerRoundFilled
                            style={{ width: "100px", color: "#415A90" }}
                          />{" "}
                          <SpinnerRoundFilled
                            style={{ width: "100px", color: "#415A90" }}
                          />
                          <SpinnerRoundFilled
                            style={{ width: "100px", color: "#415A90" }}
                          />
                        </div>
                      )}

                      <div className={classes.titleDiv}>
                        <p className={classes.modalTitle}>Add Category</p>
                        <img
                          src={closeIcon}
                          alt=""
                          style={{ margin: "20px", cursor: "pointer" }}
                          className={classes.closeButton}
                          onClick={() => {
                            handleAssetClose();
                            reset();
                            setCategoryError("");
                          }}
                        />
                      </div>

                      <form id="addCategoryForm">
                        <br />
                        <br />
                        <div className={classes.formDiv}>
                          <label
                            htmlFor="category"
                            className={classes.formLabel}
                          >
                            Category
                          </label>
                          <input
                            id={"category"}
                            type={"text"}
                            className={`${classes.textField} ${
                              (categoryError || errors.category) &&
                              classes.error
                            } `}
                            autoComplete="off"
                            onInput={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                            }}
                            style={{
                              border:
                                errors.category || categoryError
                                  ? "2px red solid"
                                  : "1px #a7a7a7 solid",
                            }}
                            {...register("category", {
                              required: true,
                              minLength: 4,
                              maxLength: 30,
                              pattern: /^\S(.*\S)?$/,
                              onChange: () => {
                                setCategoryError("");
                              },
                            })}
                          />
                        </div>
                        <p className={classes.errors}>
                          {errors.category?.type === "required" &&
                            "Category is required"}
                          {errors.category?.type === "pattern" &&
                            "Enter a valid category"}
                          {errors.category?.type === "minLength" &&
                            "Category should be atleast 4 characters long"}
                          {errors.category?.type === "maxLength" &&
                            "Maxmimum length allowed is 30"}

                          {!errors.category && categoryError}
                        </p>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "end",
                          }}
                        >
                          <button
                            className={classes.button}
                            onClick={handleSubmit(onFormSubmit)}
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </Box>
                  </Modal>
                </div>
              )}
              <button className={classes.btn} onClick={handleOpen}>
                Add Asset
              </button>
            </div>
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
          <VirtualAssetTable
            rows={assetList}
            getAllAsset={getAllAssets}
            maxHeight={tableHeight}
            getAllCategory={getAllCategoryDetails}
          />
        )}
        <AddAsset
          open={open}
          onClose={handleClose}
          getAllAssets={getAllAssets}
          getAllCategory={getAllCategoryDetails}
        />
        {isLoading && <LoadingScreen />}
        {isCategoryLoading && <LoadingScreen />}
      </div>
    </div>
  );
};

export default Asset;

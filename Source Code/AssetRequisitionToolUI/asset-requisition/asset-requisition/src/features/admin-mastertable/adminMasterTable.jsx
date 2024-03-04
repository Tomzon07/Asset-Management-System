import SideNavbar from "../sidenavbar/sideNavabr";
import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import EditIcon from "../../assets/editIcon.svg";
import DeleteIcon from "../../assets/deleteIcon.svg";
import { useState, useEffect } from "react";
import DepartmentTable from "./departmentTable";
import CategoryTable from "./categoryTable";
import classes from "./adminMasterTable.module.css";
import classe from "../admin-dashboard/admindashboard.module.css";
import CategoryModal from "../create-ticket/categoryModal";
import ProjectModal from "../create-ticket/projectModal";
import DepartmentModal from "../create-ticket/departmentModal";
import {
  getAllProjects,
  projectDelete,
} from "../../common-lib/services/service";
import Swal from "sweetalert2";
import TablePagination from "@mui/material/TablePagination";
import useWindowDimensions from "../admin-dashboard/useWindowDimensions";
import LoadingScreen from "../../common-lib/loadingscreen/loadingscreen";

const columns = [
  { id: "projectName", label: "Project Name", minWidth: 170 },
  { id: "projectCode", label: "Project Code", minWidth: 100 },
];

export default function AdminMasterTable() {
  const [page, setPage] = React.useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [prjctTodelte, setPrjctToDelte] = useState("");
  const [deleteOpen, setDelteOpen] = useState(false);
  const [categoryAdded, setCategoryAdded] = useState(false);
  const [departmentAdded, setDepartmentAdded] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const { height } = useWindowDimensions();
  const [divHeight, setDivHeight] = useState(height - 160);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteOpen = () => {
    setDelteOpen(true);
  };
  const handleDeleteClose = () => {
    setDelteOpen(false);
    setPrjctToDelte("");
  };

  useEffect(() => {
    setDivHeight(height - 100);
  }, [height]);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  function fetchData() {
    setIsLoading(true);
    getAllProjects(rowsPerPage, page)
      .then((response) => {
        setIsLoading(false);
        const data = response?.data?.Items;
        setTotalCount(response?.data?.Count);
        setRows(data);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    getAllProjects(+event.target.value, 0, "", 0);
    setPage(0);
  };

  const DeleteProject = () => {
    setIsLoading(true);
    projectDelete(deleteId)
      .then((res) => {
        setIsLoading(false);
        fetchData();
        handleDeleteClose();
        Swal.fire({
          title: "Success",
          text: "Project deleted successfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        handleDeleteClose();
        setIsLoading(false);
        Swal.fire({
          title: "Failed",
          text:
            err?.response?.status === 400
              ? "User is already allocated to this Project"
              : err?.response?.data?.message,
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });
      });
  };

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleAddProject = () => {
    setShowProjectModal(true);
    setEditData(null);
  };

  const handleAddDepartment = () => {
    setShowDepartmentModal(true);
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={classes.page} style={{ display: "flex" }}>
        <div className={classes.SideNavbar}>
          <SideNavbar />
        </div>

        {isVisible && (
          <div className={classes.page1} style={{ height: divHeight }}>
            <div className={classes.rowTables}>
              <div className={classes.firstTable}>
                <div className={classes.btn} onClick={handleAddDepartment}>
                  Add Department
                </div>
                <DepartmentTable departmentAdded={departmentAdded} />
                {showDepartmentModal && (
                  <DepartmentModal
                    open={showDepartmentModal}
                    close={setShowDepartmentModal}
                    onClose={() => {
                      setShowDepartmentModal(false);
                      setDepartmentAdded(!departmentAdded);
                    }}
                  />
                )}
              </div>
              <div className={classes.scndTable}>
                <div className={classes.btn} onClick={handleAddCategory}>
                  Add Category
                </div>
                {showCategoryModal && (
                  <CategoryModal
                    open={showCategoryModal}
                    onClose={() => {
                      setShowCategoryModal(false);
                      setCategoryAdded(!categoryAdded);
                    }}
                  />
                )}
                <CategoryTable categoryAdded={categoryAdded} />
              </div>
            </div>
            <div className={classes.ProjectTableDiv}>
              <p className={classe.title} style={{ marginBottom: 5 }}>
                Projects
              </p>

              <div className={classes.btn} onClick={handleAddProject}>
                {showProjectModal && (
                  <ProjectModal
                    open={showProjectModal}
                    onClose={() => {
                      setShowProjectModal(false);
                    }}
                    onProjectAdded={fetchData}
                  />
                )}
                Add Project
              </div>

              <Paper
                className={classes.scroll}
                sx={{
                  maxHeight: "247px",
                  overflowY: "auto",
                  borderRadius: "20px",
                  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px;",
                }}
              >
                <TableContainer>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              maxWidth: "150px",
                            }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{ minWidth: 20, maxWidth: 20 }}
                        ></TableCell>
                        <TableCell
                          sx={{ minWidth: 20, maxWidth: 20 }}
                        ></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.id}
                        >
                          <TableCell>{row.projectName}</TableCell>
                          <TableCell>{row.projectCode}</TableCell>
                          <TableCell style={{ maxWidth: 20, minWidth: 20 }}>
                            <img
                              style={{ cursor: "pointer" }}
                              alt=""
                              src={EditIcon}
                              title="Edit Project"
                              onClick={() => {
                                setEditData({
                                  id: row?.id,
                                  projectName: row?.projectName,
                                  projectCode: row?.projectCode,
                                });
                                setShowProjectModal(true);
                              }}
                            />
                          </TableCell>
                          <TableCell style={{ maxWidth: 20, minWidth: 20 }}>
                            <img
                              alt=""
                              src={DeleteIcon}
                              style={{ cursor: "pointer" }}
                              title="Delete Project"
                              onClick={() => {
                                setPrjctToDelte(row?.projectName);
                                handleDeleteOpen();
                                setDeleteId(row?.id);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {rows?.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[10]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                )}
              </Paper>
            </div>
          </div>
        )}
      </div>
      )
      {showProjectModal && (
        <ProjectModal
          editData={editData}
          open={showProjectModal}
          onProjectAdded={fetchData}
          onClose={() => setShowProjectModal(false)}
        />
      )}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &nbsp;&nbsp;&nbsp;
          </DialogContentText>
          <DialogContentText style={{ fontWeight: 600, fontSize: "16px" }}>
            {prjctTodelte}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button onClick={DeleteProject} className={classes.confirmBtn}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

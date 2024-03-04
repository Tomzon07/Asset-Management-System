import { useState, useEffect } from "react";
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
import TablePagination from "@mui/material/TablePagination";
import EditIcon from "../../assets/editIcon.svg";
import DeleteIcon from "../../assets/deleteIcon.svg";
import {
  deleteDepartment,
  getAllDepartments,
} from "../../common-lib/services/service";
import DepartmentModal from "../create-ticket/departmentModal";
import Swal from "sweetalert2";
import classes from "./departmentTable.module.css";

const columns = [{ id: "departmentName", label: "Department", minWidth: 170 }];

export default function DepartmentTable({ departmentAdded }) {
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState(null);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [deptToDelte, setdeptToDelte] = useState("");
  const [deleteOpen, setDelteOpen] = useState(false);
  const handleDeleteOpen = () => {
    setDelteOpen(true);
  };
  const handleDeleteClose = () => {
    setDelteOpen(false);
    setdeptToDelte("");
  };
  const [deleteId, setDeleteId] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const departmentDelete = () => {
    deleteDepartment(deleteId)
      .then((res) => {
        handleDeleteClose();
        getAllDepartments();
        fetchData();

        Swal.fire({
          title: "Success",
          text: "Department deleted successfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        handleDeleteClose();
        Swal.fire({
          title: "Failed",
          text:
            err?.response?.status === 400
              ? "User is already allocated to this Department"
              : err?.response?.data?.message,
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        });
      });
  };

  useEffect(() => {
    fetchData();
  }, [departmentModalVisible]);

  useEffect(() => {
    fetchData();
  }, [departmentAdded, page]);

  function fetchData() {
    getAllDepartments(rowsPerPage, page)
      .then((response) => {
        const departments = response?.data?.Items;
        setRows(departments);
        setTotalCount(response?.data?.Count);
      })
      .catch((error) => {});
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    getAllDepartments(+event.target.value, 0, "", 0);
    setPage(0);
  };

  return (
    <>
      <div>
        <Paper
          className={classes.scroll}
          sx={{
            overflowY: "auto",
            borderRadius: "15px",
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px;",
            maxHeight: "247px",
            minHeight: "247px",
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
                  <TableCell sx={{ minWidth: 20, maxWidth: 20 }} />
                  <TableCell sx={{ minWidth: 20, maxWidth: 20 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(rows) &&
                  rows.map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell>{row.departmentName}</TableCell>
                      <TableCell style={{ minWidth: 20, maxWidth: 20 }}>
                        <img
                          style={{ cursor: "pointer" }}
                          alt=""
                          src={EditIcon}
                          title="Edit Department"
                          onClick={() => {
                            setEditData({
                              id: row.id,
                              departmentName: row.departmentName,
                            });
                            setDepartmentModalVisible(true);
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ minWidth: 20, maxWidth: 20 }}>
                        <img
                          alt=""
                          src={DeleteIcon}
                          style={{ cursor: "pointer" }}
                          title="Delete Department"
                          onClick={() => {
                            setdeptToDelte(row?.departmentName);
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
          {rows.length > 0 && (
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
      {departmentModalVisible && (
        <DepartmentModal
          getAllDepartments={fetchData}
          editData={editData}
          open={departmentModalVisible}
          onClose={() => setDepartmentModalVisible(false)}
        />
      )}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &nbsp;&nbsp;&nbsp;
          </DialogContentText>
          <DialogContentText style={{ fontWeight: 600, fontSize: "16px" }}>
            {deptToDelte}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button onClick={departmentDelete} className={classes.confirmBtn}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

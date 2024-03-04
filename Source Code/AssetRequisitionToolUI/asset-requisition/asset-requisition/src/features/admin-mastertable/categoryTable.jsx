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
  deleteCategory,
  getAllCatgeory,
} from "../../common-lib/services/service";
import CategoryModal from "../create-ticket/categoryModal";
import classes from "./departmentTable.module.css";
import Swal from "sweetalert2";

const columns = [{ id: "categoryName", label: "Category", minWidth: 170 }];

export default function CategoryTable({ categoryAdded }) {
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [catToDelte, setCatToDelte] = useState("");
  const [deleteOpen, setDelteOpen] = useState(false);
  const handleDeleteOpen = () => {
    setDelteOpen(true);
  };
  const handleDeleteClose = () => {
    setDelteOpen(false);
    setCatToDelte("");
  };
  const [deleteId, setDeleteId] = useState("");

  const categoryDelete = () => {
    deleteCategory(deleteId)
      .then((res) => {
        handleDeleteClose();
        fetchdata();
        Swal.fire({
          title: "Success",
          text: "Category deleted successfully",
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
              ? "User is already allocated to this Category"
              : err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  };

  function fetchdata() {
    getAllCatgeory(rowsPerPage, page)
      .then((response) => {
        const categories = response?.data?.Items;
        setRows(categories);
        setTotalCount(response?.data?.Count);
      })
      .catch((error) => {});
  }

  useEffect(() => {
    fetchdata();
  }, [categoryModalVisible]);

  useEffect(() => {
    fetchdata();
  }, [categoryAdded, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    getAllCatgeory(+event.target.value, 0, "", 0);
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
                      <TableCell>{row.categoryName}</TableCell>
                      <TableCell style={{ minWidth: 20, maxWidth: 20 }}>
                        <img
                          style={{ cursor: "pointer" }}
                          alt=""
                          src={EditIcon}
                          title="Edit Category"
                          onClick={() => {
                            setEditData({
                              id: row.Id,
                              categoryName: row.categoryName,
                            });
                            setCategoryModalVisible(true);
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ minWidth: 20, maxWidth: 20 }}>
                        <img
                          alt=""
                          src={DeleteIcon}
                          style={{ cursor: "pointer" }}
                          title="Delete Category"
                          onClick={() => {
                            setDeleteId(row?.Id);
                            setCatToDelte(row?.categoryName);
                            handleDeleteOpen();
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
      {categoryModalVisible && (
        <CategoryModal
          editData={editData}
          open={categoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
        />
      )}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &nbsp;&nbsp;&nbsp;
          </DialogContentText>
          <DialogContentText style={{ fontWeight: 600, fontSize: "16px" }}>
            {catToDelte}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button onClick={categoryDelete} className={classes.confirmBtn}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

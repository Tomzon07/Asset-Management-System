import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import Swal from "sweetalert2";
import { deleteUser } from "../../../../common-lib/services/service";

import editIcon from "../../../../assets/editIcon.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";

import classes from "./tableuser.module.css";
import BasicModal from "../../../add-user/adduser";
import LoadingScreen from "../../../../common-lib/loadingscreen/loadingscreen";

const TableUser = ({
  maxHeight,
  users,
  getAllUsers,
  totalCount,
  count,
  setCount,
  searchValue
}) => {
  const columns = [
    {
      id: "employeeId",
      label: "Employee ID",
    },
    {
      id: "name",
      label: "Employee Name",
    },
    {
      id: "email",
      label: "Email ",

      maxWidth: 50,
    },
    {
      id: "userDepartments",
      label: "Department",
    },
    {
      id: "userpermissions",
      label: "Permission",
    },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTodelete, setUserToDelete] = useState({ pk: "", sk: "" });
  const handleClickOpen = () => setDialogOpen(true);
  const handleClickClose = () => setDialogOpen(false);
  const [isClick, setisClick] = useState(false);
  const [page, setPage] = React.useState(0);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditEmail();
  };
  useEffect(() => {}, [users]);
  const [editEmail, setEditEmail] = useState(null);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getAllUsers(count, newPage, "", 0, searchValue);
  };

  const handleChangeRowsPerPage = (event) => {
    setCount(+event.target.value);
    getAllUsers(+event.target.value, 0, "", 0, searchValue);
    setPage(0);
  };
  /** Function to delete the user by passing the email Id of the specific user */
  const deleteUserByEmail = () => {
    if (userTodelete) {
      setisClick(true);
      setIsLoading(true);
      !isClick &&
        deleteUser(userTodelete.id)
          .then((res) => {
            handleClickClose();
            setIsLoading(false);
            Swal.fire({
              title: "Success",
              text: "Deleted Successfully",
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
            });
            getAllUsers(count, page, "", 0, "");
            setTimeout(() => {
              setisClick(false);
            }, 20);
          })
          .catch((error) => {
            setIsLoading(false);
            Swal.fire({
              title: "Failed",
              text: error.response.data.message,
              icon: "error",
              timer: 1000,
              showConfirmButton: false,
            });
            handleClickClose();
            setTimeout(() => {
              setisClick(false);
            }, 20);
          });
    }
  };

  return (
    <>
      <Paper
        sx={{
          width: "99%",
          overflow: "hidden",
          borderRadius: "20px",
          boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px;",
        }}
      >
        <TableContainer sx={{ maxHeight: maxHeight - 53 }}>
          <Table size="small" stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow sx={{ background: "white" }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginRight: "0px",
                      width: 100,
                      maxWidth: 100,
                      minWidth: 100,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell
                  sx={{ minWidth: 20, maxWidth: 20, width: 20 }}
                ></TableCell>
                <TableCell
                  sx={{ minWidth: 20, maxWidth: 20, width: 20 }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                    
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ width: 100, maxWidth: 100, minWidth: 100 }}
                        >
                          {column.id === "userDepartments" ? (
                            value.map((data) => {
                              return (
                                <li
                                  title={data?.department?.departmentName}
                                  key={data?.department?.departmentName}
                                  style={{
                                    fontSize: "13px",
                                    maxWidth: "200px",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {data?.department?.departmentName}
                                </li>
                              );
                            })
                          ) : 
                          column.id === "userpermissions" ? (
                            value.map((data) => {
                              return (
                                <li
                                  title={data?.permission?.permission}
                                  key={data?.permissionId}
                                  style={{
                                    fontSize: "13px",
                                    maxWidth: "200px",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {data?.permission?.permission}
                                </li>
                              );
                            })
                          ):
                          (
                            <p
                              style={{
                                fontSize: "13px",
                                maxWidth: "200px",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                              title={
                                value
                              }
                            >
                            
                              {value}
                            </p>
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell
                      style={{ minWidth: 15, maxWidth: 15, width: 15 }}
                    >
                      <img
                        alt=""
                        title="Edit user"
                        src={editIcon}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setEditEmail(row.id);
                          handleOpen();
                        }}
                      />
                    </TableCell>
                    <TableCell
                      style={{ minWidth: 15, maxWidth: 15, width: 15 }}
                    >
                      <img
                        alt=""
                        title="Delete User"
                        src={deleteIcon}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setUserToDelete({ id: row.id, email: row.email });
                          handleClickOpen();
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={count}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <BasicModal
        open={open}
        onClose={handleClose}
        editUserEmail={editEmail}
        getAllUsers={getAllUsers}
        count={count}
      />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Dialog
          open={dialogOpen}
          onClose={handleClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete User?</DialogTitle>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              className={classes.dialogTitle}
            >
              Do you really want to delete
            </DialogContentText>
            <DialogContentText
              id="alert-dialog-description"
              style={{ color: "black" }}
            >
              {userTodelete.email}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClickClose} className={classes.closeBtn}>
              Cancel
            </Button>
            <Button
              onClick={deleteUserByEmail}
              autoFocus
              className={classes.confirmBtn}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default TableUser;

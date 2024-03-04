import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import classes from "./table.module.css";
import eyeIcon from "../../../../assets/eye.svg";
import tick from "../../../../assets/tick1.svg";
import close from "../../../../assets/close.svg";
import "./table.css";
import editIcon from "../../../../assets/editIcon.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  deleteTicket,
  setLevelTickets,
  setStatusTickets,
} from "../../../../common-lib/services/service";
import Swal from "sweetalert2";
import checkTicketLevel from "../util/checkticketlevel";
import checkOwnTicketLevel from "../util/checkownrequestlevel";
import AddQuoation from "../../../addQuotation/addQuoatation";
import ConfirmationDialogue2 from "../../../Ticket/components/confirmationDialog2/confirmationDialog2";

const columns = [
  {
    id: "id",
    label: "Request Id",
  },
  {
    id: "title",
    label: "Title",
  },

  {
    id: "project",
    label: "Project",
  },
  {
    id: "department",
    label: "Department",
  },
  {
    id: "user",
    label: "Raised By",
  },

  {
    id: "status",
    label: "Status",
  },
];

export default function TicketTables({
  maxHeight,
  alltickets,
  getAllTickets,
  count,
  minHeight,
  rowsperPages,
  type,
  departmentSelected,
  projectSelected,
  statusSelected,
  searchValue,
  pageNo,
  setpageNo,
  setCount,
  ticketType,
  isPagination
}) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteOpen, setDelteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [ticketToapprove, setTicketToapprove] = useState();
  const [quotationModal, setQuotationModal] = useState(false);
  const ConfirmationBoxOpen = () => setConfirmationOpen(true);
  const ConfirmationClose = () => setConfirmationOpen(false);
  const rejectBoxOpen = () => setRejectOpen(true);
  const rejectBoxClose = () => setRejectOpen(false);
  const [ticketToDelte, setTicketToDelte] = useState("");

  const handleDeleteOpen = () => {
    setDelteOpen(true);
  };
  const handleDeleteClose = () => {
    setDelteOpen(false);
    setTicketToDelte("");
  };

  /** Function that triggers when clicking next page while pagiating */
  const handleChangePage = (event, newPage) => {
    setpageNo(newPage);
    getAllTickets(
      newPage,
      rowsperPages,
      type,
      ticketType,
      searchValue,
      projectSelected,
      departmentSelected,
      "",
      statusSelected
    );
  };

  const handleChangeRowsPerPage = (event) => {
    setCount(+event.target.value);
    getAllTickets(
      0,
      +event.target.value,
      type,
      ticketType,
      searchValue,
      projectSelected,
      departmentSelected,
      "",
      statusSelected
    );
    setpageNo(0);
  };

  const ticketDelete = () => {
    deleteTicket(ticketToDelte)
      .then((res) => {
        handleDeleteClose();
        getAllTickets(
          pageNo,
          rowsperPages,
          type,
          ticketType,
          searchValue,
          projectSelected,
          departmentSelected,
          "",
          statusSelected
        );
        Swal.fire({
          title: "Success",
          text: "Ticket deleted successfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        handleDeleteClose();
        Swal.fire({
          title: "Failed",
          text: err.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  };

  /** Function to approve ticket  */
  const setLevelOfTickets = (id,data) => {
    setLevelTickets(id,data)
      .then(() => {
        Swal.fire({
          title: "Success",
          text: "Request Approved Successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });

        getAllTickets(
          pageNo,
          rowsperPages,
          type,
          ticketType,
          searchValue,
          projectSelected,
          departmentSelected,
          "",
          statusSelected
        );

        ConfirmationClose();
        rejectBoxClose();
      })
      .catch((err) => {
        ConfirmationClose();
        rejectBoxClose();
        Swal.fire({
          title: "Failed",
          text: "Failed",
          icon: "error",
          timer: 1600,
          showConfirmButton: false,
        });
      });
  };

  const onClickReject = (obj) => {
    setStatusTickets(obj)
      .then((res) => {
        ConfirmationClose();
        rejectBoxClose();
        getAllTickets(
          pageNo,
          rowsperPages,
          type,
          ticketType,
          searchValue,
          projectSelected,
          departmentSelected,
          "",
          statusSelected
        );
        Swal.fire({
          title: "Success",
          text: "Request Rejected Successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        ConfirmationClose();
        rejectBoxClose();

        Swal.fire({
          title: "Failed",
          text: "Unable to reject ticket",
          icon: "error",
          timer: 1600,
          showConfirmButton: false,
        });
      });
  };

  return (
    <div className={classes.table}>
      <Paper
        sx={{
          width: "99%",
          overflow: "hidden",
          borderRadius: "20px",
          boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px;",
        }}
      >
        <TableContainer
          sx={{ maxHeight: maxHeight - 53, minHeight: minHeight }}
        >
          <Table
            size="small"
            style={{ overflowY: "scroll" }}
            stickyHeader
            aria-label="sticky table"
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.id === "id" ? "center" : "left"}
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      maxWidth: "150px",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>
                <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>
                <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>
                {ticketType !== 0 && (
                  <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {alltickets.map((row, index) => {
                
                const isUnder = checkTicketLevel(row.level,row?.department?.departmentName);
                const ownTicket = checkOwnTicketLevel(
                  row.initialLevel,
                  row.level
                );
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {columns.map((column, indexs) => {
                      const value = row[column?.id];

                      return (
                        <TableCell
                          title={
                            column.id === "user"
                              ? value?.name
                              : column.id === "project"
                              ? value?.projectName
                              : column?.id === "department"
                              ? value?.departmentName
                              : column.id === "status"
                              ? checkTicketStatus(value,row.level)
                              : value
                          }
                          key={column?.id}
                          align={column.id === "id" ? "center" : "left"}
                          style={{
                            fontSize: "12px",
                            height: "30px",
                            maxWidth: "80px",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            color:
                              column.id === "status"
                                ? checkTicketStatusColor(value)
                                : "black",
                          }}
                        >
                          {column.id === "user"
                            ? value?.name
                            : column.id === "project"
                            ? value?.projectName
                            : column.id === "department"
                            ? value?.departmentName
                            : column.id === "status"
                            ? checkTicketStatus(value, row.level)
                            : value}
                        </TableCell>
                      );
                    })}

                    <TableCell style={{ maxWidth: 15, minWidth: 15 }}>
                      <NavLink
                        to="/requestlist/requestdetails"
                        style={{ cursor: "pointer" }}
                        state={{ ticketId: row?.id }}
                      >
                        <img
                          style={{ maxWidth: 25, minWidth: 25 }}
                          alt=""
                          src={eyeIcon}
                          title="View Ticket"
                        />
                      </NavLink>
                    </TableCell>

                    {
                      <TableCell style={{ maxWidth: 10, minWidth: 15 }}>
                        {ticketType === 0 && ownTicket && row.status !== 10 ? (
                          <img
                            alt=""
                            src={deleteIcon}
                            style={{
                              cursor: "pointer",
                              maxWidth: 28,
                              minWidth: 28,
                            }}
                            title="Delete Ticket"
                            onClick={() => {
                              setTicketToDelte(row?.id);
                              handleDeleteOpen();
                            }}
                          />
                        ) : (
                          ticketType === 1 &&
                          isUnder &&
                          row.status !== 10 && (
                            <img
                              alt=""
                              src={tick}
                              style={{
                                cursor: "pointer",
                                maxWidth: 20,
                                minWidth: 20,
                              }}
                              title="Approve Ticket"
                              onClick={() => {
                                setTicketToapprove(row?.id);
                                row.level === 4
                                  ? setQuotationModal(true)
                                  : ConfirmationBoxOpen();
                              }}
                            />
                          )
                        )}
                      </TableCell>
                    }
                    {ticketType === 1 && (
                      <TableCell style={{ maxWidth: 10, minWidth: 15 }}>
                        {isUnder && row.status !== 10 && (
                          <img
                            alt=""
                            src={close}
                            style={{
                              cursor: "pointer",
                              maxWidth: 20,
                              minWidth: 20,
                            }}
                            title="Reject Ticket"
                            onClick={() => {
                              setTicketToapprove(row.id);
                              rejectBoxOpen();
                            }}
                          />
                        )}
                      </TableCell>
                    )}
                    {
                      <TableCell style={{ maxWidth: 15, minWidth: 15 }}>
                        <NavLink
                          to="/myrequestlist/createRequest"
                          style={{ cursor: "pointer" }}
                          state={{ ticketId: row?.id }}
                        >
                          {(((ticketType === 1 && isUnder) && (row.level === 2 || row.level === 3)) ||
                            (ticketType === 0 && ownTicket)) 
                             &&
                            row.status !== 10 && (
                              <img
                                style={{
                                  cursor: "pointer",
                                  maxWidth: 25,
                                  minWidth: 25,
                                }}
                                onClick={() => {}}
                                alt=""
                                src={editIcon}
                                title="Edit Ticket"
                              />
                            )}
                        </NavLink>
                      </TableCell>
                    }
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
   { isPagination&&
 <TablePagination
      rowsPerPageOptions={[15]}
      component="div"
      count={count}
      rowsPerPage={rowsperPages}
      page={pageNo}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
   }
      </Paper>
        <ConfirmationDialogue2
          open={confirmationOpen}
          handleClose={ConfirmationClose}
          onClickApprove={async (file, comments,ticketDetails) => {
          setConfirmationOpen(false);
              if (ticketDetails?.level === 8) {
                file.append("id", ticketDetails?.id);
                file.append("forward", "1");
                file.append("comments", comments);
                setLevelOfTickets(ticketDetails?.id, file);
              } else if (ticketDetails) { 
                const data = {
                  id: ticketDetails?.id,
                  forward: "1",
                  comments: comments
                };
                setLevelOfTickets(ticketDetails?.id, data);
              }
            } 
          }
          status={"approve"}
          ticketId={ticketToapprove}
    />

      <ConfirmationDialogue2
        open={rejectOpen}
        handleClose={rejectBoxClose}
        onClickApprove={(file,comments,ticketDetails) => {
          setRejectOpen(false);
          onClickReject({ ticketId: ticketToapprove,comments:comments });
        }}
        status={"reject"}
      />
      <AddQuoation
        id={ticketToapprove}
        open={quotationModal}
        onClose={() => {
          setQuotationModal(false);
        }}
      />

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &nbsp;&nbsp;&nbsp;
          </DialogContentText>
          <DialogContentText style={{ fontWeight: 600, fontSize: "16px" }}>
            {ticketToDelte}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button onClick={ticketDelete} className={classes.confirmBtn}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const checkTicketStatus = (value, level) => {
  switch (value) {
    case 2:
      return "Approved";
    case 10:
      return "Rejected";
    default:
      switch (level) {
        case 2:
          return "Manager Verification";
        case 3:
          return "Head Verification";
        case 4:
          return "Administartion verification";
        case 5:
          return "Quotation verification";
        case 6:
          return "Finance Verification";
        case 7:
          return "CEO Verification";
        case 8:
          return "Finance Purchase Order Approval";
        default:
          return "Pending";
      }
  }
};

const checkTicketStatusColor = (value) => {
  switch (value) {
    case 2:
      return "green";
    case 10:
      return "red";
    default:
      return "orange";
  }
};

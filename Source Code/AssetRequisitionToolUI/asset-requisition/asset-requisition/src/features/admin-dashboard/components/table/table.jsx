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
import editIcon from "../../../../assets/editIcon.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { NavLink } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import getUserPermission from "../../../../common-lib/checkuser";
import { useState } from "react";
import CreateModal from "../../../create-ticket/createTicket";
import { deleteTicket } from "../../../../common-lib/services/service";
import Swal from "sweetalert2";




const columns = [
  {
    id: "pk",
    label: "Ticket ID",
  },
  {
    id: "projectcode",
    label: "Project Code",
  },
  {
    id: "projectname",
    label: "Project Name",
  },
  {
    id: "title",
    label: "Project Title",
  },
  {
    id: "device",
    label: "Asset",
  },
  {
    id: "email",
    label: "Raised By",
  },
  
  {
    id: "ticketstatus",
    label: "Status",
  },
];




export default function TicketTable({ maxHeight, alltickets, getAllTickets, lastEvaluatedKey, minHeight, isManger }) {



  const [onOpen, setOpen] = useState(false);
  const [deleteOpen, setDelteOpen] = useState(false)
  const [editTicketId, setEditTicketId] = useState("")
  const [ticketToDelte, setTicketToDelte] = useState("")
  const handleDeleteOpen = () => { setDelteOpen(true) }
  const handleDeleteClose = () => { setDelteOpen(false); setTicketToDelte("") }
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setEditTicketId(""); setOpen(false) };




  const loadMore = () => {
    getAllTickets(lastEvaluatedKey)
  }

  const ticketDelete = () => {
    deleteTicket(ticketToDelte).then((res) => {
      handleDeleteClose()
      getAllTickets()
      Swal.fire({
        title: "Success",
        text: "Ticket deleted successfully",
        icon: "success",
        timer: 2500,
        showConfirmButton: false
      })
    }).catch((err) => {
      handleDeleteClose()
      Swal.fire({
        title: "Failed",
        text: err.message,
        icon: "error",
        timer: 1700,
        showConfirmButton: false
      })
    })
  }

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
        <TableContainer sx={{ maxHeight: maxHeight, minHeight: minHeight }}>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={lastEvaluatedKey ? true : false}
            threshold={5}
            useWindow={false}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>

                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{

                        fontSize: "17px",
                        fontWeight: "600",
                        maxWidth: "150px"
                      }}
                    >
                      {column.label}


                    </TableCell>
                  ))}
                  <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>
                  {isManger && <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>}
                  {isManger && <TableCell sx={{ minWidth: 20, maxWidth: 20 }}></TableCell>}


                </TableRow>
              </TableHead>
              <TableBody>

                {alltickets
                  .map((row, index) => {
                    let isDelete = false
                    const user = getUserPermission()
                    if (user.email === row?.email && row?.level === "HEAD" && row?.ticketstatus === "PENDING" &&
                    //  user.department === row.department && 
                     user.permission === "MANAGER") {
                      isDelete = true
                    }
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {columns.map((column,indexs) => {
                          const value = row[column?.id];
                          return (
                            <TableCell title={value} key={column?.id} align={column.align} style={{ height: "30px", maxWidth: "80px", textOverflow: "ellipsis", overflow: "hidden", color: value === "PENDING" ? "orange" : value === "APPROVED" ? "green" : value === "REJECTED" ? "red" : "black" }}>
                              {(indexs=== 1 || indexs===2 || indexs===3) ?value.toUpperCase(): value}
                            </TableCell>
                          );
                        })}

                        <TableCell style={{ maxWidth: 20, minWidth: 20 }}>
                          <NavLink to="/requestlist/requestdetails" style={{ cursor: "pointer" }} state={{ ticketId: row?.pk }}><img alt="" src={eyeIcon} title="View Ticket" /></NavLink>
                        </TableCell>
                        {isManger && <TableCell style={{ maxWidth: 20, minWidth: 20 }}>
                          {isDelete && <img style={{ cursor: "pointer" }} onClick={() => {
                            setEditTicketId(row?.pk)
                            handleOpen()
                          }} alt="" src={editIcon} title="Edit Ticket" />}
                        </TableCell>}
                        {isManger && <TableCell style={{ maxWidth: 20, minWidth: 20 }}>
                          {isDelete && <img alt="" src={deleteIcon} style={{ cursor: "pointer" }} title="Delete Ticket"
                            onClick={() => {
                              setTicketToDelte(row?.pk)
                              handleDeleteOpen()
                            }} />}
                        </TableCell>}
                      </TableRow>
                    );

                  })
                }
              </TableBody>
            </Table>
          </InfiniteScroll>
        </TableContainer>
      </Paper>
      <CreateModal onOpen={onOpen} onClose={handleClose} getAllTickets={getAllTickets} editTicketId={editTicketId} />
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &nbsp;&nbsp;&nbsp;
          </DialogContentText>
          <DialogContentText style={{ fontWeight: 600, fontSize: "16px" }}>{ticketToDelte}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} className={classes.closeBtn}>Cancel</Button>
          <Button onClick={ticketDelete} className={classes.confirmBtn}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

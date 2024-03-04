import { TableVirtuoso } from "react-virtuoso";
import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import classes from "./virtualtable.module.css";
import eyeIcon from "../../../../assets/eye.svg";
import editIcon from "../../../../assets/editIcon.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import { NavLink } from "react-router-dom";
import useWindowDimensions from "../../../admin-dashboard/useWindowDimensions";
import AddAsset from "../../../add-asset/addasset";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { deleteAsset } from "../../../../common-lib/services/service";
import Swal from "sweetalert2";

const columns = [
  { id: "pk", label: "Asset Id" },
  { id: "modelNo", label: "Model No." },
  { id: "device", label: "Asset" },
  { id: "category", label: "Category" },
  { id: "expiryDate", label: "Expiry Date" },
  { id: "allocatedUser", label: "Equipped By" },
];
export default function VirtualAssetTable({
  maxHeight,
  rows,
  getAllAsset,
  getAllCategory,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClickOpen = () => setDialogOpen(true);
  const handleClickClose = () => setDialogOpen(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };
  const [assetToDelete, setAssetDelete] = useState("");
  const [assetIdtoEdit, setAssetIdtoEdit] = useState("");

  const { width } = useWindowDimensions();

  const deleteAssetbyId = () => {
    deleteAsset(assetToDelete)
      .then(() => {
        handleClose();
        Swal.fire({
          title: "Success",
          text: "Asset deleted Succesfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
        getAllAsset("total");
        getAllCategory("total");
      })
      .catch((err) => {
        handleClose();
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 1700,
          showConfirmButton: false,
        });
      });
  };
  return (
    <>
      <TableVirtuoso
        style={{
          height: maxHeight,
          maxHeight: maxHeight,
          backgroundColor: "transparent",
          width: width > 950 ? "99%" : "97.5%",
          margin: "auto",
          borderRadius: "10px",
          boxShadow: "none",
          overflowY: "scroll",
        }}
        className={classes.paper}
        data={rows}
        components={{
          Scroller: React.forwardRef((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} />
          )),
          Table: (props) => (
            <Table {...props} style={{ borderCollapse: "separate" }} />
          ),
          TableHead: TableHead,
          TableRow: TableRow,
          TableBody: React.forwardRef((props, ref) => (
            <TableBody sx={{ background: "white" }} {...props} ref={ref} />
          )),
        }}
        fixedHeaderContent={() => (
          <TableRow sx={{ background: "white" }}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{
                  fontWeight: 600,
                  minWidth: 100,
                  maxWidth: 100,
                  width: 100,
                }}
              >
                {column.label}
              </TableCell>
            ))}
            <TableCell
              sx={{ minWidth: 20, width: 20, maxWidth: 20 }}
            ></TableCell>
            <TableCell
              sx={{ minWidth: 20, width: 20, maxWidth: 20 }}
            ></TableCell>
            <TableCell
              sx={{ minWidth: 20, width: 20, maxWidth: 20 }}
            ></TableCell>
          </TableRow>
        )}
        itemContent={(index, row) => (
          <>
            {columns.map((column) => {
              const value = row[column.id];
              return (
                <TableCell
                  key={column.id}
                  sx={{
                    minWidth: 100,
                    maxWidth: 100,
                    width: 100,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  title={value}
                >
                  {value}
                </TableCell>
              );
            })}
            <TableCell sx={{ minWidth: 20, maxWidth: 20, width: 20 }}>
              {" "}
              <NavLink
                to="/asset/assetdetails"
                style={{ cursor: "pointer" }}
                state={{ assetId: row?.pk }}
              >
                <img alt="" src={eyeIcon} title="View Asset" />
              </NavLink>
            </TableCell>
            <TableCell sx={{ minWidth: 20, maxWidth: 20, width: 20 }}>
              {row.allocatedUser === "INFRA" && (
                <img
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setAssetIdtoEdit(row.pk);
                    handleOpen();
                  }}
                  alt=""
                  src={editIcon}
                  title="Edit Asset"
                />
              )}
            </TableCell>
            <TableCell sx={{ minWidth: 20, maxWidth: 20, width: 20 }}>
              {row.allocatedUser === "INFRA" && (
                <img
                  alt=""
                  src={deleteIcon}
                  style={{ cursor: "pointer" }}
                  title="Delete Asset"
                  onClick={() => {
                    setAssetDelete(row?.pk);
                    handleClickOpen();
                  }}
                />
              )}
            </TableCell>
          </>
        )}
      />
      <AddAsset
        open={open}
        onClose={handleClose}
        editAssetId={assetIdtoEdit}
        getAllAssets={getAllAsset}
        getAllCategory={getAllCategory}
      />

      <Dialog
        open={dialogOpen}
        onClose={handleClickClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Asset?</DialogTitle>
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
            {assetToDelete}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose} className={classes.closeBtn}>
            Cancel
          </Button>
          <Button
            onClick={deleteAssetbyId}
            autoFocus
            className={classes.confirmBtn}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

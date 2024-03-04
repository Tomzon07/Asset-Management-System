import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import classes from "./assettable.module.css";
import arrowLeft from "../../../../assets/arrowleft.svg"
import eyeIcon from "../../../../assets/eye.svg";
import editIcon from "../../../../assets/editIcon.svg";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import AddAsset from '../../../add-asset/addasset';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { deleteAsset } from '../../../../common-lib/services/service';
import Swal from 'sweetalert2';

const columns = [
    { id: 'pk', label: 'Asset Id' },
    { id: 'modelNo', label: 'Model No.' },
    { id: 'device', label: 'Device', },
    { id: 'expiryDate', label: 'Expiry Date', },
    { id: 'allocatedUser', label: 'Equipped By', },
];




export default function AssetTable({ maxHeight, rows, getAllAsset }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClickOpen = () => setDialogOpen(true);
    const handleClickClose = () => setDialogOpen(false);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false); };
    const [assetToDelete, setAssetDelete] = useState("")
    const [assetIdtoEdit, setAssetIdtoEdit] = useState("")


    const deleteAssetbyId = () => {
        deleteAsset(assetToDelete).then(() => {
            handleClose()
            Swal.fire({
                title: "Success",
                text: "Asset deleted Succesfully",
                icon: "success",
                timer: 2500,
                showConfirmButton: false
            })
            getAllAsset("total")
        }).catch((err) => {
            handleClose()
            Swal.fire({
                title: "Failed",
                text: err?.response?.data?.message,
                icon: "error",
                timer: 1700,
                showConfirmButton: false
            })
        })
    }
    return (
        <Paper sx={{ borderRadius: "10px" }} className={classes.paper}>
            <TableContainer sx={{ maxHeight: maxHeight, borderRadius: "10px" }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    width={150}
                                    key={column.id}
                                    align={column.align}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {column.label}
                                </TableCell>

                            ))}
                            <TableCell sx={{ minWidth: 10, maxWidth: 10 }}></TableCell>
                            <TableCell sx={{ minWidth: 10, maxWidth: 10 }}></TableCell>
                            <TableCell sx={{ minWidth: 10, maxWidth: 10 }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            /** .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)*/
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.pk}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align} className={classes.cell} sx={{ textOverflow: "ellipsis", overflow: "hidden" }} title={value} >
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell sx={{ minWidth: 10, maxWidth: 20, width: 20 }}> <NavLink to="/asset/assetdetails" style={{ cursor: "pointer" }} state={{ ticketId: row?.pk }}><img alt="" src={eyeIcon} title="View Asset" /></NavLink></TableCell>
                                        <TableCell sx={{ minWidth: 10, maxWidth: 20, width: 20 }}>{row.allocatedUser === "Infra" && <img style={{ cursor: "pointer" }} onClick={() => { setAssetIdtoEdit(row.pk); handleOpen() }} alt="" src={editIcon} title="Edit Asset" />}</TableCell>
                                        <TableCell sx={{ minWidth: 10, maxWidth: 20, width: 20 }}>{row.allocatedUser === "Infra" && <img alt="" src={deleteIcon} style={{ cursor: "pointer" }} title="Delete Asset" onClick={() => { setAssetDelete(row?.pk); handleClickOpen() }} />}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className={classes.paginationDiv}>
                <div className={classes.arrow}><img style={{ width: "25px" }} src={arrowLeft} alt="" /></div>
                <div className={classes.arrow}> <img style={{ width: "25px", rotate: "180deg" }} src={arrowLeft} alt="" /></div>
            </div>
            <AddAsset open={open} onClose={handleClose} editAssetId={assetIdtoEdit} />

            <Dialog
                open={dialogOpen}
                onClose={handleClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete Asset?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" className={classes.dialogTitle}>
                        Do you really want to delete
                    </DialogContentText>
                    <DialogContentText id="alert-dialog-description" style={{ color: "black" }}>
                        {assetToDelete}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickClose} className={classes.closeBtn}>Cancel</Button>
                    <Button onClick={deleteAssetbyId} autoFocus className={classes.confirmBtn}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

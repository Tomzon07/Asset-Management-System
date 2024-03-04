import classes from "./returnAsset.module.css"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { returnAsset } from "../../../common-lib/services/service";
import Swal from "sweetalert2";

const ReturnAssetDialog = ({
  open,
  onClose,
  ticketId,
  getAssetById,
  assetId,
}) => {
  const handleReturn = () => {
    returnAsset(ticketId)
      .then((res) => {
        onClose();
        getAssetById(assetId);
        Swal.fire({
          title: "Success",
          text: "Asset returned successfully",
          icon: "success",
          timer: 2500,
          showConfirmButton: false
      })
      })
      .catch((err) => {
        Swal.fire({
          title: "Failed",
          text: err?.response?.data?.message,
          icon: "error",
          timer: 2000,
          showConfirmButton: false
      })
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Return Asset</DialogTitle>
      <DialogContent>
        <p>Are you sure you want to return this asset?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className={classes.closeBtn}>Cancel</Button>
        <Button onClick={handleReturn} className={classes.confirmBtn}>Return</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnAssetDialog;

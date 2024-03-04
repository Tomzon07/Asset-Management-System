import classes from '../confirmationDIalogue/confirmation.module.css'
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { getTicketById } from '../../../../common-lib/services/service';

const ConfirmationDialogue = ({
  open,
  handleClose,
  onClickApprove,
  status,
  disabled,
  ticketId,
}) => {


  const [comments, setComments] = useState('');
  const [commentError, setCommentError] = useState('');
  const [file, setFile] = useState({});
  const [fileError, setFileError] = useState('');
  const [ticketDetails,setTicketDetails]=useState({})

  const handleCommentChange = (event) => {
    const value = event.target.value;
    setComments(value);
    setCommentError(validateComment(value));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileError(validateFile(selectedFile));
  };

  const validateComment = (value) => {
    if (!value) {
      return 'Comment is required';
    }
    if (!/^\S(.*\S)?$/.test(value)) {
      return 'Enter a valid comment';
    }
    if (value.length > 100) {
      return 'Comment should be at most 100 characters';
    }
    return '';
  };

  const validateFile = (file) => {
    if (!file) {
      return 'Purchase Order is required';
    }
    if (file.size > 1048576) {
      return 'File size should be less than 1 MB';
    }
    return '';
  };

  const getTicket=()=>{
    if(!ticketId){
      return ""
    }
    getTicketById(ticketId).then((res)=>{
      const ticketData=res.data
      setTicketDetails(ticketData)
    }).catch((err)=>{

    })
  }
  

  useEffect(() => {
    if (open) {
      getTicket();
    }
  }, [open])

  const handleConfirm = () => {
    const commentError = validateComment(comments);
    const fileError = validateFile(file);

    if (ticketDetails?.level === 8) {
      if (commentError === "" && fileError === "") {
        const formData = new FormData();
        formData.append("files",file)
        onClickApprove(formData, comments,ticketDetails); 
      } else {
        setCommentError(commentError);
        setFileError(fileError);
      }
    } else {
      if (commentError === "") {
        onClickApprove(null,comments,ticketDetails);
      } else {
        setCommentError(commentError);
      }
    }
  };
  


  
  
  useEffect(() => {
    setCommentError('');
    setComments('');
    setFile(null);
    setFileError('');
  }, [open]);


  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        {
        ticketDetails?.level === 8 && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <label htmlFor="purchase-order" className={classes.label}>
                Purchase Order
              </label>
              <input
                type="file"
                id="purchase-order"
                onChange={handleFileChange}
                style={{ marginTop: '5px' }}
                className={classes.file}
              />
              {fileError && <p className={classes.error}>{fileError}</p>}
            </div>
            <br />
          </>
        )}
        <DialogContentText>
          Are you sure you want to {status} this request?
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Comment"
          fullWidth
          variant="standard"
          value={comments}
          onChange={handleCommentChange}
          error={commentError !== ''}
          helperText={commentError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} className={classes.closeBtn}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={disabled} className={classes.confirmBtn}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialogue

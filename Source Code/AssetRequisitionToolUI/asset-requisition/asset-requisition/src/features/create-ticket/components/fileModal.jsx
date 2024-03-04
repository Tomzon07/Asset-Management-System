import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./fileModal.module.css";
import closeIcon from "../../../assets/closeIcon.svg";
import { Button } from "@mui/material";
import {
  getTicketById,
  fileDelete,
} from "../../../common-lib/services/service";
import { useLocation } from "react-router-dom";
import { useEffect,useState} from "react";
import Swal from "sweetalert2";
import DeleteIcon from "../../../assets/fileClose.svg";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function FileModal({ selectedFiles,setSelectedFiles }) {
  const [files, setFiles] = React.useState([]);
  const [openFileModal, setOpenFileModal] = React.useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  const [limit, setLimit] = useState(5);
  const [error,setError]=useState("")
  const location = useLocation();
  const ticketId = location?.state?.ticketId;

  const handleOpenFileModal = () => {
    setOpenFileModal(true);
  };

  const handleCloseFileModal = () => {
    setFiles([]);
    setOpenFileModal(false);
    setError("")
  };

  useEffect(() => {
    ticketId && getExistingFiles();
  }, [openFileModal]);

  useEffect(() => {
    setFiles(selectedFiles)
  }, [selectedFiles,openFileModal]);

  const getExistingFiles = () => {
    getTicketById(ticketId).then((res) => {

      let data = res.data.files;
      setExistingFiles([...data]);
    });
  };

  useEffect(() => {
    setLimit(5 - existingFiles?.length);
  }, [existingFiles]);

  function uploadImages(e) {
    setError("")
    let imgs = [];
    let counter = 0;
    if (e.target.files.length > 5) {
    setError("Maximum file limit exceeded. Please select up to 5 files.")
      return;
    }
    if (e.target.files.length > limit - files.length) {
    setError("Maximum file limit exceeded. Please select up to 5 files.")
      return;
    }
    for (const images of e.target.files) {
      const fileSize = images.size / 1024 / 1024; 
      if (fileSize > 1) {
      setError("File size must be less than 1MB")
      } else {
        if (!files.some((f) => f.name === images.name)) {
          counter++;
          imgs.push(images);
        }
      }
    }
    setFiles([...files, ...imgs]);
    document.getElementById("addFile").value = "";
  }

  const deleteExistingFile = (id) => {
    fileDelete(id)
      .then(() => {
        getExistingFiles();
      })
      .catch((error) => {});
  };

  function deleteFile(e, id) {
    const s = files.filter((item, index) => index !== e);
    setFiles(s);
    setSelectedFiles(s)
    setError("")
  }

  const handleSave = () => {
    setSelectedFiles([...files]);
    setOpenFileModal(false);
    setError("")
  };

  return (
    <>
      <button
        onClick={handleOpenFileModal}
        type="button"
        value="cancel"
        style={{
          width: "100%",
          border: "1px solid #b5b5b5",
          borderRadius: "7px",
          height: "45px",
          background: "white",
          fontSize: "17px",
          fontStyle: "inherit",
          cursor: "pointer",
          textAlign:"start",
          padding:"1px 15px"
        }}
      >
      {ticketId ? "View files..." : "Choose files..."}
      </button>
      <Modal open={openFileModal} onClose={handleCloseFileModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            minHeight: "auto",
            minWidth: "430px",
            maxHeight: "455px",
          }}
        >
          <div className={classes.titleDiv}>
            <p className={classes.modalTitle}>Upload Files</p>
            <img
              src={closeIcon}
              alt=""
              style={{ margin: "20px", cursor: "pointer" }}
              className={classes.closeButton}
              onClick={handleCloseFileModal}
            />
          </div>
          <div
            className={classes.modalList}
          >
            <div
              className={classes.modalContent}
              style={{ maxHeight: "300px", margin: "10px" }}
            >
              {existingFiles?.length > 0 &&
                existingFiles?.map((item) => {
                  return (
                    <div className={classes.listAlign}>
                    <li
                      className={classes.li}
                      key={item.id}
                      style={{ display: "flex" }}
                    >
                      {item.filePath}
                      <div>
                      <DeleteForeverIcon 
                         title="Delete File"
                          className={classes.delete}
                          onClick={() => {
                            deleteExistingFile(item.id);
                          }}
                        />
                      </div>
                    </li>
                    </div>
                  );
                })}

              {files?.length > 0 &&
                files?.map((item, index) => {
                  return (
                    <div className={classes.listAlign}>
                    <li
                      className={classes.li}
                      key={item.name}
                      style={{ display: "flex" }}
                      >
                      {item.name}
                      <div>
                        <DeleteForeverIcon 
                         title="Delete File"
                         className={classes.delete}
                          onClick={() => {
                            deleteFile(index);
                          }}
                        />
                      </div>
                    </li>
                    </div>
                  );
                })}
<label class="file">
              <input
                className={classes.chooseimage}
                style={{width:"165px"}}
                type="file"
                id="addFile"
                multiple
                title=""
                disabled={files?.length === limit}
                onChange={uploadImages}
              />
<span class="file-custom"></span>
</label>
            </div>
              { error? <p className={classes.error}> {error}</p> :""}
           
            <Button
              variant="contained"
              component="span"
              style={{
                width: "100%",
                borderRadius: "5px",
                backgroundColor: "#4565ac",
                marginTop:"4px"
              }}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}

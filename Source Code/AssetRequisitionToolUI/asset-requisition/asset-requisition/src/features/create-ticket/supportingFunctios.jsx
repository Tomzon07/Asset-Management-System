import { getCategoryList, getDeviceList, getTicketById } from "../../common-lib/services/service";

  /**get device list based on the change in category list drop down */
export function getDeviceLists(e, setAllDevice, otherdevices, setValue, clearErrors, setIsDeviceName) {
    const selectedCategory = e?.target?.value;
    if (selectedCategory === "OTHER") {
      setAllDevice(otherdevices);
      setValue("device", "OTHER");
      clearErrors("device");
      setIsDeviceName(true);
    } else {
      setValue("deviceName", "");
      getDeviceList(selectedCategory)
        .then((res) => {
          const objs = ["OTHER"];
          const jo = [...res?.data, ...objs];
          setAllDevice(jo);
        });
      setValue("device", "");
      setIsDeviceName(false);
    }
  }
/** get ticket details to edit by passing id  */
  export function getTicketDetailById(editTicketId, setIsSpinner, setAllCategory, setAllDevice, otherdevices, setIsDeviceName, setFormValue) {
    if (editTicketId) {
      setIsSpinner(true);
      getCategoryList()
        .then((res) => {
          const objs = ["OTHER"];
          const jo = [...res?.data, ...objs];
          setAllCategory(jo);
        })
        .then(() => {
          getTicketById(editTicketId).then((res) => {
            const data = res.data.Item;
            if (data?.category === "OTHER") {
              setAllDevice(otherdevices);
              setIsDeviceName(true);
              setIsSpinner(false);
              setFormValue(data, 0);
            } else {
              getDeviceList(data.category)
                .then((response) => {
                  const objs = ["OTHER"];
                  const aldevice = [...response?.data, ...objs];
                  setAllDevice(aldevice);
                  setAllDevice(aldevice);
                  setFormValue(data, 10);
                })
                .catch((err) => {
                  setIsSpinner(false);
                });
            }
          });
        });
    }
  }
/** Function triggers when select file fo create ticket */
  export function fileSelection(event, setSelectedFile, setFileError) {
    event.target.files.length !== 0
      ? setSelectedFile(event.target.files[0])
      : setSelectedFile();
    if (event.target.files.length !== 0) {
      if (event.target.files[0].size > 1000000)
        setFileError("File size must less than 1MB");
      else {
        setFileError("");
      }
    }
  }
  
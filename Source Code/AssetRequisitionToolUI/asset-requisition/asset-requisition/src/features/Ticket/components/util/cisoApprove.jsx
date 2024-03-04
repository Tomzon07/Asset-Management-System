   /** Function used append files uploaded by ciso head to formdata and call setlevel function */
export function cisoApprove(selectedFile, formData, ticketDetails, error, setLevelOfTickets, setError) {
    return () => {
      if (selectedFile) {
        formData.append("pk", ticketDetails.pk);
        formData.append("sk", ticketDetails.sk);
        formData.append("ticketFile", selectedFile);
        error === "" && setLevelOfTickets(formData);
      } else {
        setError("Please select file");
      }
    };
  }
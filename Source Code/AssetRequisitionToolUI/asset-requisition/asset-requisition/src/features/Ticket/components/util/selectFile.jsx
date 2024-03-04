  /** Function set file that selected by ciso head  */
export function selectFile(setError, setSelectedFile) {
    return (event) => {
      setError("");
      event.target.files.length !== 0
        ? setSelectedFile(event.target.files[0])
        : setSelectedFile("");
      if (event.target.files.length !== 0) {
        if (event.target.files[0].size > 1000000) {
          setError("Maxmum size allowed is 1 MB");
        }
      } else {
        setError("");
      }
    };
  }
  
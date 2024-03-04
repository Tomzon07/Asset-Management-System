const getUserPermission = () => {
  let CryptoJS = require("crypto-js");
  const secretPass = "XkhZG4fW2t2W";
  const role = localStorage.getItem("role");

  try {
    const bytes = CryptoJS.AES.decrypt(role, secretPass);
    const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (data?.department && data?.permission && data.email) {
      return data;
    } else {
      localStorage.clear();
      window.location.replace("/login");
    }
  } catch (err) {
    localStorage.clear();
    window.location.replace("/login");
  }
};

export default getUserPermission;

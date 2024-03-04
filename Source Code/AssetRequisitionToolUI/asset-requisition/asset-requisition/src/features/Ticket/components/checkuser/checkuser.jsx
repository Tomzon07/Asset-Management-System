const checkUser=(userdata, ticketDetails)=>{
    let role = false;
    let ifInfra=false;
    let ifCiso=false;
    if (
      userdata?.department === "INFRASTRUCTURE" &&
      ticketDetails?.level === "INFRASTRUCTURE" &&
      userdata?.permission === "HEAD" &&
      ticketDetails?.ticketstatus === "PENDING"
    ) {
      role = true;
      ifInfra=true;
    } else if (
      userdata?.department === "CISO" &&
      ticketDetails?.level === "CISO" &&
      userdata?.permission === "HEAD" &&
      ticketDetails?.ticketstatus === "PENDING"
    ) {
      ifCiso=true;
      role = true;
    } else if (
      userdata?.department === "FINANCE" &&
      ticketDetails?.level === "FINANCE" &&
      userdata?.permission === "HEAD" &&
      ticketDetails?.ticketstatus === "PENDING"
    ) {
      role = true;
    } else if (
      userdata?.permission === "HEAD" &&
      userdata?.department === ticketDetails.department &&
      ticketDetails?.level === "HEAD" &&
      ticketDetails?.ticketstatus === "PENDING"
    ) {
      role = true;
    }
  
    return {role:role,ifInfra:ifInfra,ifCiso};
  }

  export default checkUser
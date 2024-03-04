import React, { useEffect, useState } from "react";
import { getHistory } from "../../../../common-lib/services/service";
import Classes from "../TicketHistory/TicketHistory.module.css"
import LoadingScreen from "../../../../common-lib/loadingscreen/loadingscreen";


const TicketHistory=({ticketDetails})=>{
  const [historyDetail,setHistoryDetail]=useState("");
  const [isLoading, setIsLoading] = useState(false);

    const getHistoryFunction=()=>{
      const ticketId= ticketDetails?.id
      if (!ticketId) {
        // ticketId is not available, so skip the API call
        setIsLoading(false);
        return;
      }
      setIsLoading(true)

      getHistory(ticketId)
        .then(response => {
          setIsLoading(false)
          setHistoryDetail(response?.data);
        })
        .catch(error => {
          setIsLoading(false)
        });
    }

/** useEffect is for call the get ticket history details api */

    useEffect(() => {
      if(ticketDetails){
        getHistoryFunction()
      }
    }, [ticketDetails]); 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
return(
  <>

  {isLoading && <LoadingScreen />}
{
historyDetail && historyDetail?.map((Item, index) => (
        <div key={index} className={Classes.historyView}>
        <p className={Classes.display}>
            <span className={`${Classes.dot} ${Item?.status !== "rejected" ? Classes.greenDot : Classes.redDot}`}></span> &nbsp;
              {Item?.status?.charAt(0).toUpperCase() + Item?.status?.slice(1)}
             {Item?.user != null ? ` by ${Item?.user?.name.charAt(0).toUpperCase() + Item?.user?.name.slice(1)}` : ''}
          </p>
          {Item?.comments ? <p className={Classes.display2}>{Item.comments && Item.comments.charAt(0).toUpperCase() + Item.comments.slice(1)}</p> : null}
          <p style={{color:"grey"}} className={Classes.display3}>{formatDate(Item?.updatedAt)}</p>

        </div>
      ))}

  </>

)


}
export default TicketHistory;
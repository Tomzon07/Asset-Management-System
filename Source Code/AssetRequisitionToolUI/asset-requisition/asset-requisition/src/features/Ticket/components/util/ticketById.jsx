import { getTicketById } from "../../../../common-lib/services/service";
import checkTicketLevel from "../../../admin-ticketlist/components/util/checkticketlevel";
import stepperValuesSet from "./stepperValuesSet";
 
/** This function used to get current ticket details by passing current ticket Id by calling getTicketById api function */
export function ticketById(getNotification, location, setIsLoading, setIsForward, setTicketDetails,setRole) {
    return () => {
      const ticketId = location?.state?.ticketId;
      if (ticketId) {
        setIsLoading(true);
        getTicketById(ticketId)
          .then((res) => {
            setTicketDetails(res?.data);
                        const role= checkTicketLevel(res?.data?.level,res?.data?.departmentName)
            setRole(role)
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
          });
      }
    };
  }
  
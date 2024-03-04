import { Step, StepLabel, Stepper } from "@mui/material";
import {  useState, useEffect } from "react";
import useWindowDimensions from "../../../admin-dashboard/useWindowDimensions";
import  "../../ticketdetails.css"
import stepperValuesSet from "../util/stepperValuesSet";

const StepperVertical = ({ ticketDetails }) => {
  const { width } = useWindowDimensions();
  const [level, setLevel] = useState(0);
  const [stepperValues, setStepperValues] = useState([]);

  useEffect(() => {
    const levels= stepperValuesSet(ticketDetails.level,ticketDetails.permission)
    setStepperValues(levels?.values)
    setLevel(levels?.activeStep)
  }, [ticketDetails]);


  return (
    <>
      <Stepper
        activeStep={level}
        orientation="vertical"
        style={{
          display: width > 550 ? "none" : "block",
          marginRight: "30px",
          marginTop: "10px",
        }}
      >
        {stepperValues.map((value) => (
          <Step key={value.id}>
            <StepLabel>{value.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  );
};

export default StepperVertical;

import { Step, StepLabel, Stepper } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import useWindowDimensions from "../../../admin-dashboard/useWindowDimensions";
import classes from "../../ticketdetails.module.css";
import stepperValuesSet from "../util/stepperValuesSet";

const StepperComponent = ({ ticketDetails }) => {

  const { width } = useWindowDimensions();
  const [level, setLevel] = useState(0);
  const divRef = useRef();
  const [stepperValues, setStepperValues] = useState([]);

  useEffect(() => {
    const levels= stepperValuesSet(ticketDetails.level,ticketDetails.permission)
    setStepperValues(levels?.values)
    setLevel(levels?.activeStep)
    divRef.current.scrollLeft = divRef.current.scrollWidth;
  }, [ticketDetails]);


  return (
    <>
      <div
        
        style={{
          width: "100%",
          height: "130px",
          display: width <= 550 ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        <div style={{ width: "100%" }}>
          <Stepper
            alternativeLabel
            activeStep={level}
            sx={{
              width: "100%",
              cursor: "default",
            }}
            className={classes.stepper}
            ref={divRef}
          >
            {stepperValues.map((value) => {
              return (
                <Step key={value.id}>
                  <StepLabel>{value.label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </div>
      </div>
      
    </>
  );
};

export default StepperComponent;



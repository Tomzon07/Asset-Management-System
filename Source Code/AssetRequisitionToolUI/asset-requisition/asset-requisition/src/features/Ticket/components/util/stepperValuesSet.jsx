const stepperValuesSet = (level, permission) => {
  const user = permission;
  let stepperValues;
  let activeStep;

  switch (user) {
    case "1":
      stepperValues = {
        values: [
          { id: 1, label: "Employee" },
          { id: 2, label: "Manager" },
          { id: 3, label: "Dept. Head" },
          { id: 4, label: "Administration" },
          { id: 5, label: "Dept. Head" },
          { id: 6, label: "Finance" },
          { id: 7, label: "CEO" },
          { id: 8, label: "Finance" },
          { id: 9, label: "Adminstration" },
          {id:10,label:"Approved"}
        ],
      };

      switch (level) {
        case 1:
          activeStep = { activeStep: 0 };
          break;
        case 2:
          activeStep = { activeStep: 1 };
          break;
        case 3:
          activeStep = { activeStep: 2 };
          break;
        case 4:
          activeStep = { activeStep: 3 };
          break;
        case 5:
          activeStep = { activeStep: 4 };
          break;
        case 6:
          activeStep = { activeStep: 5 };
          break;
        case 7:
          activeStep = { activeStep: 6 };
          break;
        case 8:
          activeStep = { activeStep: 7 };
          break;
        case 9:
          activeStep = { activeStep: 10 };
          break;
        default:
          activeStep = { activeStep: 0 };
      }

      Object.assign(stepperValues, activeStep);
      return stepperValues;
    case "2":
      stepperValues = {
        values: [
          { id: 1, label: "Manager" },
          { id: 2, label: "Dept. Head" },
          { id: 3, label: "Administration" },
          { id: 4, label: "Dept. Head" },
          { id: 5, label: "Finance" },
          { id: 6, label: "CEO" },
          { id: 7, label: "Finance" },
          { id: 8, label:"Adminstration"},
          { id: 9, label: "Approved" },
        ],
      };
      switch (level) {
        case 2:
          activeStep = { activeStep: 0 };
          break;
        case 3:
          activeStep = { activeStep: 1 };
          break;
        case 4:
          activeStep = { activeStep: 2 };
          break;
        case 5:
          activeStep = { activeStep: 3 };
          break;
        case 6:
          activeStep = { activeStep: 4 };
          break;
        case 7:
          activeStep = { activeStep: 5 };
          break;
        case 8:
          activeStep = { activeStep: 6 };
          break;
        case 9:
          activeStep = { activeStep: 9 };
          break;
        default:
          activeStep = { activeStep: 0 };
      }

      Object.assign(stepperValues, activeStep);
      return stepperValues;
    case "3":
      stepperValues = {
        values: [
          { id: 1, label: "Dept. Head" },
          { id: 2, label: "Administration" },
          { id: 3, label: "Dept. Head" },
          { id: 4, label: "Finance" },
          { id: 5, label: "CEO" },
          { id: 6, label: "Finance" },
          { id: 7, label: "Adminstration" },
          { id: 8, label: "Approved" },
        ],
      };
      switch (level) {
        case 3:
          activeStep = { activeStep: 0 };
          break;
        case 4:
          activeStep = { activeStep: 1 };
          break;
        case 5:
          activeStep = { activeStep: 2 };
          break;
        case 6:
          activeStep = { activeStep: 3 };
          break;
        case 7:
          activeStep = { activeStep: 4 };
          break;
        case 8:
          activeStep = { activeStep: 5 };
          break;
          case 9:
          activeStep = { activeStep: 8 };
          break;
        default:
          activeStep = { activeStep: 0 };
      }

      Object.assign(stepperValues, activeStep);
      return stepperValues;
    case "4":
      stepperValues = {
        values: [
          { id: 1, label: "CEO" },
          { id: 2, label: "Administration" },
          { id: 3, label: "CEO" },
          { id: 4, label: "Finance" },
          { id: 5, label: "CEO" },
          { id: 6, label: "Finance" },
          { id: 7, label:"Adminstration"},
          { id: 8, label: "Approved" },
        ],
      };
      switch (level) {
        case 3:
          activeStep = { activeStep: 0 };
          break;
        case 4:
          activeStep = { activeStep: 1 };
          break;
        case 5:
          activeStep = { activeStep: 2 };
          break;
        case 6:
          activeStep = { activeStep: 3 };
          break;
        case 7:
          activeStep = { activeStep: 4 };
          break;
        case 8:
          activeStep = { activeStep: 5 };
          break;
        case 9:
          activeStep = { activeStep: 8 };
          break;
        default:
          activeStep = { activeStep: 0 };
      }

      Object.assign(stepperValues, activeStep);
      return stepperValues;
    default:
      return { values: [] };
  }
};

export default stepperValuesSet;

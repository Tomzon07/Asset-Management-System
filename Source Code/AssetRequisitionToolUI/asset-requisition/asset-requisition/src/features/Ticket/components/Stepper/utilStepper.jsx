export function stepperSet(setStepperValues, forwardedValue, setLevel) {
    return (forward, ticketlevel, ticketstatus) => {
      if (forward === "TRUE") {
        setStepperValues(forwardedValue);
        if (ticketstatus === "APPROVED") {
          setLevel(8);
        } else {
          switch (ticketlevel) {
            case "CISO":
              setLevel(3);
              return;
            case "FINANCE":
              setLevel(4);
              return;
            case "INFRASTRUCTURE":
              setLevel(5);
              return;
            default:
              setLevel(0);
          }
        }
      } else if (ticketstatus === "APPROVED") {
        setLevel(4);
      } else {
        switch (ticketlevel) {
          case "HEAD":
            setLevel(1);
            return;
          case "INFRASTRUCTURE":
            setLevel(2);
            return;
          default:
            setLevel(0);
        }
      }
    };
  }

  const initialStepperValue = [
    { id: 1, label: "Ticket Raised" },
    { id: 2, label: "Dept Head" },
    { id: 3, label: "Infra" },
    { id: 4, label: "Allocation" },
  ];
  const forwardedValue = [
    { id: 1, label: "Ticket Raised" },
    { id: 2, label: "Dept Head" },
    { id: 3, label: "Infra" },
    { id: 4, label: "Ciso" },
    { id: 5, label: "Finance" },
    { id: 6, label: "Infra" },
    { id: 7, label: "Allocation" },
  ];

  export {initialStepperValue,forwardedValue}
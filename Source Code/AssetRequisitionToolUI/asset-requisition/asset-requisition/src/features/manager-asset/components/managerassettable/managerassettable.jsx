import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { TableVirtuoso } from "react-virtuoso";
import useWindowDimensions from "../../../admin-dashboard/useWindowDimensions";

import classes from "./managerAssettable.module.css";

const columns = [
  { id: "pk", label: "Asset Id" },
  { id: "modelNo", label: "Model No." },
  { id: "device", label: "Asset" },
  { id: "expiryDate", label: "Expiry Date" },
  { id: "ticketId", label: "Ticket Id" },
];

const ManagerAssetTable = ({ assets, maxHeight }) => {
  const { width } = useWindowDimensions();


  return (
    <>
      <TableVirtuoso
        style={{
          height: maxHeight,
          backgroundColor: "transparent",
          width: width > 950 ? "99%" : "97.5%",
          margin: "auto",
          borderRadius: "10px",
          boxShadow: "none",
          overflowY: "scroll",
        }}
        className={classes.paper}
        data={assets}
        components={{
          Scroller: React.forwardRef((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} />
          )),
          Table: (props) => (
            <Table {...props} style={{ borderCollapse: "separate" }} />
          ),
          TableHead: TableHead,
          TableRow: TableRow,
          TableBody: React.forwardRef((props, ref) => (
            <TableBody sx={{ background: "white" }} {...props} ref={ref} />
          )),
        }}
        fixedHeaderContent={() => (
          <TableRow sx={{ background: "white" }}>
            {columns.map((column) => (
              <TableCell
                className={classes.cell}
                key={column.id}
                align={column.align}
                sx={{ fontWeight: 600 }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        )}
        itemContent={(index,row) => (
          <>
            {columns.map((column, index) => {
              const value = row[column.id];
              return (
                <TableCell
                  key={index}
                  className={classes.cell}
                  sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                  title={value}
                >
                  {value}
                </TableCell>
              );
            })}
          </>
        )}
      />
    </>
  );
};

export default ManagerAssetTable;

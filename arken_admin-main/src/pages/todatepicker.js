import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const styles = {
  container: {
    position: "relative",
  },
  searchWrap: {
    position: "absolute",
    left: "2%",
    top: "50%",
    transform: "translateY(-50%)",
    width: "38px",
    height: "37px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#536DFE",
  },
  icon: {
    color: "#fff",
    fontSize: "15px",
  },
  input: {
    border: "none",
    outline: "none",
    background: "rgb(49 50 55)",
    borderRadius: "6px",
    padding: "11px 18px 11px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    width: "100%",
    colorScheme: "light",
  },
  placeholder: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9e9e9e",
    pointerEvents: "none",
    fontSize: "14px",
  },
  hideNative: {
    color: "transparent",
  },
  showValue: {
    color: "#fff",
  },
};

const ToDatePicker = ({ onSearch, placeholder = "DD-MM-YYYY", fromDate }) => {
  const [toDate, setToDate] = useState("");

  const handleChange = (value) => {
    setToDate(value);
    onSearch(value);
  };

  return (
    <div style={styles.container}>
      <input
        type="date"
        min={fromDate || ""}
        value={toDate}
        onChange={(e) => handleChange(e.target.value.replace(/^\s+/, ""))}
        style={{
          ...styles.input,
          ...(toDate ? styles.showValue : styles.hideNative),
        }}
      />
      {!toDate && <span style={styles.placeholder}>{"To Date"}</span>}
    </div>
  );
};

export default ToDatePicker;

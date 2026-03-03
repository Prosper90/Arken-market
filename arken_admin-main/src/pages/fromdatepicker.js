import React, { useState } from "react";

const styles = {
  container: {
    position: "relative",
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

const FromDatePicker = ({ onSearch, placeholder = "DD-MM-YYYY" }) => {
  const [fromDate, setFromDate] = useState("");

  const handleChange = (value) => {
    setFromDate(value);
    onSearch(value);
  };

  return (
    <div style={styles.container}>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => handleChange(e.target.value.replace(/^\s+/, ""))}
        style={{
          ...styles.input,
          ...(fromDate ? styles.showValue : styles.hideNative),
        }}
      />
      {!fromDate && <span style={styles.placeholder}>{"From Date"}</span>}
    </div>
  );
};

export default FromDatePicker;

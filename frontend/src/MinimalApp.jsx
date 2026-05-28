import React from "react";

function MinimalApp() {
  return React.createElement(
    "div",
    {
      style: {
        backgroundColor: "red",
        color: "white",
        padding: "50px",
        fontSize: "30px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    "MINIMAL REACT APP - IF YOU SEE THIS, REACT IS WORKING!"
  );
}

export default MinimalApp;

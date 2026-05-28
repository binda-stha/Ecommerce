import React from "react";

function WorkingApp() {
  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      },
    },
    [
      React.createElement(
        "h1",
        {
          key: "title",
          style: {
            textAlign: "center",
            fontSize: "3rem",
            margin: "0 0 2rem 0",
          },
        },
        "🛒 Binda Trade"
      ),
      React.createElement(
        "div",
        {
          key: "subtitle",
          style: {
            textAlign: "center",
            fontSize: "1.5rem",
            marginBottom: "3rem",
          },
        },
        "Multi-Vendor E-commerce Platform"
      ),
      React.createElement(
        "div",
        {
          key: "content",
          style: {
            background: "rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "2rem",
            textAlign: "center",
          },
        },
        [
          React.createElement(
            "h2",
            { key: "welcome" },
            "🎉 Welcome to Binda Trade!"
          ),
          React.createElement(
            "p",
            { key: "desc", style: { fontSize: "1.2rem", margin: "1rem 0" } },
            "Your one-stop shop for everything you need"
          ),
          React.createElement(
            "div",
            {
              key: "buttons",
              style: {
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "2rem",
              },
            },
            [
              React.createElement(
                "button",
                {
                  key: "shop",
                  style: {
                    background: "#28a745",
                    color: "white",
                    padding: "1rem 2rem",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    cursor: "pointer",
                  },
                },
                "🛍️ Start Shopping"
              ),
              React.createElement(
                "button",
                {
                  key: "login",
                  style: {
                    background: "#007bff",
                    color: "white",
                    padding: "1rem 2rem",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    cursor: "pointer",
                  },
                },
                "👤 Login"
              ),
            ]
          ),
        ]
      ),
    ]
  );
}

export default WorkingApp;

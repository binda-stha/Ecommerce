import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import SimpleTest from "./pages/SimpleTest";
import ConnectionTest from "./pages/ConnectionTest";

function App() {
  return (
    <div
      className="App"
      style={{ minHeight: "100vh", background: "lightblue" }}
    >
      <div
        style={{ padding: "20px", background: "yellow", marginBottom: "20px" }}
      >
        <h1>APP IS RENDERING - Navigation Test</h1>
        <a href="/simple-test" style={{ marginRight: "20px" }}>
          Simple Test
        </a>
        <a href="/connection-test">Connection Test</a>
      </div>
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{ padding: "20px", background: "green", color: "white" }}
              >
                <h2>HOME PAGE LOADED</h2>
              </div>
            }
          />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
import BasraGame from "./BasraGame";

function App() {
  return <BasraGame />;
}

export default App;

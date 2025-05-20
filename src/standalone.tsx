import React from "react";
import ReactDOM from "react-dom/client";
import { BenchScene } from "./utility/mockData";
import App from "./app";
import "./style.css"

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App data={BenchScene} />
    </React.StrictMode>
);

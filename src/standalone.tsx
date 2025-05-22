import React from "react";
import ReactDOM from "react-dom/client";
import { BenchScene, BenchTopic } from "./utility/mockData";
import App from "./app";
import "./style.css"

import("../dev/scss/style.scss");
import("@fortawesome/fontawesome-free/css/all.min.css");

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App scene={BenchScene} topic={BenchTopic} />
    </React.StrictMode>
);
